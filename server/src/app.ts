

import authRouter from "./modules/Auth/route.js";
import express, { Request, Response } from 'express'

const app = express()

app.use(express.json({
    limit: "100kb"
}));
app.get('/', (req:Request, res:Response)=>{
    res.send("server is running!");
})

app.use("/accounts", authRouter);

// the app has export 
export default app;