import application from "../source/application.js";
import fs from "node:fs";
import { generateSpecs } from "hono-openapi";

const specs = await generateSpecs(application, { excludeStaticFile: false });

fs.mkdirSync("output", { recursive: true });
fs.writeFileSync("output/openapi.json", JSON.stringify(specs, null, 2));
