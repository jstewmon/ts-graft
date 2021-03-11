import graft, { config } from "./index";

export async function run(): Promise<void> {
  await graft.graft({ config: await config.load() });
}
