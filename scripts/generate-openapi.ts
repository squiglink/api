import application from "../source/application.js";
import fs from "node:fs";
import { generateSpecs } from "hono-openapi";

async function main() {
  const specs = await generateSpecs(application, { excludeStaticFile: false });

  if (!fs.existsSync("output")) fs.mkdirSync("output");
  fs.writeFileSync("output/openapi.json", JSON.stringify(specs, null, 2));
}

main();
