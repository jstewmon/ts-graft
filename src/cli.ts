import graft, { config, graftLibDefinitions } from "./index";

export async function run(): Promise<void> {
  // await graft.graft({ config: await config.load() });
  graftLibDefinitions({ config: await config.load() });
}
