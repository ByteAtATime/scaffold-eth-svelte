<script lang="ts">
  import { CheckCircle, DocumentDuplicate, Icon } from "svelte-hero-icons";

  const { hash }: { hash: string } = $props();

  let addressCopied = $state(false);
</script>

<div class="flex items-center">
  <a href={`/blockexplorer/transaction/${hash}`}>
    {hash?.substring(0, 6)}...{hash?.substring(hash.length - 4)}
  </a>
  {#if addressCopied}
    <Icon src={CheckCircle} class="ml-1.5 h-5 w-5 cursor-pointer text-xl font-normal text-sky-600" aria-hidden="true" />
  {:else}
    <Icon
      src={DocumentDuplicate}
      class="ml-1.5 h-5 w-5 cursor-pointer text-xl font-normal text-sky-600"
      aria-hidden="true"
      onclick={() => {
            navigator.clipboard.writeText(hash as string)
            addressCopied = (true);
            setTimeout(() => {
              addressCopied = (false);
            }, 800);
            }}
    />
  {/if}
</div>
