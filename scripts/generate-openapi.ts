import application from "../source/application.js";
import { generateSpecs } from "hono-openapi";

async function main() {
  const specs = await generateSpecs(application, { excludeStaticFile: false });

  await Bun.$`mkdir -p output`.quiet();
  await Bun.write("output/openapi.json", JSON.stringify(specs, null, 2));
}

main();
