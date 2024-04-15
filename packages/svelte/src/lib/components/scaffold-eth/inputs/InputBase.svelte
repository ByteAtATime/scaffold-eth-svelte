<script lang="ts" generics="T extends { toString: () => string | undefined } = string">
  import type { Snippet } from "svelte";

  import type { CommonInputProps } from "./utils";

  let {
    // I have no idea why ESLint doesn't recognize $bindable
    // eslint-disable-next-line no-undef
    value = $bindable(),
    name,
    placeholder,
    onchange,
    disabled,
    reFocus,
    error,
    prefix,
    suffix,
    // ESLint doesn't work well with generics
    // eslint-disable-next-line no-undef
  }: CommonInputProps<T> & {
    error?: boolean;
    prefix?: Snippet;
    suffix?: Snippet;
    reFocus?: boolean;
  } = $props();

  let modifier = $state("");
  let input: HTMLInputElement;

  $effect(() => {
    if (error) {
      modifier = "border-error";
    } else if (disabled) {
      modifier = "border-disabled bg-base-300";
    }
  });

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    // eslint-disable-next-line no-undef
    onchange?.(target.value as unknown as T);
  };

  const handleFocus = (e: FocusEvent) => {
    if (reFocus !== undefined) {
      const currentTarget = e.currentTarget as HTMLInputElement;
      currentTarget.setSelectionRange(currentTarget.value.length, currentTarget.value.length);
    }
  };

  $effect(() => {
    if (reFocus) input.focus();
  });
</script>

<div class="flex rounded-full border-2 border-base-300 bg-base-200 text-accent {modifier}">
  {#if prefix}
    {@render prefix()}
  {/if}
  <input
    class="input input-ghost h-[2.2rem] min-h-[2.2rem] w-full border px-4 font-medium text-gray-400 placeholder:text-accent/50 focus-within:border-transparent focus:bg-transparent focus:text-gray-400 focus:outline-none"
    bind:this={input}
    {placeholder}
    {name}
    bind:value
    oninput={handleChange}
    {disabled}
    autocomplete="off"
    onfocus={handleFocus}
  />
  {#if suffix}
    {@render suffix()}
  {/if}
</div>
