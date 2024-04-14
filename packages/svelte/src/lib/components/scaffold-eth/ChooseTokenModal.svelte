<script lang="ts">
  import { InputBase } from "./inputs";
  import { createAccount } from "@byteatatime/wagmi-svelte";
  import { createTargetNetwork } from "$lib/runes/targetNetwork.svelte";
  import { ArrowRight, Icon } from "svelte-hero-icons";
  import type { Address } from "viem";
  import type { Token } from ".";
  import type { Snippet } from "svelte";

  let {
    chainId: chainIdOverride,
    // eslint-disable-next-line no-undef
    token: currentToken = $bindable(),
    suggestedTokens: suggestedTokenAddresses,
    onchange,
    button,
  }: {
    chainId?: number | undefined;
    token?: Token | undefined;
    suggestedTokens?: Address[] | undefined;
    onchange?: (token: Token) => void | undefined;
    button?: Snippet<[Token | undefined]> | undefined;
  } = $props();

  let modalIsOpened = $state(false);

  const { chain: accountChain } = $derived.by(createAccount());
  const targetNetwork = $derived.by(createTargetNetwork());
  const chainId = $derived(chainIdOverride ?? accountChain?.id ?? targetNetwork.id);

  let searchInput = $state("");

  let allTokens = $state<Token[]>([]);

  const fetchTokens = async (): Promise<Token[]> => {
    const response = await fetch("https://tokens.uniswap.org");
    const data = await response.json();
    return data.tokens;
  };

  let isLoadingTokens = $state(true);

  fetchTokens().then(tokens => {
    allTokens = tokens;
    isLoadingTokens = false;
  });

  const suggestedTokens = $derived<Token[]>(
    (suggestedTokenAddresses
      ?.map(address => allTokens.find(token => token.address.toLowerCase() === address.toLowerCase()))
      ?.filter(token => token) as Token[]) ?? [],
  );

  let tokens = $derived(
    allTokens.filter(token => {
      if (token.chainId !== chainId) return false;

      const processedSearchInput = searchInput.trim();

      if (!processedSearchInput) return true;

      // either the token name includes the search input or the address matches the search inputs
      if (token.name.toLowerCase().includes(processedSearchInput.toLowerCase())) return true;
      return token.address.toLowerCase() === processedSearchInput.toLowerCase();
    }),
  );

  const chooseToken = (chosenToken: Token) => {
    currentToken = chosenToken;
    modalIsOpened = false;
    onchange?.(chosenToken);
  };
</script>

<div>
  <label for="token-modal" class="btn btn-primary gap-1 font-normal">
    {#if button}
      {@render button(currentToken)}
    {:else}
      Select a Token
    {/if}
  </label>
  <input type="checkbox" id="token-modal" class="modal-toggle" bind:checked={modalIsOpened} />
  <label for="token-modal" class="modal cursor-pointer">
    <label class="modal-box relative px-0">
      <input class="absolute left-0 top-0 h-0 w-0" />

      <div class="mb-4 px-6">
        <h3 class="mb-3 text-xl font-bold">Select a Token</h3>
        <label for="token-modal" class="btn btn-circle btn-ghost btn-sm absolute right-3 top-3"> ✕ </label>

        <div class="divider" />

        <InputBase placeholder="Search name or paste address" bind:value={searchInput} />

        <div class="mt-2 flex gap-2">
          {#each suggestedTokens ?? [] as token}
            <button
              class="flex gap-x-2 rounded-lg border border-primary p-1.5 transition-colors duration-75 hover:bg-primary"
              onclick={() => chooseToken(token)}
            >
              <img src={token.logoURI} alt={token.name} class="h-6 w-6 rounded-full" />

              <span class="">{token.symbol}</span>
            </button>
          {/each}
        </div>
      </div>

      <div class="scrollbar flex h-[50vh] flex-col overflow-x-auto">
        {#if isLoadingTokens}
          <div class="flex h-full items-center justify-center">
            <p class="text-slate-300">Loading tokens...</p>
          </div>
        {:else if tokens.length === 0}
          <div class="flex h-full items-center justify-center">
            <p class="text-slate-300">No tokens found</p>
          </div>
        {:else}
          {#each tokens as token (token.address)}
            {@const isChosen = token.address === currentToken?.address}
            <button
              class="group flex items-center gap-x-2 px-6 py-2 transition-colors duration-75 {!isChosen &&
                'hover:bg-base-300'}"
              class:brightness-75={isChosen}
              class:cursor-default={isChosen}
              onclick={() => chooseToken(token)}
            >
              <img src={token.logoURI} alt={token.name} class="h-6 w-6 rounded-full" />
              <div class="flex flex-col items-start">
                <span class="font-bold">{token.symbol}</span>
                <span class="text-slate-400">{token.name}</span>
              </div>
              <Icon
                class="ml-auto h-6 w-6 transition-transform {!isChosen && 'group-hover:translate-x-2'}"
                src={ArrowRight}
              />
            </button>
          {/each}
        {/if}
      </div>
    </label>
  </label>
</div>

<style lang="postcss">
  .scrollbar::-webkit-scrollbar {
    width: 8px;
  }

  .scrollbar::-webkit-scrollbar-thumb {
    background: theme(colors.primary);
    border-radius: 8px;
  }

  .scrollbar::-webkit-scrollbar-track {
    background: theme(colors.base-100);
  }

  .scrollbar::-webkit-scrollbar-button {
    display: none;
  }
</style>
