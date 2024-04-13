<script lang="ts">
  import { createFetchBlocks } from "$lib/runes/fetchBlocks.svelte";
  import PaginationButton from "./_components/PaginationButton.svelte";
  import SearchBar from "./_components/SearchBar.svelte";
  import TransactionsTable from "./_components/TransactionsTable.svelte";

  const { blocks, transactionReceipts, currentPage, totalBlocks, setCurrentPage } = $derived.by(createFetchBlocks());
</script>

<div class="container mx-auto my-10">
  <SearchBar />
  <TransactionsTable {blocks} {transactionReceipts} />
  <PaginationButton {currentPage} totalItems={Number(totalBlocks)} {setCurrentPage} />
</div>
