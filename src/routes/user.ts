import express, { Response, NextFunction, Request } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { auth } from "../utils/auth.js";
import { jwtGenerator } from "../utils/jwtGenerator.js";
import bcrypt from "bcrypt";
import { AuthenticatedRequest } from "../utils/types.js";
import "dotenv/config";
import {
  HTTP_FORBIDDEN,
  HTTP_NOT_FOUND,
  HTTP_OK,
  HTTP_SERVER_ERROR,
} from "../utils/status.js";

const router = express.Router();

router.get(
  "/",
  auth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (req.role !== "admin") {
        return res.status(HTTP_FORBIDDEN).json({ message: "Non autorisé" });
      }
      const users = await User.find({});
      return res.status(HTTP_OK).json(users);
    } catch (error: any) {
      console.error(error.message);
      return res.status(HTTP_SERVER_ERROR).json({ error });
    }
  }
);

router.get(
  "/id/:id",
  auth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (
        req.role !== "admin" ||
        req.params.id.toString() !== req.user.toString()
      ) {
        return res.status(HTTP_FORBIDDEN).json({ message: "Non autorisé" });
      }
      const user = await User.findById(req.params.id);
      if (user) {
        return res.status(HTTP_OK).json(user);
      } else {
        return res
          .status(HTTP_NOT_FOUND)
          .json({ message: "Utilisateur non trouvé" });
      }
    } catch (error: any) {
      console.error(error.message);
      return res.status(HTTP_SERVER_ERROR).json({ error });
    }
  }
);

router.get(
  "/auth",
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const jwtToken = req.header("token");
      if (!jwtToken) {
        return res.status(HTTP_FORBIDDEN).json({ message: "Pas de token" });
      }
      jwt.verify(
        jwtToken,
        process.env.jwtSecret!,
        async function (err, payload) {
          if (err) {
            return res.status(HTTP_FORBIDDEN).json({ message: "Non autorisé" });
          }
          const user = await User.findById(
            (payload as JwtPayload).userId as string
          );
          if (!user) {
            return res
              .status(HTTP_NOT_FOUND)
              .json({ message: "Utilisateur non trouvé" });
          }
          return res.status(HTTP_OK).json({ user });
        }
      );
    } catch (error: any) {
      console.error(error.message);
      return res.status(HTTP_SERVER_ERROR).json({ error });
    }
  }
);

router.get(
  "/url",
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const redirectUri = encodeURIComponent(
        `${process.env.FRONTEND_URL}/connect`
      );
      const authorizationUrl = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/authorize?client_id=${process.env.AZURE_CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=user.read`;
      return res.status(HTTP_OK).json({ url: authorizationUrl });
    } catch (error: any) {
      console.error(error.message);
      return res.status(HTTP_SERVER_ERROR).json({ error });
    }
  }
);

const tokenEndpoint = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`;

router.post("/dataverse", async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const body = new URLSearchParams();
    body.append("grant_type", "authorization_code");
    body.append("client_id", process.env.AZURE_CLIENT_ID!);
    body.append("client_secret", process.env.AZURE_SECRET!);
    body.append("redirect_uri", `${process.env.FRONTEND_URL}/connect`);
    body.append("code", code);
    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
    const data = await response.json();
    res.status(HTTP_OK).json({ accessToken: data.access_token });
  } catch (error) {
    res.status(HTTP_SERVER_ERROR).json({ error: "An error occurred" });
  }
});

router.post("/login", async (req, res) => {
  const { accessToken } = req.body;
  try {
    const decodedToken = jwt.decode(accessToken) as JwtPayload;
    if (!decodedToken) {
      return res.status(HTTP_FORBIDDEN).json({ message: "Not Authorized" });
    }
    const { name, unique_name } = decodedToken;
    let user = await User.findOne({ mail: unique_name });
    if (!user) {
      user = new User({
        prenom: name.split(" ")[1],
        nom: name.split(" ")[0],
        mail: unique_name,
        role: { niveau: "admin", nom: "Admin" },
        _id: new mongoose.Types.ObjectId(),
      });

      await user.save();
    }
    const token = jwtGenerator(user._id, user.role.niveau, user.mail);
    return res.status(HTTP_OK).json({ user, token });
  } catch (error) {
    console.error(error);
    return res.sendStatus(HTTP_SERVER_ERROR);
  }
});

router.post(
  "/connect",
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { mail, password } = req.body;
      const user = await User.findOne({ mail });
      if (!user) {
        return res
          .status(HTTP_NOT_FOUND)
          .json({ message: "Utilisateur non trouvé" });
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res
          .status(HTTP_FORBIDDEN)
          .json({ message: "Mot de passe erroné" });
      }
      const token = jwtGenerator(user._id, user.role.niveau, user.mail);
      return res.status(HTTP_OK).json({ user, token });
    } catch (error: any) {
      console.error(error.message);
      return res.status(HTTP_SERVER_ERROR).json({ error });
    }
  }
);

router.put(
  "/id/:id",
  auth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (req.role !== "admin") {
        return res.status(HTTP_FORBIDDEN).json({ message: "Non autorisé" });
      }
      const user = await User.findById(req.params.id).lean();
      if (!user) {
        return res
          .status(HTTP_NOT_FOUND)
          .json({ message: "Utilisateur non trouvé" });
      }
      await User.findByIdAndUpdate(
        req.params.id,
        {
          ...user,
          _id: user._id.toString(),
          role: req.body.role,
        },
        {
          new: true,
        }
      );
      return res.status(HTTP_OK).json({ message: "Utilisateur modifié !" });
    } catch (error: any) {
      console.error(error.message);
      return res.status(HTTP_SERVER_ERROR).json({ error });
    }
  }
);

export default router;
