import { createBurnerConnector } from "./burner-wallet/createBurnerConnector";
import { getAlchemyHttpUrl } from "./utils/scaffold-eth/networks";
import { createWagmiConfig, http } from "@byteatatime/wagmi-svelte";
import { hardhat, mainnet, type Chain } from "@byteatatime/wagmi-svelte/chains";
import { coinbaseWallet, injected, walletConnect } from "@byteatatime/wagmi-svelte/connectors";
import { createClient } from "viem";
import * as chains from "viem/chains";
import scaffoldConfig from "$lib/scaffold.config";

const { onlyLocalBurnerWallet, walletConnectProjectId, targetNetworks } = scaffoldConfig;

export const enabledChains = targetNetworks.find((network: Chain) => network.id === 1)
  ? targetNetworks
  : ([...targetNetworks, mainnet] as const);

const connectors = [
  injected(),
  walletConnect({
    projectId: walletConnectProjectId,
    showQrModal: false,
  }),
  coinbaseWallet({
    appName: "scaffold-eth-2",
  }),
  ...(!targetNetworks.some(network => network.id !== (chains.hardhat as chains.Chain).id) || !onlyLocalBurnerWallet
    ? [createBurnerConnector()]
    : []),
];

export const wagmiConfig = createWagmiConfig({
  chains: enabledChains,
  connectors,
  client({ chain }) {
    return createClient({
      chain,
      transport: http(getAlchemyHttpUrl(chain.id)),
      ...(chain.id === (hardhat as Chain).id
        ? {
            pollingInterval: scaffoldConfig.pollingInterval,
          }
        : {}),
    });
  },
});
