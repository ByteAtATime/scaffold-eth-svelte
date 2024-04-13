<script lang="ts">
  import type { Address } from "viem";
  import { createContractLogs } from "$lib/runes/contractLogs.svelte";
  import { replacer } from "$lib/utils/scaffold-eth/common";

  const { address }: { address: Address } = $props();

  const contractLogs = $derived.by(createContractLogs(address));
</script>

<div class="flex flex-col gap-3 p-4">
  <div class="mockup-code max-h-[500px] overflow-auto">
    <pre class="whitespace-pre-wrap break-words px-5">{#each contractLogs as log, i (i)}<div><strong>Log:</strong
          > {JSON.stringify(log, replacer, 2)}</div>{/each}</pre>
  </div>
</div>
