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

application.route("/", brands);
application.route("/", databases);
application.route("/", models);
application.route("/authorization/login", authorizationLogin);
application.route("/authorization/verify", authorizationVerify);

const authorizedApplication = new Hono();
authorizedApplication.use("/*", authorizationMiddleware);

authorizedApplication.route("/", brandsNew);
authorizedApplication.route("/", modelsNew);
authorizedApplication.route("/authorization/refresh", authorizationRefresh);

application.route("/", authorizedApplication);

export default application;
