<script lang="ts">
  import { Address } from "$lib/components/scaffold-eth";
  import { createAccount } from "@byteatatime/wagmi-svelte";
  import { BugAnt, Icon, MagnifyingGlass } from "svelte-hero-icons";

  const { address } = $derived.by(createAccount());
</script>

<div class="flex flex-grow flex-col items-center pt-10">
  <div class="px-5">
    <h1 class="text-center">
      <span class="mb-2 block text-2xl">Welcome to</span>
      <span class="block text-4xl font-bold">Scaffold-ETH 2</span>
    </h1>
    <div class="flex items-center justify-center space-x-2">
      <p class="my-2 font-medium">Connected Address:</p>
      <Address {address} />
    </div>
    <p class="text-center text-lg">
      Get started by editing
      <code class="inline-block max-w-full break-words break-all bg-base-300 text-base font-bold italic">
        packages/svelte/src/routes/+page.svelte
      </code>
    </p>
    <p class="text-center text-lg">
      Edit your smart contract
      <code class="inline-block max-w-full break-words break-all bg-base-300 text-base font-bold italic">
        YourContract.sol
      </code>
      in
      <code class="inline-block max-w-full break-words break-all bg-base-300 text-base font-bold italic">
        packages/hardhat/contracts
      </code>
    </p>
  </div>

  <div class="mt-16 w-full flex-grow bg-base-300 px-8 py-12">
    <div class="flex flex-col items-center justify-center gap-12 sm:flex-row">
      <div class="flex max-w-xs flex-col items-center rounded-3xl bg-base-100 px-10 py-10 text-center">
        <Icon src={BugAnt} class="h-8 w-8 fill-secondary" />
        <p>
          Tinker with your smart contract using the
          <a href="/debug" class="link">Debug Contracts</a>
          tab.
        </p>
      </div>
      <div class="flex max-w-xs flex-col items-center rounded-3xl bg-base-100 px-10 py-10 text-center">
        <Icon src={MagnifyingGlass} class="h-8 w-8 fill-secondary" />
        <p>
          Explore your local transactions with the
          <a href="/blockexplorer" class="link">Block Explorer</a>
          tab.
        </p>
      </div>
    </div>
  </div>
</div>
