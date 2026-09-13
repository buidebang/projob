import { ingestVault } from "./lib/cognitive-vault/vault-ingester";
ingestVault("./lib/cognitive-vault/workflow.ylm").then(() => console.log("Done"));
