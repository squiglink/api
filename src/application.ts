import { cors } from "hono/cors";
import { Hono } from "hono";
import brands from "./routes/brands.js";
import brandsNew from "./routes/brands.new.js";
import databases from "./routes/databases.js";
import models from "./routes/models.js";
import modelsNew from "./routes/models.new.js";

export const application = new Hono();

application.use("*", cors());
application.route("/", brands);
application.route("/", brandsNew);
application.route("/", databases);
application.route("/", models);
application.route("/", modelsNew);

export default application;
