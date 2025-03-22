import { cors } from "hono/cors";
import { Hono } from "hono";

import { authorizationMiddleware } from "./middleware/authorization.js";

import authorizationLogin from "./routes/authorization.login.js";
import authorizationRefresh from "./routes/authorization.refresh.js";
import authorizationVerify from "./routes/authorization.verify.js";
import brands from "./routes/brands.js";
import brandsNew from "./routes/brands.new.js";
import databases from "./routes/databases.js";
import models from "./routes/models.js";
import modelsNew from "./routes/models.new.js";

const application = new Hono();
application.use("/*", cors());

application.route("/authorization/login", authorizationLogin);
application.route("/authorization/verify", authorizationVerify);
application.route("/brands", brands);
application.route("/databases", databases);
application.route("/models", models);

const authorizedApplication = new Hono();
authorizedApplication.use("/*", authorizationMiddleware);

authorizedApplication.route("/authorization/refresh", authorizationRefresh);
authorizedApplication.route("/brands/new", brandsNew);
authorizedApplication.route("/models/new", modelsNew);

application.route("/", authorizedApplication);

export default application;
