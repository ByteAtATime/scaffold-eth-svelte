import type { Hex } from "viem";
import { generatePrivateKey } from "viem/accounts";

const burnerStorageKey = "scaffoldEth2.burnerWallet.sk";

/**
 * Checks if the private key is valid
 */
const isValidSk = (pk: Hex | string | undefined | null): boolean => {
  return pk?.length === 64 || pk?.length === 66;
};

/**
 * If no burner is found in localstorage, we will generate a random private key
 */
const newDefaultPrivateKey = generatePrivateKey();

/**
 * Save the current burner private key to local storage
 */
export const saveBurnerSK = (privateKey: Hex): void => {
  if (typeof window != "undefined" && window != null) {
    window?.localStorage?.setItem(burnerStorageKey, privateKey);
  }
};

/**
 * Gets the current burner private key from local storage
 */
export const loadBurnerSK = (): Hex => {
  let currentSk: Hex = "0x";
  if (typeof window != "undefined" && window != null) {
    currentSk = (window?.localStorage?.getItem?.(burnerStorageKey)?.replaceAll('"', "") ?? "0x") as Hex;
  }

  if (!!currentSk && isValidSk(currentSk)) {
    return currentSk;
  } else {
    saveBurnerSK(newDefaultPrivateKey);
    return newDefaultPrivateKey;
  }
};
