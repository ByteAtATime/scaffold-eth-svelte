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
  type ContractAbi,
  type ContractName,
  type scaffoldWriteContractOptions,
  type scaffoldWriteContractVariables,
} from "$lib/utils/scaffold-eth/contract";
import { notification } from "$lib/utils/scaffold-eth/notification";
import type { WriteContractVariables } from "@wagmi/core/query";
import type { MutateOptions } from "@tanstack/svelte-query";
import type { WriteContractErrorType, WriteContractReturnType } from "@wagmi/core";
import { createDeployedContractInfo } from "./deployedContractInfo.svelte";

/**
 * Wrapper around wagmi's useWriteContract hook which automatically loads (by name) the contract ABI and address from
 * the contracts present in deployedContracts.ts & externalContracts.ts corresponding to targetNetworks configured in scaffold.config.ts
 * @param contractName - contract name
 * @param writeContractParams - wagmi's useWriteContract parameters
 */
export const createScaffoldWriteContract = <TContractName extends ContractName>(
  contractName: TContractName,
  writeContractParams?: CreateWriteContractParameters,
) => {
  const { chain } = $derived.by(createAccount());
  const writeTx = $derived.by(createTransactor());
  const targetNetwork = $derived.by(createTargetNetwork());
  let isMining = $state(false);

  const wagmiContractWrite = $derived.by(createWriteContract(writeContractParams));

  const { data: deployedContractData } = $derived.by(createDeployedContractInfo(contractName));

  const sendContractWriteTx = async <
    TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "nonpayable" | "payable">,
  >(
    variables: scaffoldWriteContractVariables<TContractName, TFunctionName>,
    options?: scaffoldWriteContractOptions,
  ) => {
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
        wagmiContractWrite.writeContractAsync(
          {
            abi: deployedContractData.abi as Abi,
            address: deployedContractData.address,
            ...variables,
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

  return () => ({
    ...wagmiContractWrite,
    isMining,
    // Overwrite wagmi's write async
    writeContractAsync: sendContractWriteTx,
  });
};
