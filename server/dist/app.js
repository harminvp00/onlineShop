import authRouter from "./modules/Auth/route.js";
import express from 'express';
const app = express();
app.use(express.json({
    limit: "100kb"
}));
app.get('/', (req, res) => {
    res.send("server is running!");
});
app.use("/accounts", authRouter);
// the app has export 
export default app;
