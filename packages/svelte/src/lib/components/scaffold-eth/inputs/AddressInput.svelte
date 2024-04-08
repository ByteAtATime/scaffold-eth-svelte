<script lang="ts">
  import { isAddress, type Address } from "viem";
  import { isENS, type CommonInputProps } from "./utils";
  import InputBase from "./InputBase.svelte";
  import {
    createEnsAddress,
    type CreateEnsNameReturnType,
    type CreateEnsAddressReturnType,
    createEnsName,
    type CreateEnsAvatarReturnType,
    createEnsAvatar,
  } from "@byteatatime/wagmi-svelte";
  import { blo } from "blo";
  import { untrack } from "svelte";
  import { normalize } from "viem/ens";

  // eslint-disable-next-line no-undef
  let { value = $bindable(), name, placeholder, onchange, disabled }: CommonInputProps<Address | string> = $props();

  let rawDebouncedValue: string | undefined = $state(undefined);
  let debouncedTimeout: number | undefined;

  $effect(() => {
    if (debouncedTimeout) {
      clearTimeout(debouncedTimeout);
    }

    value;

    debouncedTimeout = window.setTimeout(() => {
      rawDebouncedValue = value as string;
    }, 500);
  });

  // If the user enters an address, don't delay
  const debouncedValue = $derived(isAddress(value) ? value : rawDebouncedValue);
  const isDebouncedValueLive = $derived(debouncedValue === value);

  const settledValue = $derived(isDebouncedValueLive ? debouncedValue : undefined);

  let enteredEnsName = $state<string>();

  let ensAddress = $state<CreateEnsAddressReturnType | undefined>();
  let isEnsAddressLoading = $derived(ensAddress?.result.isLoading);
  let isEnsAddressError = $derived(ensAddress?.result.isError);
  let isEnsAddressSuccess = $derived(ensAddress?.result.isSuccess);

  let ensName = $state<CreateEnsNameReturnType | undefined>();
  let isEnsNameLoading = $derived(ensName?.result.isLoading);
  let isEnsNameError = $derived(ensName?.result.isError);
  let isEnsNameSuccess = $derived(ensName?.result.isSuccess);

  $effect(() => {
    ensAddress = createEnsAddress({
      name: settledValue,
      chainId: 1,
      query: {
        gcTime: 30_000,
        enabled: isDebouncedValueLive && isENS(debouncedValue),
      },
    });
  });

  $effect(() => {
    ensName = createEnsName({
      address: settledValue,
      chainId: 1,
      query: {
        gcTime: 30_000,
        enabled: debouncedValue && isAddress(debouncedValue),
      },
    });
  });

  $effect(() => {
    if (!ensAddress?.result.data) return;

    enteredEnsName = debouncedValue;
    untrack(() => {
      value = ensAddress!.result.data!;
      onchange?.(ensAddress!.result.data!);
    });
  });

  let ensAvatar = $state<CreateEnsAvatarReturnType | undefined>();

  $effect(() => {
    ensAvatar = createEnsAvatar({
      name: ensName?.result.data ? normalize(ensName.result.data) : undefined,
      chainId: 1,
      query: {
        enabled: Boolean(ensName),
        gcTime: 30_000,
      },
    });
  });

  const handleChange = (newValue: Address) => {
    enteredEnsName = undefined;

    onchange?.(newValue);
  };

  const reFocus = $derived(
    isEnsAddressError ||
      isEnsNameError ||
      isEnsNameSuccess ||
      isEnsAddressSuccess ||
      ensName?.result.data === null ||
      ensAddress?.result.data === null,
  );
</script>

<InputBase
  bind:value={value as Address}
  {name}
  {placeholder}
  error={ensAddress?.result.data === null}
  onchange={handleChange}
  disabled={isEnsAddressLoading || isEnsNameLoading || disabled}
  {reFocus}
>
  {#snippet prefix()}
    {#if ensName?.result.data}
      <div class="flex items-center rounded-l-full bg-base-300">
        {#if ensAvatar?.result.isLoading}
          <div class="skeleton h-[35px] w-[35px] shrink-0 rounded-full bg-base-200" />
        {/if}
        {#if ensAvatar?.result.data}
          <span class="w-[35px]">
            <img class="w-full rounded-full" src={ensAvatar?.result.data} alt="{ensAddress?.result.data} avatar" />
          </span>
        {/if}
        <span class="px-2 text-accent">{enteredEnsName ?? ensName.result.data}</span>
      </div>
    {/if}
  {/snippet}
  {#snippet suffix()}
    {#if value}
      <img alt="" class="!rounded-full" src={blo(value as `0x${string}`)} width="35" height="35" />
    {/if}
  {/snippet}
</InputBase>
