<script lang="ts">
  import {
    createAccount,
    createWaitForTransactionReceipt,
    type CreateWaitForTransactionReceiptReturnType,
    createWriteContract,
  } from "@byteatatime/wagmi-svelte";
  import type { Abi, AbiFunction } from "abitype";
  import type { TransactionReceipt, Address } from "viem";
  import {
    getFunctionInputKey,
    getInitialFormState,
    getParsedContractFunctionArgs,
    transformAbiFunction,
  } from "./utils";
  import InheritanceTooltip from "./InheritanceTooltip.svelte";
  import ContractInput from "./ContractInput.svelte";
  import { IntegerInput } from "$lib/components/scaffold-eth/inputs";
  import { createTargetNetwork } from "$lib/runes/targetNetwork.svelte";
  import { createTransactor } from "$lib/runes/transactor.svelte";

  const {
    abi,
    abiFunction,
    onchange,
    contractAddress,
    inheritedFrom,
  }: {
    abi: Abi;
    abiFunction: AbiFunction;
    onchange: () => void;
    contractAddress: Address;
    inheritedFrom?: string;
  } = $props();

  let form = $state(getInitialFormState(abiFunction));
  let txValue = $state<bigint | string>("");
  const { chain } = $derived.by(createAccount());
  const targetNetwork = $derived.by(createTargetNetwork());
  const writeDisabled = $derived(!chain || chain?.id !== targetNetwork.id);
  let writeTxn = $derived.by(createTransactor());

  let contractWrite = $derived.by(createWriteContract());

  const handleWrite = async () => {
    try {
      const makeWriteWithParams = () =>
        contractWrite!.writeContractAsync({
          address: contractAddress,
          functionName: abiFunction.name,
          abi: abi,
          args: getParsedContractFunctionArgs(form),
          value: BigInt(txValue),
        });
      await writeTxn?.(makeWriteWithParams);
      onchange();
    } catch (e: unknown) {
      console.error("⚡️ ~ file: WriteOnlyFunctionForm.tsx:handleWrite ~ error", e);
    }
  };

  let displayedTxResult = $state<TransactionReceipt | undefined>();
  let txResult = $state<CreateWaitForTransactionReceiptReturnType | undefined>();
  $effect(() => {
    txResult = createWaitForTransactionReceipt({
      hash: contractWrite?.data,
    });
  });

  const transformedFunction = transformAbiFunction(abiFunction);
  const zeroInputs = transformedFunction.inputs.length === 0 && abiFunction.stateMutability !== "payable";
</script>

<div class="space-y-3 py-5 first:pt-0 last:pb-1">
  <div class="flex gap-3 {zeroInputs ? 'flex-row items-center justify-between' : 'flex-col'}">
    <p class="my-0 break-words font-medium">
      {abiFunction.name}
      <InheritanceTooltip {inheritedFrom} />
    </p>
    {#each transformedFunction.inputs as input, i (getFunctionInputKey(abiFunction.name, input, i))}
      <ContractInput
        setForm={updatedFormValue => {
          displayedTxResult = undefined;
          form = updatedFormValue;
        }}
        {form}
        stateObjectKey={getFunctionInputKey(abiFunction.name, input, i)}
        paramType={input}
      />
    {/each}
    {#if abiFunction.stateMutability === "payable"}
      <div class="flex w-full flex-col gap-1.5">
        <div class="ml-2 flex items-center">
          <span class="mr-2 text-xs font-medium leading-none">payable value</span>
          <span class="block text-xs font-extralight leading-none">wei</span>
        </div>
        <IntegerInput
          bind:value={txValue}
          onchange={() => {
            displayedTxResult = undefined;
          }}
          placeholder="value (wei)"
        />
      </div>
    {/if}
    <div class="flex justify-between gap-2">
      {#if !zeroInputs}
        <div class="flex-grow basis-0">
          {#if displayedTxResult}
            TxReceipt
            <!-- <TxReceipt txResult={displayedTxResult} /> -->
          {/if}
        </div>
      {/if}
      <div
        class="flex {writeDisabled &&
          'tooltip before:left-auto before:right-[-10px] before:transform-none before:content-[attr(data-tip)]'}"
        data-tip={`${writeDisabled && "Wallet not connected or in the wrong network"}`}
      >
        <button
          class="btn btn-secondary btn-sm"
          disabled={writeDisabled || contractWrite?.isPending}
          onclick={handleWrite}
        >
          {#if contractWrite?.isPending}
            <span class="loading loading-spinner loading-xs" />
          {/if}
          Send 💸
        </button>
      </div>
    </div>
  </div>
  {#if zeroInputs && txResult}
    <div class="flex-grow basis-0">
      <!-- <TxReceipt {txResult} /> -->
    </div>
  {/if}
</div>
