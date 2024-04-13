<script lang="ts">
  import type { AbiParameter } from "abitype";
  import { AddressInput, InputBase, IntegerInput, IntegerVariant } from "$lib/components/scaffold-eth/inputs";

  const {
    setForm,
    form,
    stateObjectKey,
    paramType,
  }: {
    setForm: (newFormValue: Record<string, any> | ((prevState: Record<string, any>) => Record<string, any>)) => void;
    form: Record<string, any> | undefined;
    stateObjectKey: string;
    paramType: AbiParameter;
  } = $props();

  const inputProps = $derived({
    name: stateObjectKey,
    value: form?.[stateObjectKey],
    placeholder: paramType.name ? `${paramType.type} ${paramType.name}` : paramType.type,
    onchange: (value: any) => {
      setForm({ ...form, [stateObjectKey]: value });
    },
  });
</script>

<div class="flex w-full flex-col gap-1.5">
  <div class="ml-2 flex items-center">
    {#if paramType.name}
      <span class="mr-2 text-xs font-medium leading-none">{paramType.name}</span>
    {/if}
    <span class="block text-xs font-extralight leading-none">{paramType.type}</span>
  </div>

  {#if paramType.type === "address"}
    <AddressInput {...inputProps} />
  {:else if paramType.type === "string"}
    <InputBase {...inputProps} />
  {:else if paramType.type.includes("int") && !paramType.type.includes("[")}
    <IntegerInput {...inputProps} variant={paramType.type as IntegerVariant} />
  {/if}
</div>
