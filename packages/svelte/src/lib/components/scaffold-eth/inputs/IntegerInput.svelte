<script lang="ts">
  import InputBase from "./InputBase.svelte";
  import { IntegerVariant, type CommonInputProps, isValidInteger } from "./utils";

  let {
    // I have no idea why ESLint doesn't recognize $bindable
    // eslint-disable-next-line no-undef
    value = $bindable(),
    onchange,
    name,
    placeholder,
    disabled,
    variant = IntegerVariant.INT256,
    disableMultiplyBy1e18 = false,
  }: CommonInputProps<string | bigint> & {
    variant?: IntegerVariant;
    disableMultiplyBy1e18?: boolean;
  } = $props();

  $effect(() => {
    if (isValidInteger(variant, value, false)) {
      inputError = false;
    } else {
      inputError = true;
    }
  });

  let inputError = $state(false);

  const multiplyBy1e18 = () => {
    if (!value) return;
    if (typeof value === "bigint") {
      value = value * 10n ** 18n;
      return onchange?.(value);
    }
    value = BigInt(Math.round(Number(value) * 10 ** 18));
    return onchange?.(value);
  };
</script>

<InputBase {name} bind:value {placeholder} error={inputError} {onchange} {disabled}>
  {#snippet suffix()}
    {#if !inputError && !disableMultiplyBy1e18}
      <div
        class="tooltip tooltip-top tooltip-secondary flex space-x-4 before:left-auto before:right-[-10px] before:transform-none before:content-[attr(data-tip)]"
        data-tip="Multiply by 10^18 (wei)"
      >
        <button
          class="{disabled ? 'cursor-not-allowed' : 'cursor-pointer'} px-4 font-semibold text-accent"
          onclick={multiplyBy1e18}
          {disabled}
        >
          ∗
        </button>
      </div>
    {/if}
  {/snippet}
</InputBase>
