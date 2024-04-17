import type {
  AbiFunctionReturnType,
  ContractAbi,
  ContractName,
  CreateScaffoldReadConfig,
} from "$lib/utils/scaffold-eth/contract";
import type { ExtractAbiFunctionNames } from "abitype";
import { createDeployedContractInfo } from "./deployedContractInfo.svelte";
import { createTargetNetwork } from "./targetNetwork.svelte";
import { createReadContract, type CreateReadContractReturnType } from "@byteatatime/wagmi-svelte";
import type { QueryObserverResult, RefetchOptions } from "@tanstack/svelte-query";
import type { ReadContractErrorType } from "viem";

/**
 * Wrapper around wagmi's useContractRead hook which automatically loads (by name) the contract ABI and address from
 * the contracts present in deployedContracts.ts & externalContracts.ts corresponding to targetNetworks configured in scaffold.config.ts
 * @param config - The config settings, including extra wagmi configuration
 * @param config.contractName - deployed contract name
 * @param config.functionName - name of the function to be called
 * @param config.args - args to be passed to the function call
 */
export const createScaffoldReadContract = <
  TContractName extends ContractName,
  TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "pure" | "view">,
>(
  config: CreateScaffoldReadConfig<TContractName, TFunctionName>,
) => {
  const { contractName, functionName, args, value, ...readConfig } = $derived(
    config instanceof Function ? config() : config,
  );
  const { data: deployedContract } = $derived.by(createDeployedContractInfo(contractName));
  const targetNetwork = $derived.by(createTargetNetwork());

  const result = $derived.by(
    createReadContract(() => ({
      chainId: targetNetwork.id,
      functionName,
      address: deployedContract?.address,
      abi: deployedContract?.abi,
      watch: true,
      args: args,
      value: value,
      enabled: !Array.isArray(args) || !args.some(arg => arg === undefined),
      ...(readConfig as any),
    })) as () => Omit<ReturnType<CreateReadContractReturnType>, "data" | "refetch"> & {
      data: AbiFunctionReturnType<ContractAbi, TFunctionName> | undefined;
      refetch: (
        options?: RefetchOptions | undefined,
      ) => Promise<QueryObserverResult<AbiFunctionReturnType<ContractAbi, TFunctionName>, ReadContractErrorType>>;
    },
  );

  return () => result;
};
