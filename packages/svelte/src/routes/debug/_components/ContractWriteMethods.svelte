<script lang="ts">
  import type { Contract, ContractName, GenericContract, InheritedFunctions } from "$lib/utils/scaffold-eth/contract";
  import type { Abi, AbiFunction } from "abitype";
  import WriteOnlyFunctionForm from "./WriteOnlyFunctionForm.svelte";

  const { onchange, deployedContractData }: { onchange: () => void; deployedContractData: Contract<ContractName> } =
    $props();

  const functionsToDisplay = (
    (deployedContractData.abi as Abi).filter(part => part.type === "function") as AbiFunction[]
  )
    .filter(fn => {
      const isWriteableFunction = fn.stateMutability !== "view" && fn.stateMutability !== "pure";
      return isWriteableFunction;
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
  No write methods
{:else}
  {#each functionsToDisplay as { fn, inheritedFrom }, i (`${fn.name}-${i}`)}
    <WriteOnlyFunctionForm
      abi={deployedContractData.abi as Abi}
      abiFunction={fn}
      {onchange}
      contractAddress={deployedContractData.address}
      {inheritedFrom}
    />
  {/each}
{/if}
