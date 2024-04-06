import { createTargetNetwork } from "./targetNetwork.svelte";
import type { ChainWithAttributes } from "$lib/utils/scaffold-eth/networks";
import { createDarkMode } from "./darkMode.svelte";

export const DEFAULT_NETWORK_COLOR: [string, string] = ["#666666", "#bbbbbb"];

export function getNetworkColor(network: ChainWithAttributes, isDarkMode: boolean) {
  const colorConfig = network.color ?? DEFAULT_NETWORK_COLOR;
  return Array.isArray(colorConfig) ? (isDarkMode ? colorConfig[1] : colorConfig[0]) : colorConfig;
}

export const createNetworkColor = () => {
  const { targetNetwork } = $derived(createTargetNetwork());

  const { isDarkMode } = $derived(createDarkMode());

  return {
    get networkColor() {
      return getNetworkColor(targetNetwork, isDarkMode);
    },
  };
};
