<script lang="ts">
  import { formatEther, isAddress, type TransactionBase, type TransactionReceipt } from "viem";
  import { replacer } from "$lib/utils/scaffold-eth/common";
  import { Address } from "$lib/components/scaffold-eth";

  type DisplayContent =
    | string
    | number
    | bigint
    | Record<string, any>
    | TransactionBase
    | TransactionReceipt
    | undefined
    | unknown;

  type Display = string | number | { type: "address"; address: string } | { type: "span"; content: string };

  const { content, asText = false }: { content: DisplayContent | DisplayContent[]; asText?: boolean } = $props();

  const display = (content: DisplayContent | DisplayContent[], asTextOverride?: boolean): Display => {
    const displayAsText = asTextOverride ?? asText;
    if (content === null) return "";

    if (typeof content === "bigint") {
      try {
        const asNumber = Number(content);
        if (asNumber <= Number.MAX_SAFE_INTEGER && asNumber >= Number.MIN_SAFE_INTEGER) {
          return asNumber;
        } else {
          return `Ξ${formatEther(content)}`;
        }
      } catch {
        return `Ξ${formatEther(content)}`;
      }
    }

    if (typeof content === "string" && isAddress(content)) {
      if (displayAsText) {
        return content;
      } else {
        return { type: "address", address: content };
      }
    }

    if (Array.isArray(content)) {
      const mostReadable = (v: DisplayContent) => (["number", "boolean"].includes(typeof v) ? v : display(v, true));
      const displayable = JSON.stringify(content.map(mostReadable), replacer);

      return displayAsText ? displayable : { type: "span", content: displayable.replaceAll(",", ",\n") };
    }

    return JSON.stringify(content, replacer, 2);
  };

  let res = $derived(display(content, asText));
</script>

{#if typeof res !== "object"}
  {res}
{:else if res.type === "address"}
  <Address address={res.address} />
{:else if res.type === "span"}
  <span style="overflow-wrap: break-word; width: 100%">{res.content}</span>
{:else}
  {typeof res}
  abcde
{/if}
