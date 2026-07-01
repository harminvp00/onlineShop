
/**
 * what is a store?
 * imagine have the application such as products, cart, wishlist, user, theme,
 * redux provide a central store where all global state lives, 
 * Puttting the all global application state into one central object, that is called the STORE.
 * |------------------------|
 * | Redux Store            |
 * |------------------------|
 * | Product = []           |
 * | catr = []              |
 * | auth = []              |
 * | wishlist = []          |
 * | theme = []             |
 * |------------------------|
 * Every components read from this single place.
 */

import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
    reducer: {
        
    },
});

export type RootState = ReturnType <typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
