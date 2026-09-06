import { resolve } from "node:path";
import { packageStylexTransform } from "./stylex-transform.js";

Bun.plugin(packageStylexTransform(resolve(import.meta.dir, "..")).plugin);
