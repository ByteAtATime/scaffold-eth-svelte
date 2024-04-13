<script lang="ts">
  import { createDisconnect } from "@byteatatime/wagmi-svelte";
  import { ArrowLeftOnRectangle, ChevronDown, Icon } from "svelte-hero-icons";
  import NetworkOptions from "./NetworkOptions.svelte";

  const disconnect = $derived.by(createDisconnect());
</script>

<div class="dropdown dropdown-end mr-2">
  <button tabIndex={0} class="dropdown-toggle btn btn-error btn-sm gap-1">
    <span>Wrong network</span>
    <Icon src={ChevronDown} class="ml-2 h-6 w-4 sm:ml-0" />
  </button>
  <ul tabIndex={0} class="menu dropdown-content mt-1 gap-1 rounded-box bg-base-200 p-2 shadow-center shadow-accent">
    <NetworkOptions />
    <li>
      <button
        class="menu-item btn-sm flex gap-3 !rounded-xl py-3 text-error"
        type="button"
        onclick={() => disconnect.disconnect()}
      >
        <Icon src={ArrowLeftOnRectangle} class="ml-2 h-6 w-4 sm:ml-0" />
        <span>Disconnect</span>
      </button>
    </li>
  </ul>
</div>
