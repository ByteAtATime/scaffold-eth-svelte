<script lang="ts">
  import { Icon, InformationCircle } from "svelte-hero-icons";

  const { inheritedFrom }: { inheritedFrom?: string } = $props();
</script>

{#if inheritedFrom}
  <span class="tooltip tooltip-top tooltip-accent px-2 md:break-normal" data-tip={`Inherited from: ${inheritedFrom}`}>
    <Icon src={InformationCircle} class="h-4 w-4" aria-hidden="true" />
  </span>
{/if}
