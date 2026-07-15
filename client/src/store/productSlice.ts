import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/api";

export interface Category {
  categoryId: number;
  categoryName: string;
}

export interface Product {
  productId: number;
  productName: string;
  productDescription: string;
  imageUrl: string;
  stock: number;
  originalPrice: number;
  sellingPrice: number | null;
  categoryId: number;
  category?: Category;
}

interface ProductState {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  syncSuccess: boolean;
}

const initialState: ProductState = {
  products: [],
  categories: [],
  isLoading: false,
  error: null,
  syncSuccess: false,
};

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (filters: { search?: string; category?: string } | undefined, { rejectWithValue }) => {
    try {
      const params: any = {};
      if (filters?.search) params.search = filters.search;
      if (filters?.category) params.category = filters.category;
      
      const response = await API.get("/products", { params });
      return response.data.products as Product[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

export const fetchCategories = createAsyncThunk(
  "products/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get("/categories");
      return response.data.categories as Category[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  }
);

export const addProduct = createAsyncThunk(
  "products/addProduct",
  async (
    productData: {
      productName: string;
      productDescription: string;
      originalPrice: number;
      sellingPrice?: number | null;
      imageUrl: string;
      stock: number;
      categoryName: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await API.post("/products", productData);
      return response.data.product as Product;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add product"
      );
    }
  }
);

export const editProduct = createAsyncThunk(
  "products/editProduct",
  async (
    {
      id,
      productData,
    }: {
      id: number;
      productData: {
        productName?: string;
        productDescription?: string;
        originalPrice?: number;
        sellingPrice?: number | null;
        imageUrl?: string;
        stock?: number;
        categoryName?: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await API.put(`/products/${id}`, productData);
      return response.data.product as Product;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update product"
      );
    }
  }
);

export const removeProduct = createAsyncThunk(
  "products/removeProduct",
  async (id: number, { rejectWithValue }) => {
    try {
      await API.delete(`/products/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete product"
      );
    }
  }
);

export const syncDummyProducts = createAsyncThunk(
  "products/syncDummyProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.post("/products/sync");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to sync products from DummyJSON"
      );
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    },
    resetSyncSuccess: (state) => {
      state.syncSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Add Product
      .addCase(addProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
        state.isLoading = false;
        // Add category to list if it doesn't exist
        if (action.payload.category) {
          const catExists = state.categories.some(
            (c) => c.categoryId === action.payload.category?.categoryId
          );
          if (!catExists) {
            state.categories.push(action.payload.category);
            state.categories.sort((a, b) =>
              a.categoryName.localeCompare(b.categoryName)
            );
          }
        }
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Edit Product
      .addCase(editProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(
          (p) => p.productId === action.payload.productId
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        state.isLoading = false;
        // Add category to list if it doesn't exist
        if (action.payload.category) {
          const catExists = state.categories.some(
            (c) => c.categoryId === action.payload.category?.categoryId
          );
          if (!catExists) {
            state.categories.push(action.payload.category);
            state.categories.sort((a, b) =>
              a.categoryName.localeCompare(b.categoryName)
            );
          }
        }
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Product
      .addCase(removeProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(
          (p) => p.productId !== action.payload
        );
        state.isLoading = false;
      })
      .addCase(removeProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Sync Dummy Products
      .addCase(syncDummyProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.syncSuccess = false;
      })
      .addCase(syncDummyProducts.fulfilled, (state) => {
        state.isLoading = false;
        state.syncSuccess = true;
      })
      .addCase(syncDummyProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.syncSuccess = false;
      });
  },
});

export const { clearProductError, resetSyncSuccess } = productSlice.actions;
export default productSlice.reducer;
