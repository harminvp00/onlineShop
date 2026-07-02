

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Product } from "../../entities/product/types";
import { fetchProducts } from "./productService";

// creating the product state type using product type 
interface productState  {
    products: Product[];
    loading: boolean;
    error: string | null;
}


// create a default state for the product state 
const initialState: productState = {
    products: [],
    loading: false,
    error: null
}

// Async Actions
export const loadProducts = createAsyncThunk(
    "products/loadproducts",
    async () =>{
        return await fetchProducts();
    }
)

const productSlice = createSlice({
    name: "products",
    initialState,
    reducers: {},
    extraReducers: (builder)=>{

        // on pending 
        builder.addCase(loadProducts.pending, (state)=>{
            state.loading = true;
        })

        // on fulfilled 
        builder.addCase(loadProducts.fulfilled, (state, action)=> {
            state.loading = false;
            state.products = action.payload;
        })

        // on rejected
        builder.addCase(loadProducts.rejected, (state)=> {
            state.loading = false,
            state.error = "Failed to load products"
        });
    },
});


export default productSlice.reducer;