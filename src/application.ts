import { authorizationMiddleware } from "./middlewares/authorization_middleware.js";
import { cors } from "hono/cors";
import { Hono } from "hono";
import authorizationLogin from "./routes/authorization.login.js";
import authorizationRefresh from "./routes/authorization.refresh.js";
import authorizationVerify from "./routes/authorization.verify.js";
import brands from "./routes/brands.js";
import brandsCreate from "./routes/brands.create.js";
import brandsUpdate from "./routes/brands.update.js";
import databases from "./routes/databases.js";
import evaluations from "./routes/evaluations.js";
import evaluationsCreate from "./routes/evaluations.create.js";
import evaluationsUpdate from "./routes/evaluations.update.js";
import legacyDataFiles from "./routes/legacy.data.files.js";
import legacyDataPhoneBook from "./routes/legacy.data.phone_book.js";
import measurements from "./routes/measurements.js";
import measurementsCreate from "./routes/measurements.create.js";
import measurementsDestroy from "./routes/measurements.destroy.js";
import measurementsShow from "./routes/measurements.show.js";
import measurementsUpdate from "./routes/measurements.update.js";
import models from "./routes/models.js";
import modelsCreate from "./routes/models.create.js";

const application = new Hono();

application.use("/*", cors());
application.route("/", authorizationLogin);
application.route("/", authorizationRefresh);
application.route("/", authorizationVerify);
application.route("/", brands);
application.route("/", databases);
application.route("/", evaluations);
application.route("/", legacyDataFiles);
application.route("/", legacyDataPhoneBook);
application.route("/", measurements);
application.route("/", measurementsShow);
application.route("/", models);

const authorizedApplication = new Hono();

authorizedApplication.use("/*", authorizationMiddleware);
authorizedApplication.route("/", brandsCreate);
authorizedApplication.route("/", brandsUpdate);
authorizedApplication.route("/", evaluationsCreate);
authorizedApplication.route("/", evaluationsUpdate);
authorizedApplication.route("/", measurementsCreate);
authorizedApplication.route("/", measurementsDestroy);
authorizedApplication.route("/", measurementsUpdate);
authorizedApplication.route("/", modelsCreate);

application.route("/", authorizedApplication);

export default application;
