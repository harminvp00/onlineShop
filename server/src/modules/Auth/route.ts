
import express from "express";
import { 
    createUser 
} from "./controller.js";

const router = express();


router.post("/create", createUser);

export default router;