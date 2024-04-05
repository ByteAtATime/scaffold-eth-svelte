<script lang="ts">
  import { toHex, type Address, createPublicClient, http } from "viem";
  import { hardhat } from "viem/chains";

  const { address }: { address: Address } = $props();

  let storage = $state<string[]>();

  const publicClient = createPublicClient({
    chain: hardhat,
    transport: http(),
  });

  $effect(() => {
    const fetchStorage = async () => {
      try {
        const storageData = [];
        let idx = 0;

        // We break out of this loop when we get an empty storage slot
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const storageAtPosition = await publicClient.getStorageAt({
            address: address,
            slot: toHex(idx),
          });

          if (storageAtPosition === "0x" + "0".repeat(64)) break;

          if (storageAtPosition) {
            storageData.push(storageAtPosition);
          }

          idx++;
        }
        storage = storageData;
      } catch (error) {
        console.error("Failed to fetch storage:", error);
      }
    };

    fetchStorage();
  });
</script>

<div class="flex flex-col gap-3 p-4">
  {#if storage?.length && storage?.length > 0}
    <div class="mockup-code max-h-[500px] overflow-auto">
      <pre class="whitespace-pre-wrap break-words px-5">{#each storage as data, i (i)}<div><strong
              >Storage Slot {i}: </strong>{data}</div>{/each}</pre>
    </div>
  {:else}
    <div class="text-lg">This contract does not have any variables.</div>
  {/if}
</div>
