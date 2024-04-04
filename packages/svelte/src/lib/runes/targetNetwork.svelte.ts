import { setTargetNetwork, targetNetwork } from "./global.svelte";
import { createAccount } from "@byteatatime/wagmi-svelte";
import scaffoldConfig from "$lib/scaffold.config";
import { NETWORKS_EXTRA_DATA, type ChainWithAttributes } from "$lib/utils/scaffold-eth/networks";

export const createTargetNetwork = (): { targetNetwork: ChainWithAttributes } => {
  const account = createAccount();

  $effect(() => {
    const chainId = account.result.chain?.id;
    const newSelectedNetwork = scaffoldConfig.targetNetworks.find(targetNetwork => targetNetwork.id === chainId);
    if (newSelectedNetwork && newSelectedNetwork.id !== targetNetwork.targetNetwork.id) {
      setTargetNetwork(newSelectedNetwork);
    }
  });

  return {
    get targetNetwork() {
      return {
        ...targetNetwork.targetNetwork,
        ...NETWORKS_EXTRA_DATA[targetNetwork.targetNetwork.id],
      };
    },
  };
};
