import { Hono } from "hono";
import { cors } from "hono/cors";

import { AuthService } from "./services/auth.service.js";
import { authMiddleware } from "./middleware/auth.middleware.js";

import brands from "./routes/brands.js";
import brandsNew from "./routes/brands.new.js";
import databases from "./routes/databases.js";
import models from "./routes/models.js";
import modelsNew from "./routes/models.new.js";

const application = new Hono();
application.use("/*", cors());

// Auth routes
application.post("/auth/login", async (c) => {
  const { email } = await c.req.json();
  if (!email) {
    return c.json({ message: "Email is required" }, 400);
  }

  await AuthService.sendMagicLink(email);
  return c.json({ message: "Magic link sent to your email" });
});

application.get("/auth/verify", async (c) => {
  const token = c.req.query("token");
  if (!token) {
    return c.json({ message: "Token is required" }, 400);
  }

  const user = await AuthService.verifyToken(token);
  if (!user) {
    return c.json({ message: "Invalid token" }, 401);
  }

  return c.json({ token });
});

// Protected routes
const protectedNamespace = application.use("/*", authMiddleware);

// Existing routes should be moved here and will be automatically protected
protectedNamespace.route("/brands", brands);
protectedNamespace.route("/brands", brandsNew);
protectedNamespace.route("/databases", databases);
protectedNamespace.route("/models", models);
protectedNamespace.route("/models", modelsNew);

export default application;
