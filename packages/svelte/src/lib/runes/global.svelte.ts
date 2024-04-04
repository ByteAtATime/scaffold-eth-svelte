import scaffoldConfig from "$lib/scaffold.config";
import type { ChainWithAttributes } from "$lib/utils/scaffold-eth/networks";

// we store this as a property so we can directly export it
export const targetNetwork: { targetNetwork: ChainWithAttributes } = $state({
  targetNetwork: scaffoldConfig.targetNetworks[0],
});

export const setTargetNetwork = (newTargetNetwork: ChainWithAttributes) => {
  targetNetwork.targetNetwork = newTargetNetwork;
};

export const nativeCurrencyPrice = $state({ price: 0 });

export const setNativeCurrencyPrice = (price: number) => {
  nativeCurrencyPrice.price = price;
};
