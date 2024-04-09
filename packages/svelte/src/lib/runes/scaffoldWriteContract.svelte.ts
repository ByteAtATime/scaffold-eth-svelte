import {
  createAccount,
  createWriteContract,
  type Config,
  type CreateWriteContractParameters,
} from "@byteatatime/wagmi-svelte";
import type { Abi, ExtractAbiFunctionNames } from "abitype";
import { createTransactor } from "./transactor.svelte";
import { createTargetNetwork } from "./targetNetwork.svelte";
import {
  contracts,
  type ContractAbi,
  type ContractName,
  type scaffoldWriteContractOptions,
  type scaffoldWriteContractVariables,
} from "$lib/utils/scaffold-eth/contract";
import { notification } from "$lib/utils/scaffold-eth/notification";
import type { WriteContractVariables } from "@wagmi/core/query";
import type { MutateOptions } from "@tanstack/svelte-query";
import type { WriteContractErrorType, WriteContractReturnType } from "@wagmi/core";

/**
 * Wrapper around wagmi's useWriteContract hook which automatically loads (by name) the contract ABI and address from
 * the contracts present in deployedContracts.ts & externalContracts.ts corresponding to targetNetworks configured in scaffold.config.ts
 * @param contractName - contract name
 * @param writeContractParams - wagmi's useWriteContract parameters
 */
export const createScaffoldWriteContract = (writeContractParams?: CreateWriteContractParameters) => {
  const {
    result: { chain },
  } = $derived(createAccount());
  const writeTx = createTransactor();
  const { targetNetwork } = $derived(createTargetNetwork());
  let isMining = $state(false);

  const wagmiContractWrite = createWriteContract(writeContractParams);

  const sendContractWriteTx = async <
    TContractName extends ContractName,
    TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "nonpayable" | "payable">,
  >(
    variables: scaffoldWriteContractVariables<TContractName, TFunctionName>,
    options?: scaffoldWriteContractOptions,
  ) => {
    const { contractName, ...wagmiVariables } = variables;
    const deployedContractData = contracts?.[targetNetwork.id]?.[contractName];

    if (!deployedContractData) {
      notification.error("Target Contract is not deployed, did you forget to run `yarn deploy`?");
      return;
    }
    if (!chain?.id) {
      notification.error("Please connect your wallet");
      return;
    }
    if (chain?.id !== targetNetwork.id) {
      notification.error("You are on the wrong network");
      return;
    }

    try {
      isMining = true;
      const { blockConfirmations, onBlockConfirmation, ...mutateOptions } = options || {};
      const makeWriteWithParams = () =>
        wagmiContractWrite.result.writeContractAsync(
          {
            abi: deployedContractData.abi as Abi,
            address: deployedContractData.address,
            ...wagmiVariables,
          } as WriteContractVariables<Abi, string, any[], Config, number>,
          mutateOptions as
          | MutateOptions<
            WriteContractReturnType,
            WriteContractErrorType,
            WriteContractVariables<Abi, string, any[], Config, number>,
            unknown
          >
          | undefined,
        );
      const writeTxResult = await writeTx(makeWriteWithParams, { blockConfirmations, onBlockConfirmation });

      return writeTxResult;
    } finally {
      isMining = false;
    }
  };
  return {
    ...wagmiContractWrite,
    isMining,
    // Overwrite wagmi's write async
    writeContractAsync: sendContractWriteTx,
  };
};
