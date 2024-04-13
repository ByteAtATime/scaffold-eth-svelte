<script lang="ts">
  import { createFetchBlocks } from "$lib/runes/fetchBlocks.svelte";
  import { createPublicClient, http, type Address } from "viem";
  import { hardhat } from "viem/chains";
  import TransactionsTable from "./TransactionsTable.svelte";
  import PaginationButton from "./PaginationButton.svelte";
  import AddressCodeTab from "./AddressCodeTab.svelte";
  import AddressStorageTab from "./AddressStorageTab.svelte";
  import AddressLogsTab from "./AddressLogsTab.svelte";

  const { address, contractData }: { address: string; contractData: { bytecode: string; assembly: string } | null } =
    $props();

  const { blocks, transactionReceipts, currentPage, totalBlocks, setCurrentPage } = $derived.by(createFetchBlocks());
  const publicClient = createPublicClient({
    chain: hardhat,
    transport: http(),
  });

  let activeTab = $state("transactions");
  let isContract = $state(false);

  $effect(() => {
    const checkIsContract = async () => {
      const contractCode = await publicClient.getBytecode({ address: address as `0x${string}` });
      isContract = contractCode !== undefined && contractCode !== "0x";
    };

    checkIsContract();
  });

  const filteredBlocks = $derived(
    blocks.filter(block =>
      block.transactions.some(tx => {
        if (typeof tx === "string") {
          return false;
        }
        return tx.from.toLowerCase() === address.toLowerCase() || tx.to?.toLowerCase() === address.toLowerCase();
      }),
    ),
  );
</script>

{#if isContract}
  <div class="tabs tabs-lifted w-min">
    <button class="tab" class:tab-active={activeTab === "transactions"} onclick={() => (activeTab = "transactions")}>
      Transactions
    </button>
    <button class="tab" class:tab-active={activeTab === "code"} onclick={() => (activeTab = "code")}> Code </button>
    <button class="tab" class:tab-active={activeTab === "storage"} onclick={() => (activeTab = "storage")}>
      Storage
    </button>
    <button class="tab" class:tab-active={activeTab === "logs"} onclick={() => (activeTab = "logs")}> Logs </button>
  </div>
{/if}

{#if activeTab === "transactions"}
  <div class="pt-4">
    <TransactionsTable blocks={filteredBlocks} {transactionReceipts} />
    <PaginationButton {currentPage} totalItems={Number(totalBlocks)} {setCurrentPage} />
  </div>
{:else if activeTab === "code" && contractData}
  <AddressCodeTab bytecode={contractData.bytecode} assembly={contractData.assembly} />
{:else if activeTab === "storage"}
  <AddressStorageTab address={address as Address} />
{:else if activeTab === "logs"}
  <AddressLogsTab address={address as Address} />
{/if}
