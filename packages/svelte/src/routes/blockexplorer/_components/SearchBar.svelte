<script lang="ts">
  import { goto } from "$app/navigation";
  import { createPublicClient } from "@byteatatime/wagmi-svelte";
  import { isAddress, isHex } from "viem";
  import { hardhat } from "viem/chains";

  let searchInput = $state("");

  const client = $derived.by(createPublicClient({ chainId: hardhat.id }));

  const handleSearch = async (event: Event) => {
    event.preventDefault();

    if (isHex(searchInput)) {
      try {
        const tx = await client?.getTransaction({ hash: searchInput });

        if (tx) {
          goto(`/blockexplorer/transaction/${searchInput}`);
          return;
        }
      } catch (error) {
        console.error("Failed to fetch transaction:", error);
      }
    }

    if (isAddress(searchInput)) {
      goto(`/blockexplorer/address/${searchInput}`);
      return;
    }
  };
</script>

<form onsubmit={handleSearch} class="mx-5 mb-5 flex items-center justify-end space-x-3">
  <input
    class="mr-2 w-full rounded-md border-primary bg-base-100 p-2 text-base-content shadow-md focus:outline-none focus:ring-2 focus:ring-accent md:w-1/2 lg:w-1/3"
    type="text"
    bind:value={searchInput}
    placeholder="Search by hash or address"
  />
  <button class="btn btn-primary btn-sm" type="submit"> Search </button>
</form>
