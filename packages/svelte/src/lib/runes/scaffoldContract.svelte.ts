import type { Contract, ContractName } from "$lib/utils/scaffold-eth/contract";
import type { GetWalletClientReturnType } from "@wagmi/core";
import { createDeployedContractInfo } from "./deployedContractInfo.svelte";
import { createTargetNetwork } from "./targetNetwork.svelte";
import { createPublicClient } from "@byteatatime/wagmi-svelte";
import {
  type GetContractReturnType,
  getContract,
  type Account,
  type Address,
  type Chain,
  type Client,
  type Transport,
} from "viem";

/**
 * Gets a viem instance of the contract present in deployedContracts.ts or externalContracts.ts corresponding to
 * targetNetworks configured in scaffold.config.ts. Optional walletClient can be passed for doing write transactions.
 * @param config - The config settings for the hook
 * @param config.contractName - deployed contract name
 * @param config.walletClient - optional walletClient from wagmi createWalletClient hook can be passed for doing write transactions
 */
export const createScaffoldContract = <
  TContractName extends ContractName,
  TWalletClient extends Exclude<GetWalletClientReturnType, null> | undefined,
>({
  contractName,
  walletClient,
}: {
  contractName: TContractName;
  walletClient?: TWalletClient | null;
}) => {
  const { data: deployedContractData, isLoading: deployedContractLoading } = $derived.by(
    createDeployedContractInfo(contractName),
  );
  const targetNetwork = $derived.by(createTargetNetwork());
  const publicClient = $derived.by(createPublicClient({ chainId: targetNetwork.id }));

  let contract = $state<GetContractReturnType | undefined>(undefined);
  $effect(() => {
    if (deployedContractData && publicClient) {
      contract = getContract<
        Transport,
        Address,
        Contract<TContractName>["abi"],
        TWalletClient extends Exclude<GetWalletClientReturnType, null>
          ? {
              public: Client<Transport, Chain>;
              wallet: TWalletClient;
            }
          : { public: Client<Transport, Chain> },
        Chain,
        Account
      >({
        address: deployedContractData.address,
        abi: deployedContractData.abi as Contract<TContractName>["abi"],
        client: {
          public: publicClient,
          wallet: walletClient ? walletClient : undefined,
        } as any,
      });
    }
  });

  return {
    get data() {
      return contract;
    },
    get isLoading() {
      return deployedContractLoading;
    },
  };
};
