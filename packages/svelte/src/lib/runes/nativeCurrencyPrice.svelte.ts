import { createTargetNetwork } from "./targetNetwork.svelte";
import scaffoldConfig from "$lib/scaffold.config";
import { fetchPriceFromUniswap } from "$lib/utils/scaffold-eth/fetchPriceFromUniswap";

const enablePolling = false;

export const createNativeCurrencyPrice = () => {
  const targetNetwork = $derived.by(createTargetNetwork());
  let nativeCurrencyPrice = $state(0);

  const getPrice = async () => {
    const price = await fetchPriceFromUniswap(targetNetwork);
    nativeCurrencyPrice = price;
  };

  $effect(() => {
    getPrice();
  });

  $effect(() => {
    if (enablePolling) {
      setInterval(getPrice, scaffoldConfig.pollingInterval);
    }
  });

  return {
    get nativeCurrencyPrice() {
      return nativeCurrencyPrice;
    },
  };
};
