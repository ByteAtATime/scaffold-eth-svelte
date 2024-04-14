export type Token = {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
};

export { default as Address } from "./Address.svelte";
export { default as Balance } from "./Balance.svelte";
export { default as BlockieAvatar } from "./BlockieAvatar.svelte";
export { default as ChooseTokenModal } from "./ChooseTokenModal.svelte";
export { default as Faucet } from "./Faucet.svelte";
export { default as FaucetButton } from "./FaucetButton.svelte";
