<script lang="ts">
  import { isAddress, type Address } from "viem";
  import { isENS, type CommonInputProps } from "./utils";
  import InputBase from "./InputBase.svelte";
  import { createEnsAddress, createEnsName, createEnsAvatar } from "@byteatatime/wagmi-svelte";
  import { blo } from "blo";
  import { normalize } from "viem/ens";

  let {
    // eslint-disable-next-line no-undef
    value = $bindable(),
    // eslint-disable-next-line no-undef
    address = $bindable(),
    name,
    placeholder,
    onchange,
    disabled,
  }: CommonInputProps<Address | string> & { address?: string | undefined; ens?: string | undefined } = $props();

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

  $effect(() => {
    if (value && isAddress(value)) address = value;
    else address = undefined;
  });

  $effect(() => {
    if (address) value = address;
  });

  // If the user enters an address, don't delay
  const debouncedValue = $derived(isAddress(value) ? value : rawDebouncedValue);
  const isDebouncedValueLive = $derived(debouncedValue === value);

  const settledValue = $derived(isDebouncedValueLive ? debouncedValue : undefined);

  let enteredEnsName = $state<string>();

  const {
    isLoading: isEnsAddressLoading,
    isError: isEnsAddressError,
    isSuccess: isEnsAddressSuccess,
    data: ensAddress,
  } = $derived.by(
    createEnsAddress(() => ({
      name: settledValue,
      chainId: 1,
      query: {
        gcTime: 30_000,
        enabled: isDebouncedValueLive && isENS(debouncedValue),
      },
    })),
  );

  let {
    isLoading: isEnsNameLoading,
    isError: isEnsNameError,
    isSuccess: isEnsNameSuccess,
    data: ensName,
  } = $derived.by(
    createEnsName(() => ({
      address: settledValue,
      chainId: 1,
      query: {
        gcTime: 30_000,
        enabled: debouncedValue && isAddress(debouncedValue),
      },
    })),
  );

  $effect(() => {
    if (!ensAddress) return;

    enteredEnsName = debouncedValue;

    value = ensAddress;
    onchange?.(ensAddress);
  });

  const ensAvatar = $derived.by(
    createEnsAvatar(() => ({
      name: ensName ? normalize(ensName) : undefined,
      chainId: 1,
      query: {
        enabled: Boolean(ensName),
        gcTime: 30_000,
      },
    })),
  );

  const handleChange = (newValue: Address) => {
    enteredEnsName = undefined;

    onchange?.(newValue);
  };

  const reFocus = $derived(
    isEnsAddressError ||
      isEnsNameError ||
      isEnsNameSuccess ||
      isEnsAddressSuccess ||
      ensName === null ||
      ensAddress === null,
  );
</script>

<InputBase
  bind:value={value as Address}
  {name}
  {placeholder}
  error={ensAddress === null}
  onchange={handleChange}
  disabled={isEnsAddressLoading || isEnsNameLoading || disabled}
  {reFocus}
>
  {#snippet prefix()}
    {#if ensName}
      <div class="flex items-center rounded-l-full bg-base-300">
        {#if ensAvatar?.isLoading}
          <div class="skeleton h-[35px] w-[35px] shrink-0 rounded-full bg-base-200" />
        {/if}
        {#if ensAvatar?.data}
          <span class="w-[35px]">
            <img class="w-full rounded-full" src={ensAvatar?.data} alt="{ensAddress} avatar" />
          </span>
        {/if}
        <span class="px-2 text-accent">{enteredEnsName ?? ensName}</span>
      </div>
    {/if}
  {/snippet}
  {#snippet suffix()}
    {#if value}
      <img alt="" class="!rounded-full" src={blo(value as `0x${string}`)} width="35" height="35" />
    {/if}
  {/snippet}
</InputBase>
