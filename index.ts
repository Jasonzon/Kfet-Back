import express from "express";
import cors from "cors";
import "dotenv/config";
import UserRoute from "./src/routes/user.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/user", UserRoute);

export default app;
