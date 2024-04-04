<script lang="ts">
  import { createTargetNetwork } from "$lib/runes/targetNetwork.svelte";
  import { createReadContract, type CreateReadContractReturnType } from "@byteatatime/wagmi-svelte";
  import type { AbiFunction, Abi } from "abitype";
  import { ArrowPath, Icon } from "svelte-hero-icons";
  import type { Address } from "viem";
  import InheritanceTooltip from "./InheritanceTooltip.svelte";
  import DisplayTxResult from "./DisplayTxResult.svelte";
  import { untrack } from "svelte";
  import { createAnimationConfig } from "$lib/runes/animationConfig.svelte";

  const {
    contractAddress,
    abiFunction,
    refreshDisplayVariables,
    inheritedFrom,
    abi,
  }: {
    contractAddress: Address;
    abiFunction: AbiFunction;
    refreshDisplayVariables: boolean;
    inheritedFrom?: string;
    abi: Abi;
  } = $props();

  const { targetNetwork } = $derived(createTargetNetwork());

  let contractRead = $state<CreateReadContractReturnType | undefined>();

  $effect(() => {
    contractRead = createReadContract({
      address: contractAddress,
      functionName: abiFunction.name,
      abi: abi,
      chainId: targetNetwork.id,
      query: {
        retry: false,
      },
    });
  });

  $effect(() => {
    refreshDisplayVariables;

    untrack(() => {
      contractRead?.result.refetch();
    });
  });

  const showAnimation = createAnimationConfig(() => contractRead?.result.data);
</script>

<div class="space-y-1 pb-2">
  <div class="flex items-center">
    <h3 class="mb-0 break-all text-lg font-medium">{abiFunction.name}</h3>
    <button class="btn btn-ghost btn-xs" onclick={async () => await contractRead?.result.refetch()}>
      {#if contractRead?.result.isFetching}
        <span class="loading loading-spinner loading-xs"></span>
      {:else}
        <Icon src={ArrowPath} class="h-3 w-3 cursor-pointer" aria-hidden="true" />
      {/if}
    </button>
    <InheritanceTooltip {inheritedFrom} />
  </div>
  <div class="flex flex-col items-start font-medium text-gray-500">
    <div>
      <div
        class={`block break-all bg-transparent transition ${
          showAnimation.showAnimation ? "animate-pulse-fast rounded-sm bg-warning" : ""
        }`}
      >
        <DisplayTxResult content={contractRead?.result.data} />
      </div>
    </div>
  </div>
</div>
