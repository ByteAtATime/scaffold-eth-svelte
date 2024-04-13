<script lang="ts">
  import { page } from "$app/stores";
  import { Address } from "$lib/components/scaffold-eth";
  import { createTargetNetwork } from "$lib/runes/targetNetwork.svelte";
  import { replacer } from "$lib/utils/scaffold-eth/common";
  import { decodeTransactionData, getFunctionDetails } from "$lib/utils/scaffold-eth/decodeTxData";
  import { createPublicClient } from "@byteatatime/wagmi-svelte";
  import { type Transaction, type TransactionReceipt, type Hash, formatEther, formatUnits } from "viem";
  import { hardhat } from "viem/chains";

  const client = $derived.by(createPublicClient({ chainId: hardhat.id }));
  // This is correct usage of the $page value
  // eslint-disable-next-line svelte/valid-compile
  const txHash = $page.params.txHash as Hash;

  let transaction = $state<Transaction>();
  let receipt = $state<TransactionReceipt>();
  let functionCalled = $state<string>();

  const targetNetwork = $derived.by(createTargetNetwork());

  $effect(() => {
    if (txHash && client) {
      const fetchTransaction = async () => {
        const tx = await client.getTransaction({ hash: txHash });
        const txReceipt = await client.getTransactionReceipt({ hash: txHash });

        const transactionWithDecodedData = decodeTransactionData(tx);
        transaction = transactionWithDecodedData;
        receipt = txReceipt;

        const txFunctionCalled = transactionWithDecodedData.input.substring(0, 10);
        functionCalled = txFunctionCalled;
      };

      fetchTransaction();
    }
  });
</script>

<div class="container mx-auto mb-20 mt-10 px-10 md:px-0">
  <button class="btn btn-primary btn-sm" onclick={() => history.back()}> Back </button>
  {#if transaction}
    <div class="overflow-x-auto">
      <h2 class="mb-4 text-center text-3xl font-bold text-primary-content">Transaction Details</h2>

      <table class="table table-md w-full rounded-lg bg-base-100 shadow-lg md:table-lg">
        <tbody>
          <tr>
            <td>
              <strong>Transaction Hash:</strong>
            </td>
            <td>{transaction.hash}</td>
          </tr>
          <tr>
            <td>
              <strong>Block Number:</strong>
            </td>
            <td>{Number(transaction.blockNumber)}</td>
          </tr>
          <tr>
            <td>
              <strong>From:</strong>
            </td>
            <td>
              <Address address={transaction.from} format="long" />
            </td>
          </tr>
          <tr>
            <td>
              <strong>To:</strong>
            </td>
            <td>
              {#if receipt?.contractAddress}
                <span>
                  Contract Creation:
                  <Address address={receipt.contractAddress} format="long" />
                </span>
              {:else if transaction.to}
                transaction.to && <Address address={transaction.to} format="long" />
              {/if}
            </td>
          </tr>
          <tr>
            <td>
              <strong>Value:</strong>
            </td>
            <td>
              {formatEther(transaction.value)}
              {targetNetwork.nativeCurrency.symbol}
            </td>
          </tr>
          <tr>
            <td>
              <strong>Function called:</strong>
            </td>
            <td>
              <div class="w-full overflow-x-auto whitespace-nowrap md:max-w-[600px] lg:max-w-[800px]">
                {#if functionCalled === "0x"}
                  This transaction did not call any function.
                {:else}
                  <span class="mr-2">{getFunctionDetails(transaction)}</span>
                  <span class="badge badge-primary font-bold">{functionCalled}</span>
                {/if}
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <strong>Gas Price:</strong>
            </td>
            <td>{formatUnits(transaction.gasPrice || 0n, 9)} Gwei</td>
          </tr>
          <tr>
            <td>
              <strong>Data:</strong>
            </td>
            <td class="form-control">
              <textarea readOnly value={transaction.input} class="textarea-primary h-[150px] bg-inherit p-0" />
            </td>
          </tr>
          <tr>
            <td>
              <strong>Logs:</strong>
            </td>
            <td>
              <ul>
                {#each receipt?.logs ?? [] as log, i (i)}
                  <li>
                    <strong>Log {i} topics:</strong>
                    {JSON.stringify(log.topics, replacer, 2)}
                  </li>
                {/each}
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  {:else}
    <p class="text-2xl text-base-content">Loading...</p>
  {/if}
</div>
