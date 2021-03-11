import { cosmiconfig } from "cosmiconfig";
import * as z from "zod";

export const packageName = "ts-graft";

export const schema = z.object({
  grafts: z.array(
    z.object({
      source: z.string(),
      output: z.string(),
      include: z.array(z.string()).min(1),
    })
  ),
});

export type Config = z.infer<typeof schema>;

export async function load(): Promise<Config> {
  const cosmic = cosmiconfig(packageName);
  const result = await cosmic.search();
  if (!result) {
    throw new Error(`No config found for ${packageName}`);
  }
  return schema.parse(result.config);
}
