import express from "express";
import cors from "cors";
import "dotenv/config";
import UserRoute from "./src/routes/user.js";
import ArticleRoute from "./src/routes/article.js";
import PresenceRoute from "./src/routes/presence.js";
import PaiementRoute from "./src/routes/paiement.js";

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/user", UserRoute);
app.use("/article", ArticleRoute);
app.use("/paiement", PaiementRoute);
app.use("/presence", PresenceRoute);

app.listen(PORT, () => {
  return console.log(`Server listening on port ${PORT}`);
});
