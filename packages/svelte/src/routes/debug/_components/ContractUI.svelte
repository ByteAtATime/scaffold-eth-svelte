<script lang="ts">
  import Address from "$lib/components/scaffold-eth/Address.svelte";
  import { createDeployedContractInfo } from "$lib/runes/deployedContractInfo.svelte";
  import { createTargetNetwork } from "$lib/runes/targetNetwork.svelte";
  import type { ContractName } from "$lib/utils/scaffold-eth/contract";
  import { createNetworkColor } from "$lib/runes/networkColor.svelte";
  import Balance from "$lib/components/scaffold-eth/Balance.svelte";
  import ContractVariables from "./ContractVariables.svelte";
  import ContractReadMethods from "./ContractReadMethods.svelte";
  import ContractWriteMethods from "./ContractWriteMethods.svelte";

  const { contractName, hidden }: { contractName: ContractName; hidden: boolean } = $props();

  const deployedContract = createDeployedContractInfo(contractName);

  const { targetNetwork } = $derived(createTargetNetwork());
  const { networkColor } = $derived(createNetworkColor());

  let refreshDisplayVariables = $state(false);
</script>

{#if deployedContract.isLoading}
  <div class="mt-14">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
{:else if !deployedContract.data}
  <p class="mt-14 text-3xl">
    No contract found by the name of "{contractName}" on chain "{targetNetwork.name}"!
  </p>
{:else}
  <div class="my-0 grid w-full max-w-7xl grid-cols-1 px-6 lg:grid-cols-6 lg:gap-12 lg:px-10" class:hidden>
    <div class="col-span-5 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
      <div class="col-span-1 flex flex-col">
        <div
          class="mb-6 space-y-1 rounded-3xl border border-base-300 bg-base-100 px-6 py-4 shadow-md shadow-secondary lg:px-8"
        >
          <div class="flex">
            <div class="flex flex-col gap-1">
              <span class="font-bold">{contractName}</span>
              <Address address={deployedContract.data.address} />
              <div class="flex items-center gap-1">
                <span class="text-sm font-bold">Balance:</span>
                <Balance address={deployedContract.data.address} class="h-1.5 min-h-[0.375rem] px-0" />
              </div>
            </div>
          </div>
          {#if targetNetwork}
            <p class="my-0 text-sm">
              <span class="font-bold">Network</span>:
              <span style="color: {networkColor}">{targetNetwork.name}</span>
            </p>
          {/if}
        </div>
        <div class="rounded-3xl bg-base-300 px-6 py-4 shadow-lg shadow-base-300 lg:px-8">
          <ContractVariables {refreshDisplayVariables} deployedContractData={deployedContract.data} />
        </div>
      </div>
      <div class="col-span-1 flex flex-col gap-6 lg:col-span-2">
        <div class="z-10">
          <div
            class="relative mt-10 flex flex-col rounded-3xl border border-base-300 bg-base-100 shadow-md shadow-secondary"
          >
            <div
              class="absolute -left-[1px] -top-[38px] -z-10 h-[5rem] w-[5.5rem] self-start rounded-[22px] bg-base-300 py-[0.65rem] shadow-lg shadow-base-300"
            >
              <div class="flex items-center justify-center space-x-2">
                <p class="my-0 text-sm">Read</p>
              </div>
            </div>
            <div class="divide-y divide-base-300 p-5">
              <ContractReadMethods deployedContractData={deployedContract.data} />
            </div>
          </div>
        </div>
        <div class="z-10">
          <div
            class="relative mt-10 flex flex-col rounded-3xl border border-base-300 bg-base-100 shadow-md shadow-secondary"
          >
            <div
              class="absolute -left-[1px] -top-[38px] -z-10 h-[5rem] w-[5.5rem] self-start rounded-[22px] bg-base-300 py-[0.65rem] shadow-lg shadow-base-300"
            >
              <div class="flex items-center justify-center space-x-2">
                <p class="my-0 text-sm">Write</p>
              </div>
            </div>
            <div class="divide-y divide-base-300 p-5">
              <ContractWriteMethods
                deployedContractData={deployedContract.data}
                onchange={() => (refreshDisplayVariables = !refreshDisplayVariables)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
