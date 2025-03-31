import { authorizationMiddleware } from "./middleware/authorization.js";
import { cors } from "hono/cors";
import { Hono } from "hono";
import authorizationLogin from "./routes/authorization.login.js";
import authorizationRefresh from "./routes/authorization.refresh.js";
import authorizationVerify from "./routes/authorization.verify.js";
import brands from "./routes/brands.js";
import brandsNew from "./routes/brands.new.js";
import databases from "./routes/databases.js";
import models from "./routes/models.js";
import modelsMeasurements from "./routes/models.measurements.js";
import modelsNew from "./routes/models.new.js";

const application = new Hono();

application.use("/*", cors());
application.route("/", authorizationLogin);
application.route("/", authorizationVerify);
application.route("/", brands);
application.route("/", databases);
application.route("/", models);
application.route("/", modelsMeasurements);

const authorizedApplication = new Hono();

authorizedApplication.use("/*", authorizationMiddleware);
authorizedApplication.route("/", authorizationRefresh);
authorizedApplication.route("/", brandsNew);
authorizedApplication.route("/", modelsNew);

application.route("/", authorizedApplication);

export default application;
