<script lang="ts">
  import BackButton from "./BackButton.svelte";
  import { Address, Balance } from "$lib/components/scaffold-eth";
  import ContractTabs from "./ContractTabs.svelte";

  const { address, contractData }: { address: string; contractData: { bytecode: string; assembly: string } | null } =
    $props();
</script>

<div class="m-10 mb-20">
  <div class="mb-5 flex justify-start">
    <BackButton />
  </div>
  <div class="col-span-5 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
    <div class="col-span-1 flex flex-col">
      <div
        class="mb-6 space-y-1 overflow-x-auto rounded-3xl border border-base-300 bg-base-100 px-6 py-4 shadow-md shadow-secondary lg:px-8"
      >
        <div class="flex">
          <div class="flex flex-col gap-1">
            <Address {address} format="long" />
            <div class="flex items-center gap-1">
              <span class="text-sm font-bold">Balance:</span>
              <Balance address={address as `0x${string}`} class="text" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ContractTabs {address} {contractData} />
</div>
