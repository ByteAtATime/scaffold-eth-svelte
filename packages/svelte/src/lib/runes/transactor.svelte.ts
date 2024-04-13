import TxnNotification from "./TxnNotification.svelte";
import { getPublicClient, getWalletClient } from "@wagmi/core";
import type { Hash, SendTransactionParameters, TransactionReceipt, WalletClient } from "viem";
import { getParsedError } from "$lib/utils/scaffold-eth/getParsedError";
import { getBlockExplorerTxLink } from "$lib/utils/scaffold-eth/networks";
import { notification } from "$lib/utils/scaffold-eth/notification";
import { wagmiConfig } from "$lib/wagmi";

export type TransactionFunc = (
  tx: (() => Promise<Hash>) | SendTransactionParameters,
  options?: {
    onBlockConfirmation?: (txnReceipt: TransactionReceipt) => void;
    blockConfirmations?: number;
  },
) => Promise<Hash | undefined>;

export const createTransactor = (_walletClient?: () => WalletClient): (() => TransactionFunc) => {
  const result: TransactionFunc = async (tx, options) => {
    let walletClient = _walletClient?.();
    // TODO: Why does createWalletClient not work?
    if (!walletClient) {
      const defaultWalletClient = await getWalletClient(wagmiConfig);
      walletClient = defaultWalletClient;
    }

    if (!walletClient) {
      notification.error("Cannot access account");
      console.error("⚡️ ~ file: useTransactor.tsx ~ error");
      return;
    }

    let notificationId = null;
    let transactionHash: Hash | undefined = undefined;
    try {
      const network = await walletClient.getChainId();
      // Get full transaction from public client
      const publicClient = getPublicClient(wagmiConfig);

      notificationId = notification.loading(TxnNotification, {
        props: { message: "Awaiting for user confirmation" },
      });
      if (typeof tx === "function") {
        // Tx is already prepared by the caller
        const result = await tx();
        transactionHash = result;
      } else if (tx != null) {
        transactionHash = await walletClient.sendTransaction(tx);
      } else {
        throw new Error("Incorrect transaction passed to transactor");
      }
      notification.remove(notificationId);

      const blockExplorerTxURL = network ? getBlockExplorerTxLink(network, transactionHash) : "";

      notificationId = notification.loading(TxnNotification, {
        props: {
          message: "Waiting for transaction to complete.",
          blockExplorerLink: blockExplorerTxURL,
        },
      });

      const transactionReceipt = await publicClient.waitForTransactionReceipt({
        hash: transactionHash,
        confirmations: options?.blockConfirmations,
      });
      notification.remove(notificationId);

      notification.success(TxnNotification, {
        props: {
          message: "Transaction completed successfully!",
          blockExplorerLink: blockExplorerTxURL,
        },
        icon: "🎉",
      });

      if (options?.onBlockConfirmation) options.onBlockConfirmation(transactionReceipt);
    } catch (error: any) {
      if (notificationId) {
        notification.remove(notificationId);
      }
      console.error("⚡️ ~ file: useTransactor.ts ~ error", error);
      const message = getParsedError(error);
      notification.error(message);
      throw error;
    }

    return transactionHash;
  };

  return () => result;
};
