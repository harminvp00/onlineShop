
/**
 * Slice: before redux developer manually writes actionType, actionCreator, Reducers, Switch statement, and after redux, it was combines all of these into one feature file, called a slice. Everything need to manage one feature file, called a Slice
 * 
 * Example of slice is productSlice, cartSlice, authSlice, wishlistSlice, Each slice is responsible for own data.
 * 
 * what does a Slice contains?
 * 1. initial state: default values
 * 2. reducers: define how data change (for example currState -> Action -> newState)
 * 3. Actions: describe what happen with data (for product action can be add, remove, fetch, edit)
 * 4. Slice Reducer: when you click reducer createSlice(...), redux toolkit return (action, reducer), but the store only need reducer
 * 
 * Basic flow 
 * - User click 
 * - dispatch(add())
 * - product slice
 * - reducer
 * - store update
 * - react re-render
 */

import { createSlice } from '@reduxjs/toolkit';
import type { Product } from '../../../entities/product/types';

interface productState {
    products: Product[],
    loading: boolean,
    error: string | null
}

const initialState: productState = {
    products: [],
    loading: false,
    error: null
}

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {

    }
})

// What can happen to Product State?