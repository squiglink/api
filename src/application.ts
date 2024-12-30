import { Hono } from "hono";
import brands from "./routes/brands.js";
import brandsSearch from "./routes/brands.search.js";
import databases from "./routes/databases.js";
import databasesSearch from "./routes/databases.search.js";
import models from "./routes/models.js";
import modelsSearch from "./routes/models.search.js";

export const application = new Hono();

application.route("/brands", brands);
application.route("/brands", brandsSearch);
application.route("/databases", databases);
application.route("/databases", databasesSearch);
application.route("/models", models);
application.route("/models", modelsSearch);

export default application;
