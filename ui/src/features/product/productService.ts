
// get a product type, improve the data consistancy 
// import { Product } from "../../entities/product/types";

import axios from "axios";
import type { Product } from "../../entities/product/types";

const api:string = "https://dummyjson.com/product";

// asynchoronized function 
export async function fetchProducts():Promise<Product[]> {
    const response = await axios.get(api);
    return response.data.products;
}