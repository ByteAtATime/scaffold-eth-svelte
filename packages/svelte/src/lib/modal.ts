import { wagmiConfig } from "./wagmi";
import { createWeb3Modal } from "@web3modal/wagmi";
import scaffoldConfig from "$lib/scaffold.config";

export const modal = createWeb3Modal({
  projectId: scaffoldConfig.walletConnectProjectId,
  wagmiConfig,
  enableOnramp: true,
});
