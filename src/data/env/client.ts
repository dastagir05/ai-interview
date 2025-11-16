import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const env = createEnv({
  client: {},
  emptyStringAsUndefined: true,
  experimental__runtimeEnv: process.env,
});
