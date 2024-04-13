<script lang="ts">
  import { Address } from "$lib/components/scaffold-eth";
  import { createTargetNetwork } from "$lib/runes/targetNetwork.svelte";
  import type { TransactionWithFunction, TransactionsTableProps } from "$lib/utils/scaffold-eth/block";
  import { formatEther } from "viem";
  import TransactionHash from "./TransactionHash.svelte";

  const { blocks, transactionReceipts }: TransactionsTableProps = $props();

  const targetNetwork = $derived.by(createTargetNetwork());
</script>

<div class="flex justify-center px-4 md:px-0">
  <div class="w-full overflow-x-auto rounded-xl shadow-2xl">
    <table class="table table-zebra table-sm w-full bg-base-100 text-xl md:table-md">
      <thead>
        <tr class="rounded-xl text-sm text-base-content">
          <th class="bg-primary">Transaction Hash</th>
          <th class="bg-primary">Function Called</th>
          <th class="bg-primary">Block Number</th>
          <th class="bg-primary">Time Mined</th>
          <th class="bg-primary">From</th>
          <th class="bg-primary">To</th>
          <th class="bg-primary text-end">Value ({targetNetwork.nativeCurrency.symbol})</th>
        </tr>
      </thead>
      <tbody>
        {#each blocks as block}
          {#each block.transactions as TransactionWithFunction[] as tx (tx.hash)}
            {@const receipt = transactionReceipts[tx.hash]}
            {@const timeMined = new Date(Number(block.timestamp) * 1000).toLocaleString()}
            {@const functionCalled = tx.input.substring(0, 10)}

            <tr class="hover text-sm">
              <td class="w-1/12 md:py-4"><TransactionHash hash={tx.hash} /></td>
              <td class="w-2/12 md:py-4">
                {#if tx.functionName !== "0x"}
                  <span class="mr-1">{tx.functionName}</span>
                {/if}
                {#if functionCalled !== "0x"}
                  <span class="badge badge-primary text-xs font-bold">{functionCalled}</span>
                {/if}
              </td>
              <td class="w-1/12 md:py-4">{block.number?.toString()}</td>
              <td class="w-2/1 md:py-4">{timeMined}</td>
              <td class="w-2/12 md:py-4"><Address address={tx.from} size="sm" /></td>
              <td class="w-2/12 md:py-4">
                {#if !receipt?.contractAddress}
                  {#if tx.to}
                    <Address address={tx.to} size="sm" />
                  {/if}
                {:else}
                  <div class="relative">
                    <Address address={receipt.contractAddress} size="sm" />
                    <small class="absolute left-4 top-4">(Contract Creation)</small>
                  </div>
                {/if}
              </td>
              <td class="text-right md:py-4">{formatEther(tx.value)} {targetNetwork.nativeCurrency.symbol}</td>
            </tr>
          {/each}
        {/each}
      </tbody>
    </table>
  </div>
</div>
