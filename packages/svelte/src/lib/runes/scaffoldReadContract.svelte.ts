import type {
  AbiFunctionReturnType,
  ContractAbi,
  ContractName,
  CreateScaffoldReadConfig,
} from "$lib/utils/scaffold-eth/contract";
import type { ExtractAbiFunctionNames } from "abitype";
import { createDeployedContractInfo } from "./deployedContractInfo.svelte";
import { createTargetNetwork } from "./targetNetwork.svelte";
import { createReadContract } from "@byteatatime/wagmi-svelte";
import type { QueryObserverResult, RefetchOptions } from "@tanstack/svelte-query";
import type { ReadContractErrorType } from "viem";
import { untrack } from "svelte";

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
>({
  contractName,
  functionName,
  args,
  value,
  ...readConfig
}: CreateScaffoldReadConfig<TContractName, TFunctionName>) => {
  const { data: deployedContract } = $derived(createDeployedContractInfo(contractName));
  const { targetNetwork } = $derived(createTargetNetwork());

  const argsVal = $derived(typeof args === "function" ? args() : args);
  const valueVal = $derived(typeof value === "function" ? value() : value);

  let result = $state(
    createReadContract({
      chainId: targetNetwork.id,
      functionName,
      address: deployedContract?.address,
      abi: deployedContract?.abi,
      watch: true,
      args: argsVal,
      value: valueVal,
      enabled: !Array.isArray(argsVal) || !argsVal.some(arg => arg === undefined),
      ...(readConfig as any),
    }) as {
      result: Omit<ReturnType<typeof createReadContract>["result"], "data" | "refetch"> & {
        data: AbiFunctionReturnType<ContractAbi, TFunctionName> | undefined;
        refetch: (
          options?: RefetchOptions | undefined,
        ) => Promise<QueryObserverResult<AbiFunctionReturnType<ContractAbi, TFunctionName>, ReadContractErrorType>>;
      };
    },
  );

  $effect(() => {
    deployedContract;
    argsVal;

    untrack(() => {
      result = createReadContract({
        chainId: targetNetwork.id,
        functionName,
        address: deployedContract?.address,
        abi: deployedContract?.abi,
        watch: true,
        args: argsVal,
        value: valueVal,
        enabled: !Array.isArray(argsVal) || !argsVal.some(arg => arg === undefined),
        ...(readConfig as any),
      }) as {
        result: Omit<ReturnType<typeof createReadContract>["result"], "data" | "refetch"> & {
          data: AbiFunctionReturnType<ContractAbi, TFunctionName> | undefined;
          refetch: (
            options?: RefetchOptions | undefined,
          ) => Promise<QueryObserverResult<AbiFunctionReturnType<ContractAbi, TFunctionName>, ReadContractErrorType>>;
        };
      };
    });
  });

  $inspect(result);

  return {
    get result() {
      return result.result;
    },
  };
};
