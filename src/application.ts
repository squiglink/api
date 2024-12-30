import { Hono } from "hono";
import brands from "./routes/brands.js";
import databases from "./routes/databases.js";
import models from "./routes/models.js";

export const application = new Hono();

application.route("/brands", brands);
application.route("/databases", databases);
application.route("/models", models);

export default application;
