import type { GetEnsNameReturnType } from "viem";

// format functions from RainbowKit
export function formatENS(name: GetEnsNameReturnType): string {
  if (!name) return "";

  const parts = name.split(".");
  const last = parts.pop();
  if (parts.join(".").length > 24) {
    return `${parts.join(".").substring(0, 24)}...`;
  }
  return `${parts.join(".")}.${last}`;
}

export function formatAddress(address: string): string {
  const leadingChars = 4;
  const trailingChars = 4;

  return address.length < leadingChars + trailingChars
    ? address
    : `${address.substring(0, leadingChars)}\u2026${address.substring(address.length - trailingChars)}`;
}
