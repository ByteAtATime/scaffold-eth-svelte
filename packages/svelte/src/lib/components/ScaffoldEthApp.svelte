<script lang="ts">
  import { setNativeCurrencyPrice } from "$lib/runes/global.svelte";
  import { createNativeCurrencyPrice } from "$lib/runes/nativeCurrencyPrice.svelte";
  import Header from "./Header.svelte";
  import Footer from "./Footer.svelte";
  import { reconnect } from "@wagmi/core";
  import { wagmiConfig } from "$lib/wagmi";
  import { untrack } from "svelte";
  import { createDarkMode } from "$lib/runes/darkMode.svelte";
  import { modal } from "$lib/modal";

  const price = createNativeCurrencyPrice();

  $effect(() => {
    setNativeCurrencyPrice(price.nativeCurrencyPrice);
  });

  $effect(() => {
    untrack(() => {
      reconnect(wagmiConfig);
    });
  });

  const { isDarkMode } = $derived.by(createDarkMode());

  $effect(() => {
    modal.setThemeMode(isDarkMode ? "dark" : "light");
  });
</script>

<div class="flex min-h-screen flex-col">
  <Header />

  <main class="relative flex flex-1 flex-col"><slot /></main>

  <Footer />
</div>
