<script lang="ts">
  import { createDarkMode } from "$lib/runes/darkMode.svelte";
  import { Icon, Moon, Sun } from "svelte-hero-icons";

  const { class: className } = $props();

  const darkMode = createDarkMode();

  $effect(() => {
    document.body.setAttribute("data-theme", darkMode.isDarkMode ? "dark" : "light");
  });
</script>

<div class={`flex space-x-2 text-sm ${className}`}>
  <input
    id="theme-toggle"
    type="checkbox"
    class="toggle toggle-primary border-primary bg-primary hover:bg-primary"
    onchange={darkMode.toggle}
    checked={darkMode.isDarkMode}
  />
  <label for="theme-toggle" class="swap swap-rotate" class:swap-active={darkMode.isDarkMode}>
    <Icon src={Sun} class="swap-on h-5 w-5" />
    <Icon src={Moon} class="swap-off h-5 w-5" />
  </label>
</div>
