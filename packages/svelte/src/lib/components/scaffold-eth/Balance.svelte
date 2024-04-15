<script lang="ts">
  import { createTargetNetwork } from "$lib/runes/targetNetwork.svelte";
  import { createBlockNumber } from "@byteatatime/wagmi-svelte";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { formatEther, type Address } from "viem";
  import { nativeCurrencyPrice } from "$lib/runes/global.svelte";
  import { untrack } from "svelte";
  import { createBalance } from "@byteatatime/wagmi-svelte";

  const {
    address,
    class: className = "",
    usdMode = false,
  }: { address?: Address; class?: string; usdMode?: boolean } = $props();

  const targetNetwork = $derived.by(createTargetNetwork());
  const queryClient = useQueryClient();
  const blockNumber = $derived.by(createBlockNumber(() => ({ watch: true, chainId: targetNetwork.id })));

  const balance = $derived.by(createBalance(() => ({ address })));

  $effect(() => {
    blockNumber.data;
    queryClient;

    untrack(() => {
      balance.refetch();
    });
  });

  const formattedBalance = $derived(balance.data ? Number(formatEther(balance.data.value)) : 0);

  let displayUsdMode = $state(nativeCurrencyPrice.price > 0 ? Boolean(usdMode) : false);

  const toggleBalanceMode = () => {
    if (nativeCurrencyPrice.price > 0) {
      displayUsdMode = !displayUsdMode;
    }
  };
</script>

{#if balance.isLoading}
  <div class="flex animate-pulse space-x-4">
    <div class="h-6 w-6 rounded-md bg-slate-300"></div>
    <div class="flex items-center space-y-6">
      <div class="h-2 w-28 rounded bg-slate-300"></div>
    </div>
  </div>
{:else if balance.isError}
  <div class="flex max-w-fit cursor-pointer flex-col items-center rounded-md border-2 border-gray-400 px-2">
    <div class="text-warning">Error</div>
  </div>
{:else}
  <button
    class="btn btn-ghost btn-sm flex flex-col items-center font-normal hover:bg-transparent {className}"
    on:click={toggleBalanceMode}
  >
    <div class="flex w-full items-center justify-center">
      {#if displayUsdMode}
        <span class="mr-1 text-[0.8em] font-bold">$</span>
        <span>{(formattedBalance * nativeCurrencyPrice.price).toFixed(2)}</span>
      {:else}
        <span>{formattedBalance.toFixed(4)}</span>
        <span class="ml-1 text-[0.8em] font-bold">{targetNetwork.nativeCurrency.symbol}</span>
      {/if}
    </div>
  </button>
{/if}
