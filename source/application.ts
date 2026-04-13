import "./global.js";
import authenticationLogin from "./routes/authentication.login.js";
import authenticationRefresh from "./routes/authentication.refresh.js";
import authenticationVerify from "./routes/authentication.verify.js";
import brands from "./routes/brands.js";
import brandsCreate from "./routes/brands.create.js";
import brandsShow from "./routes/brands.show.js";
import brandsUpdate from "./routes/brands.update.js";
import databases from "./routes/databases.js";
import databasesCreate from "./routes/databases.create.js";
import databasesShow from "./routes/databases.show.js";
import databasesUpdate from "./routes/databases.update.js";
import evaluations from "./routes/evaluations.js";
import evaluationsCreate from "./routes/evaluations.create.js";
import evaluationsShow from "./routes/evaluations.show.js";
import evaluationsUpdate from "./routes/evaluations.update.js";
import health from "./routes/health.js";
import legacyDataFiles from "./routes/legacy.data.files.js";
import legacyDataPhoneBook from "./routes/legacy.data.phone_book.js";
import measurements from "./routes/measurements.js";
import measurementsCreate from "./routes/measurements.create.js";
import measurementsDestroy from "./routes/measurements.destroy.js";
import measurementsShow from "./routes/measurements.show.js";
import measurementsUpdate from "./routes/measurements.update.js";
import models from "./routes/models.js";
import modelsCreate from "./routes/models.create.js";
import modelsShow from "./routes/models.show.js";
import modelsUpdate from "./routes/models.update.js";
import usersShow from "./routes/users.show.js";
import { Hono } from "hono";
import { authenticationMiddleware } from "./middlewares/authentication_middleware.js";
import { authenticationOptionalMiddleware } from "./middlewares/authentication_optional_middleware.js";
import { cors } from "hono/cors";
import { loggingMiddleware } from "./middlewares/logging_middleware.js";

const application = new Hono();

application.use("/*", cors());
application.use("/*", loggingMiddleware);
application.route("/", authenticationLogin);
application.route("/", authenticationRefresh);
application.route("/", authenticationVerify);
application.route("/", brands);
application.route("/", brandsShow);
application.route("/", databases);
application.route("/", databasesShow);
application.route("/", evaluations);
application.route("/", evaluationsShow);
application.route("/", health);
application.route("/", legacyDataFiles);
application.route("/", legacyDataPhoneBook);
application.route("/", measurements);
application.route("/", measurementsShow);
application.route("/", models);
application.route("/", modelsShow);

const authorizedOptionallyApplication = new Hono();

authorizedOptionallyApplication.use("/*", authenticationOptionalMiddleware);
authorizedOptionallyApplication.route("/", usersShow);

application.route("/", authorizedOptionallyApplication);

const authorizedApplication = new Hono();

authorizedApplication.use("/*", authenticationMiddleware);
authorizedApplication.route("/", brandsCreate);
authorizedApplication.route("/", brandsUpdate);
authorizedApplication.route("/", databasesCreate);
authorizedApplication.route("/", databasesUpdate);
authorizedApplication.route("/", evaluationsCreate);
authorizedApplication.route("/", evaluationsUpdate);
authorizedApplication.route("/", measurementsCreate);
authorizedApplication.route("/", measurementsDestroy);
authorizedApplication.route("/", measurementsUpdate);
authorizedApplication.route("/", modelsCreate);
authorizedApplication.route("/", modelsUpdate);

application.route("/", authorizedApplication);

export default application;
