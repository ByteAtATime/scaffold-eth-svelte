<script lang="ts">
  import type { Contract, ContractName, GenericContract, InheritedFunctions } from "$lib/utils/scaffold-eth/contract";
  import type { Abi, AbiFunction } from "abitype";
  import DisplayVariable from "./DisplayVariable.svelte";

  const {
    refreshDisplayVariables,
    deployedContractData,
  }: { refreshDisplayVariables: boolean; deployedContractData: Contract<ContractName> } = $props();

  const functionsToDisplay = (
    (deployedContractData.abi as Abi).filter(part => part.type === "function") as AbiFunction[]
  )
    .filter(fn => {
      const isQueryableWithNoParams =
        (fn.stateMutability === "view" || fn.stateMutability === "pure") && fn.inputs.length === 0;
      return isQueryableWithNoParams;
    })
    .map(fn => {
      return {
        fn,
        inheritedFrom: ((deployedContractData as GenericContract)?.inheritedFunctions as InheritedFunctions)?.[fn.name],
      };
    })
    .sort((a, b) => (b.inheritedFrom ? b.inheritedFrom.localeCompare(a.inheritedFrom) : 1));
</script>

{#if functionsToDisplay.length === 0}
  No contract variables
{:else}
  {#each functionsToDisplay as { fn, inheritedFrom } (fn.name)}
    <DisplayVariable
      abi={deployedContractData.abi as Abi}
      abiFunction={fn}
      contractAddress={deployedContractData.address}
      {refreshDisplayVariables}
      {inheritedFrom}
    />
  {/each}
{/if}
