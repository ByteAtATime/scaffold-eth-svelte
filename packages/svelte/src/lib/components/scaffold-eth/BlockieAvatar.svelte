<script lang="ts">
  import { blo } from "blo";

  const { address, ensImage, size }: { address: string; ensImage?: string | null; size: number } = $props();
</script>

<img
  class="rounded-full"
  src={ensImage || blo(address as `0x${string}`)}
  width={size}
  height={size}
  alt={`${address} avatar`}
/>
