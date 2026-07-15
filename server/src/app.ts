

import authRouter from "./modules/Auth/route.js";
import addressRouter from "./modules/Address/route.js";
import productRouter from "./modules/Product/route.js";
import categoryRouter from "./modules/Category/route.js";
import express, { Request, Response } from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));

app.use(cookieParser());

app.use(express.json({
    limit: "100kb"
}));

app.get('/', (req:Request, res:Response)=>{
    res.send("server is running!");
})

app.use("/accounts", authRouter);
app.use("/addresses", addressRouter);
app.use("/products", productRouter);
app.use("/categories", categoryRouter);

// the app has export 
export default app;