<script lang="ts">
  import { createTransactor } from "$lib/runes/transactor.svelte";
  import { createAccount, createBalance } from "@byteatatime/wagmi-svelte";
  import { Banknotes, Icon } from "svelte-hero-icons";
  import { createWalletClient, http, parseEther } from "viem";
  import { hardhat } from "viem/chains";

  const AMOUNT_TO_SEND = "1";
  const FAUCET_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  const { address, chain } = $derived.by(createAccount());
  const localWalletClient = createWalletClient({
    chain: hardhat,
    transport: http(),
  });

  const faucetTxn = $derived.by(createTransactor(() => localWalletClient));

  let balance = $derived.by(createBalance(() => ({ address: FAUCET_ADDRESS })));

  const isBalanceZero = $derived(balance.data?.value === 0n);

  let loading = $state(false);

  const sendETH = async () => {
    try {
      loading = true;
      await faucetTxn({
        chain: hardhat,
        account: FAUCET_ADDRESS,
        to: address,
        value: parseEther(AMOUNT_TO_SEND),
      });
      loading = false;
    } catch (error) {
      console.error("⚡️ ~ file: FaucetButton.tsx:sendETH ~ error", error);
      loading = false;
    }
  };
</script>

{#if chain?.id === hardhat.id}
  <div
    class={!isBalanceZero
      ? "ml-1"
      : "tooltip tooltip-bottom tooltip-open tooltip-secondary ml-1 font-bold before:left-auto before:right-0 before:transform-none before:content-[attr(data-tip)]"}
    data-tip="Grab funds from faucet"
  >
    <button class="btn btn-secondary btn-sm rounded-full px-2" onclick={sendETH} disabled={loading}>
      {#if loading}
        <span class="loading loading-spinner loading-xs"></span>
      {:else}
        <Icon src={Banknotes} class="h-4 w-4" />
      {/if}
    </button>
  </div>
{/if}
