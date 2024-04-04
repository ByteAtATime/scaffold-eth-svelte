<script lang="ts">
  import { getNetworkColor } from "$lib/runes/networkColor.svelte";
  import { getTargetNetworks } from "$lib/utils/scaffold-eth/networks";
  import { createAccount, createSwitchChain } from "@byteatatime/wagmi-svelte";
  import { ArrowsRightLeft, Icon } from "svelte-hero-icons";

  const { hidden = false } = $props();

  const switchChain = createSwitchChain();

  const allowedNetworks = getTargetNetworks();
  const account = createAccount();
  const items = allowedNetworks.filter(network => network.id !== account.result.chain?.id);

  // TODO: implement theming
  const isDarkMode = true;
</script>

{#each items as network (network.id)}
  <li class:hidden>
    <button
      class="menu-item btn-sm flex gap-3 whitespace-nowrap !rounded-xl py-3"
      type="button"
      onclick={() => {
        switchChain.result.switchChain?.({ chainId: network.id });
      }}
    >
      <Icon src={ArrowsRightLeft} class="ml-2 h-6 w-4 sm:ml-0" />
      <span>
        Switch to
        <span style:color={getNetworkColor(network, isDarkMode)}>
          {network.name}
        </span>
      </span>
    </button>
  </li>
{/each}
