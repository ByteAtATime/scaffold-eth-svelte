<script lang="ts">
  import { page } from "$app/stores";
  import logo from "$lib/assets/logo.svg";
  import { Bars3, BugAnt, Icon, type IconSource } from "svelte-hero-icons";
  import ConnectButton from "$lib/components/scaffold-eth/connect-button/ConnectButton.svelte";
  import { FaucetButton } from "$lib/components/scaffold-eth";
  import { createOutsideClick } from "$lib/runes/outsideClick.svelte";
  import { derived } from "svelte/store";

  let isDrawerOpen = $state(false);
  let burgerMenu: HTMLDivElement | undefined = undefined;
  createOutsideClick(
    () => burgerMenu,
    () => {
      isDrawerOpen = false;
    },
  );

  type HeaderMenuLink = {
    label: string;
    href: string;
    icon?: IconSource;
  };

  export const menuLinks: HeaderMenuLink[] = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Debug Contracts",
      href: "/debug",
      icon: BugAnt,
    },
  ];

  const isCurrentPage = derived(page, $page => (href: string) => {
    // ESLint thinks $page is invalid, see https://github.com/sveltejs/eslint-plugin-svelte/issues/652
    // eslint-disable-next-line svelte/valid-compile
    return href === $page.url.pathname;
  });
</script>

{#snippet menuLinksSnippet()}
  {#each menuLinks as { label, href, icon } (href)}
    <li>
      <a
        {href}
        onclick={() => {
          isDrawerOpen = false;
        }}
        class="grid grid-flow-col gap-2 rounded-full px-3 py-1.5 text-sm hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral {$isCurrentPage(
          href,
        )
          ? 'bg-secondary shadow-md'
          : ''}"
      >
        {#if icon}
          <Icon src={icon} class="h-4 w-4" />
        {/if}
        <span>{label}</span>
      </a>
    </li>
  {/each}
{/snippet}

<div
  class="navbar sticky top-0 z-20 min-h-0 flex-shrink-0 justify-between bg-base-100 px-0 shadow-md shadow-secondary sm:px-2 lg:static"
>
  <div class="navbar-start w-auto lg:w-1/2">
    <div class="dropdown lg:hidden" bind:this={burgerMenu}>
      <button
        tabIndex={0}
        class="btn btn-ghost ml-1 {isDrawerOpen ? 'hover:bg-secondary' : 'hover:bg-transparent'}"
        onclick={() => {
          isDrawerOpen = !isDrawerOpen;
        }}
      >
        <Icon src={Bars3} class="h-1/2" />
      </button>
      {#if isDrawerOpen}
        <ul tabIndex={0} class="menu-compact menu dropdown-content mt-3 w-52 rounded-box bg-base-100 p-2 shadow">
          {@render menuLinksSnippet()}
        </ul>
      {/if}
    </div>
    <a href="/" class="ml-4 mr-6 hidden shrink-0 items-center gap-2 lg:flex">
      <div class="relative flex h-10 w-10">
        <img alt="SE2 logo" class="cursor-pointer" src={logo} />
      </div>
      <div class="flex flex-col">
        <span class="font-bold leading-tight">Scaffold-ETH</span>
        <span class="text-xs">Ethereum dev stack</span>
      </div>
    </a>
    <ul class="menu menu-horizontal hidden gap-2 px-1 lg:flex lg:flex-nowrap">
      {@render menuLinksSnippet()}
    </ul>
  </div>
  <div class="navbar-end mr-4 flex-grow">
    <ConnectButton />
    <FaucetButton />
  </div>
</div>
