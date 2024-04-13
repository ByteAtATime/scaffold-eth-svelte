<script lang="ts">
  import { modal } from "$lib/modal";
  import scaffoldConfig from "$lib/scaffold.config";
  import { createAccount, createEnsName, createEnsAvatar } from "@byteatatime/wagmi-svelte";
  import WrongNetworkDropdown from "./WrongNetworkDropdown.svelte";
  import { Balance } from "$lib/components/scaffold-eth";
  import type { Address } from "viem/accounts";
  import { createNetworkColor } from "$lib/runes/networkColor.svelte";
  import AddressInfoDropdown from "./AddressInfoDropdown.svelte";
  import { formatENS, formatAddress } from "./utils";
  import { getBlockExplorerAddressLink } from "$lib/utils/scaffold-eth/networks";
  import { createTargetNetwork } from "$lib/runes/targetNetwork.svelte";
  import AddressQRCodeModal from "./AddressQRCodeModal.svelte";

  const targetNetwork = $derived.by(createTargetNetwork());
  const { address, chain, isConnected } = $derived.by(createAccount());
  const connected = $derived(isConnected);
  const isChainUnsupported = $derived(
    chain?.id && !scaffoldConfig.targetNetworks.map(it => it.id as number).includes(chain.id),
  );
  const networkColor = $derived.by(createNetworkColor());

  const ensName = $derived.by(createEnsName(() => ({ address })));
  const ensAvatar = $derived.by(createEnsAvatar(() => ({ name: ensName.data ?? undefined })));

  const blockExplorerAddressLink = $derived(address ? getBlockExplorerAddressLink(targetNetwork, address) : undefined);
</script>

{#if !connected}
  <button class="btn btn-primary btn-sm" onclick={() => modal.open()} type="button"> Connect Wallet </button>
{:else if isChainUnsupported}
  <WrongNetworkDropdown />
{:else}
  <div class="mr-1 flex flex-col items-center">
    <Balance address={address as Address} class="h-auto min-h-0" />
    <span class="text-xs" style:color={networkColor}>
      {chain?.name}
    </span>
  </div>
  {#if address}
    <AddressInfoDropdown
      {address}
      displayName={ensName.data ? formatENS(ensName.data) : formatAddress(address)}
      ensAvatar={ensAvatar.data ?? undefined}
      {blockExplorerAddressLink}
    />
    <AddressQRCodeModal {address} modalId="qrcode-modal" />
  {/if}
{/if}
