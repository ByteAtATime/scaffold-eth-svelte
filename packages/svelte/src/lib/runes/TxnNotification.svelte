<script lang="ts">
  const { message, blockExplorerLink }: { message: string; blockExplorerLink?: string } = $props();
</script>

<div class="ml-1 flex cursor-default flex-col">
  <p class="my-0">{message}</p>

  {#if blockExplorerLink && blockExplorerLink.length > 0}
    <a href={blockExplorerLink} target="_blank" rel="noreferrer" class="text-md link block"> check out transaction </a>
  {/if}
</div>
