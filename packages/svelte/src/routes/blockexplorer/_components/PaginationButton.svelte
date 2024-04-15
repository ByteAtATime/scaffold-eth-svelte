<script lang="ts">
  import { ArrowLeft, ArrowRight, Icon } from "svelte-hero-icons";

  const ITEMS_PER_PAGE = 20;

  const {
    currentPage,
    totalItems,
    setCurrentPage,
  }: { currentPage: number; totalItems: number; setCurrentPage: (newCurrentPage: number) => void } = $props();

  const isPrevButtonDisabled = $derived(currentPage === 0);
  const isNextButtonDisabled = $derived(currentPage + 1 >= Math.ceil(totalItems / ITEMS_PER_PAGE));

  const prevButtonClass = $derived(isPrevButtonDisabled ? "bg-gray-200 cursor-default" : "btn btn-primary");
  const nextButtonClass = $derived(isNextButtonDisabled ? "bg-gray-200 cursor-default" : "btn btn-primary");
</script>

{#if !isNextButtonDisabled && !isPrevButtonDisabled}
  <div class="mx-5 mt-5 flex justify-end gap-3">
    <button
      class="btn btn-sm {prevButtonClass}"
      disabled={isPrevButtonDisabled}
      onClick={() => setCurrentPage(currentPage - 1)}
    >
      <Icon src={ArrowLeft} class="h-4 w-4" />
    </button>
    <span class="self-center font-medium text-primary-content">Page {currentPage + 1}</span>
    <button
      class="btn btn-sm {nextButtonClass}"
      disabled={isNextButtonDisabled}
      onClick={() => setCurrentPage(currentPage + 1)}
    >
      <Icon src={ArrowRight} class="h-4 w-4" />
    </button>
  </div>
{/if}
