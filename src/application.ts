import { Hono } from "hono";
import { cors } from "hono/cors";

import { authorizationMiddleware } from "./middleware/authorization.js";

import authLogin from "./routes/auth.login.js";
import authVerify from "./routes/auth.verify.js";
import authRefresh from "./routes/auth.refresh.js";
import brands from "./routes/brands.js";
import brandsNew from "./routes/brands.new.js";
import databases from "./routes/databases.js";
import models from "./routes/models.js";
import modelsNew from "./routes/models.new.js";

const application = new Hono();
application.use("/*", cors());

application.route("/auth", authLogin);
application.route("/auth", authVerify);
application.route("/brands", brands);
application.route("/databases", databases);
application.route("/models", models);

const authorizedRoutes = new Hono();
authorizedRoutes.use("/*", authorizationMiddleware);
authorizedRoutes.route("/auth", authRefresh);
authorizedRoutes.route("/brands/new", brandsNew);
authorizedRoutes.route("/models/new", modelsNew);

application.route("/", authorizedRoutes);

export default application;
