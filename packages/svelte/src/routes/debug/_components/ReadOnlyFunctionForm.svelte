<script lang="ts">
  import type { AbiFunction, Abi } from "abitype";
  import type { Address } from "viem";
  import InheritanceTooltip from "./InheritanceTooltip.svelte";
  import DisplayTxResult from "./DisplayTxResult.svelte";
  import {
    getFunctionInputKey,
    getInitialFormState,
    getParsedContractFunctionArgs,
    transformAbiFunction,
  } from "./utils";
  import ContractInput from "./ContractInput.svelte";
  import { createReadContract } from "@byteatatime/wagmi-svelte";
  import { createTargetNetwork } from "$lib/runes/targetNetwork.svelte";

  const {
    contractAddress,
    abiFunction,
    inheritedFrom,
    abi,
  }: {
    contractAddress: Address;
    abiFunction: AbiFunction;
    inheritedFrom?: string;
    abi: Abi;
  } = $props();

  const targetNetwork = $derived.by(createTargetNetwork());

  let form = $state<Record<string, any>>(getInitialFormState(abiFunction));
  let result = $state<unknown>();

  let readContract = $derived.by(
    createReadContract(() => ({
      address: contractAddress,
      functionName: abiFunction.name,
      abi: abi,
      args: getParsedContractFunctionArgs(form),
      chainId: targetNetwork.id,
      query: {
        enabled: false,
        retry: false,
      },
    })),
  );

  const transformedFunction = $derived(transformAbiFunction(abiFunction));
</script>

<div class="flex flex-col gap-3 py-5 first:pt-0 last:pb-1">
  <p class="my-0 break-words font-medium">
    {abiFunction.name}
    <InheritanceTooltip {inheritedFrom} />
  </p>
  {#each transformedFunction.inputs as input, i (getFunctionInputKey(abiFunction.name, input, i))}
    <ContractInput
      setForm={updatedFormValue => {
        result = undefined;
        form = updatedFormValue;
      }}
      {form}
      stateObjectKey={getFunctionInputKey(abiFunction.name, input, i)}
      paramType={input}
    />
  {/each}
  <div class="flex flex-wrap justify-between gap-2">
    <div class="w-4/5 flex-grow">
      {#if result !== null && result !== undefined}
        <div class="break-words rounded-3xl bg-secondary px-4 py-1.5 text-sm">
          <p class="m-0 mb-1 font-bold">Result:</p>
          <pre class="whitespace-pre-wrap break-words"><DisplayTxResult content={result} /></pre>
        </div>
      {/if}
    </div>
    <button
      class="btn btn-secondary btn-sm"
      onclick={async () => {
				const { data } = await readContract!.refetch();
				result = data;
			}}
      disabled={readContract?.isFetching}
    >
      {#if readContract?.isFetching}
        <span class="loading loading-spinner loading-xs"></span>
      {/if}
      Read 📡
    </button>
  </div>
</div>
