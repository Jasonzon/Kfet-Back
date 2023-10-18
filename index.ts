import express from "express";
import cors from "cors";
import "dotenv/config";
import UserRoute from "./src/routes/user.js";

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/user", UserRoute);

app.listen(PORT, () => {
  return console.log(`Server listening on port ${PORT}`);
});
