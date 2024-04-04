<script lang="ts">
  import { modal } from "$lib/modal";
  import scaffoldConfig from "$lib/scaffold.config";
  import {
    type CreateEnsNameReturnType,
    createAccount,
    createEnsName,
    type CreateEnsAvatarReturnType,
    createEnsAvatar,
  } from "@byteatatime/wagmi-svelte";
  import WrongNetworkDropdown from "./WrongNetworkDropdown.svelte";
  import Balance from "$lib/components/scaffold-eth/Balance.svelte";
  import type { Address } from "viem/accounts";
  import { createNetworkColor } from "$lib/runes/networkColor.svelte";
  import AddressInfoDropdown from "./AddressInfoDropdown.svelte";
  import { formatENS, formatAddress } from "./utils";
  import { getBlockExplorerAddressLink } from "$lib/utils/scaffold-eth/networks";
  import { createTargetNetwork } from "$lib/runes/targetNetwork.svelte";
  import AddressQRCodeModal from "./AddressQRCodeModal.svelte";

  const { targetNetwork } = $derived(createTargetNetwork());
  const account = createAccount();
  const address = $derived(account.result.address as Address);
  const chain = $derived(account.result.chain);
  const connected = $derived(account.result.isConnected);
  const isChainUnsupported = $derived(
    chain?.id && !scaffoldConfig.targetNetworks.map(it => it.id as number).includes(chain.id),
  );
  const { networkColor } = $derived(createNetworkColor());

  let ensName = $state<CreateEnsNameReturnType | undefined>(undefined);
  let ensAvatar = $state<CreateEnsAvatarReturnType | undefined>(undefined);

  $effect(() => {
    ensName = createEnsName({ address });
  });

  $effect(() => {
    if (!ensName?.result.data) return;

    ensAvatar = createEnsAvatar({ name: ensName.result.data });
  });

  const blockExplorerAddressLink = $derived(
    account.result.address ? getBlockExplorerAddressLink(targetNetwork, account.result.address) : undefined,
  );
</script>

{#if !connected}
  <button class="btn btn-primary btn-sm" onclick={() => modal.open()} type="button"> Connect Wallet </button>
{:else if isChainUnsupported}
  <WrongNetworkDropdown />
{:else}
  <div class="mr-1 flex flex-col items-center">
    <Balance address={account.result.address as Address} class="h-auto min-h-0" />
    <span class="text-xs" style:color={networkColor}>
      {chain?.name}
    </span>
  </div>
  <AddressInfoDropdown
    {address}
    displayName={ensName?.result.data ? formatENS(ensName.result.data) : formatAddress(address)}
    ensAvatar={ensAvatar?.result.data ?? undefined}
    {blockExplorerAddressLink}
  />
  <AddressQRCodeModal {address} modalId="qrcode-modal" />
{/if}
