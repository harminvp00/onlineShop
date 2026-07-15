import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import API from "../api/api";

export interface Address {
  id: number;
  customerId: number;
  addressLine: string;
  city: string;
  state: string;
  country: string;
  addressType: string;
  postalCode: string | null;
}

interface AddressState {
  addresses: Address[];
  activeAddress: Address | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AddressState = {
  addresses: [],
  activeAddress: null,
  isLoading: false,
  error: null,
};

export const fetchAddresses = createAsyncThunk(
  "addresses/fetchAddresses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get("/addresses");
      return response.data.addresses as Address[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch addresses"
      );
    }
  }
);

export const addAddress = createAsyncThunk(
  "addresses/addAddress",
  async (addressData: Omit<Address, "id" | "customerId" | "country"> & { country?: string }, { rejectWithValue }) => {
    try {
      const response = await API.post("/addresses", addressData);
      return response.data.address as Address;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add address"
      );
    }
  }
);

export const updateAddress = createAsyncThunk(
  "addresses/updateAddress",
  async ({ id, addressData }: { id: number; addressData: Partial<Address> }, { rejectWithValue }) => {
    try {
      const response = await API.put(`/addresses/${id}`, addressData);
      return response.data.address as Address;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update address"
      );
    }
  }
);

export const deleteAddress = createAsyncThunk(
  "addresses/deleteAddress",
  async (id: number, { rejectWithValue }) => {
    try {
      await API.delete(`/addresses/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete address"
      );
    }
  }
);

const addressSlice = createSlice({
  name: "addresses",
  initialState,
  reducers: {
    setActiveAddress: (state, action: PayloadAction<Address | null>) => {
      state.activeAddress = action.payload;
      if (action.payload) {
        localStorage.setItem("activeAddressId", action.payload.id.toString());
      } else {
        localStorage.removeItem("activeAddressId");
      }
    },
    clearAddressError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Addresses
      .addCase(fetchAddresses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.addresses = action.payload;
        state.isLoading = false;
        
        // Restore active address from localStorage
        const storedId = localStorage.getItem("activeAddressId");
        if (storedId) {
          const matched = action.payload.find((a) => a.id.toString() === storedId);
          if (matched) {
            state.activeAddress = matched;
            return;
          }
        }
        
        // Default to first address if none is active
        if (action.payload.length > 0 && !state.activeAddress) {
          state.activeAddress = action.payload[0];
          localStorage.setItem("activeAddressId", action.payload[0].id.toString());
        } else if (action.payload.length === 0) {
          state.activeAddress = null;
        }
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add Address
      .addCase(addAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.addresses.push(action.payload);
        state.isLoading = false;
        if (!state.activeAddress) {
          state.activeAddress = action.payload;
          localStorage.setItem("activeAddressId", action.payload.id.toString());
        }
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Address
      .addCase(updateAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        const index = state.addresses.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.addresses[index] = action.payload;
        }
        if (state.activeAddress?.id === action.payload.id) {
          state.activeAddress = action.payload;
        }
        state.isLoading = false;
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Address
      .addCase(deleteAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter((a) => a.id !== action.payload);
        if (state.activeAddress?.id === action.payload) {
          const remaining = state.addresses.filter((a) => a.id !== action.payload);
          if (remaining.length > 0) {
            state.activeAddress = remaining[0];
            localStorage.setItem("activeAddressId", remaining[0].id.toString());
          } else {
            state.activeAddress = null;
            localStorage.removeItem("activeAddressId");
          }
        }
        state.isLoading = false;
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setActiveAddress, clearAddressError } = addressSlice.actions;
export default addressSlice.reducer;
