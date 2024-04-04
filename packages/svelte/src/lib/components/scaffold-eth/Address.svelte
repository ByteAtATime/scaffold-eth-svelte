<script lang="ts">
  import { createEnsAvatar, createEnsName } from "@byteatatime/wagmi-svelte";
  import { createTargetNetwork } from "$lib/runes/targetNetwork.svelte";
  import { getAddress, isAddress } from "viem";
  import { hardhat } from "viem/chains";
  import { getBlockExplorerAddressLink } from "$lib/utils/scaffold-eth/networks";
  import BlockieAvatar from "./BlockieAvatar.svelte";
  import { CheckCircle, DocumentDuplicate, Icon } from "svelte-hero-icons";
  import { untrack } from "svelte";

  const {
    address,
    disableAddressLink,
    format,
    size = "base",
  }: {
    address?: string | undefined;
    disableAddressLink?: boolean;
    format?: "short" | "long" | undefined;
    size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  } = $props();

  const blockieSizeMap = {
    xs: 6,
    sm: 7,
    base: 8,
    lg: 9,
    xl: 10,
    "2xl": 12,
    "3xl": 15,
  };

  let ens: string | null = $state(null);
  let ensAvatar: string | null = $state(null);
  let addressCopied = $state(false);
  const checkSumAddress = $derived(address ? getAddress(address) : undefined);

  $effect(() => {
    const fetchedEnsName = createEnsName({
      address: checkSumAddress,
      query: {
        enabled: isAddress(checkSumAddress ?? ""),
      },
      chainId: 1,
    });
    const fetchedEnsAvatar = createEnsAvatar({
      name: untrack(() => fetchedEnsName.result.data ?? undefined),
      query: {
        enabled: untrack(() => Boolean(fetchedEnsName.result.data ?? false)),
      },
      chainId: 1,
    });

    untrack(() => {
      ens = fetchedEnsName.result.data ?? null;
      ensAvatar = fetchedEnsAvatar.result.data ?? null;
    });
  });

  let displayAddress = $derived.by(() => {
    if (ens) {
      return ens;
    } else if (format === "long") {
      return checkSumAddress;
    }
    return checkSumAddress?.slice(0, 6) + "..." + checkSumAddress?.slice(-4);
  });

  const { targetNetwork } = $derived(createTargetNetwork());

  let blockExplorerAddressLink = $state<string>();
  $effect(() => {
    if (checkSumAddress) {
      blockExplorerAddressLink = getBlockExplorerAddressLink(targetNetwork, checkSumAddress);
    }
  });
</script>

{#if !checkSumAddress}
  <div class="flex animate-pulse space-x-4">
    <div class="h-6 w-6 rounded-md bg-slate-300"></div>
    <div class="flex items-center space-y-6">
      <div class="h-2 w-28 rounded bg-slate-300"></div>
    </div>
  </div>
{:else if !isAddress(checkSumAddress)}
  <span class="text-error">Wrong address</span>
{:else}
  <div class="flex items-center">
    <div class="flex-shrink-0">
      <BlockieAvatar
        address={checkSumAddress}
        ensImage={ensAvatar}
        size={(blockieSizeMap[size] * 24) / blockieSizeMap["base"]}
      />
    </div>
    {#if disableAddressLink}
      <span class={`ml-1.5 text-${size} font-normal`}>{displayAddress}</span>
    {:else if targetNetwork.id === hardhat.id}
      <span class={`ml-1.5 text-${size} font-normal`}>
        <a href={blockExplorerAddressLink}>{displayAddress}</a>
      </span>
    {:else}
      <a
        class={`ml-1.5 text-${size} font-normal`}
        target="_blank"
        href={blockExplorerAddressLink}
        rel="noopener noreferrer"
      >
        {displayAddress}
      </a>
    {/if}
    {#if addressCopied}
      <Icon
        src={CheckCircle}
        class="ml-1.5 h-5 w-5 cursor-pointer text-xl font-normal text-sky-600"
        aria-hidden="true"
      />
    {:else}
      <Icon
        src={DocumentDuplicate}
        class="ml-1.5 h-5 w-5 cursor-pointer text-xl font-normal text-sky-600"
        aria-hidden="true"
        onclick={() => {
          navigator.clipboard.writeText(checkSumAddress);
          addressCopied = true;
          setTimeout(() => (addressCopied = false), 800);
        }}
      />
    {/if}
  </div>
{/if}
