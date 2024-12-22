import { Hono } from "hono";
import databases from "./routes/databases.js";

export const application = new Hono();

application.route("/databases", databases);

export default application;
