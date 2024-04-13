<script lang="ts">
  import { Banknotes, Icon } from "svelte-hero-icons";
  import { createWalletClient, type Address as AddressType, http, parseEther } from "viem";
  import Address from "./Address.svelte";
  import Balance from "./Balance.svelte";
  import AddressInput from "./inputs/AddressInput.svelte";
  import { createAccount } from "@byteatatime/wagmi-svelte";
  import { createTransactor } from "$lib/runes/transactor.svelte";
  import { hardhat } from "viem/chains";
  import { notification } from "$lib/utils/scaffold-eth/notification";
  import FaucetNotification from "./FaucetNotification.svelte";
  import { untrack } from "svelte";
  import EtherInput from "./inputs/EtherInput.svelte";

  const FAUCET_ACCOUNT_INDEX = 0;

  const localWalletClient = createWalletClient({
    chain: hardhat,
    transport: http(),
  });

  let loading = $state(false);
  let inputAddress = $state<AddressType>("" as AddressType);
  let faucetAddress = $state<AddressType>();
  let sendValue = $state("");

  const { chain } = $derived.by(createAccount());

  const faucetTxn = $derived.by(createTransactor(() => localWalletClient));

  $effect(() => {
    untrack(() => {
      const getFaucetAddress = async () => {
        try {
          const accounts = await localWalletClient.getAddresses();
          faucetAddress = accounts[FAUCET_ACCOUNT_INDEX];
        } catch (error) {
          notification.error(FaucetNotification);
          console.error("⚡️ ~ file: Faucet.tsx:getFaucetAddress ~ error", error);
        }
      };
      getFaucetAddress();
    });
  });

  const sendETH = async () => {
    if (!faucetAddress) {
      return;
    }
    try {
      loading = true;
      await faucetTxn({
        to: inputAddress,
        value: parseEther(sendValue as `${number}`),
        account: faucetAddress,
        chain: hardhat,
      });
      loading = false;
      inputAddress = "" as AddressType;
      sendValue = "";
    } catch (error) {
      console.error("⚡️ ~ file: Faucet.tsx:sendETH ~ error", error);
      loading = false;
    }
  };
</script>

{#if chain?.id === hardhat.id}
  <div>
    <label for="faucet-modal" class="btn btn-primary btn-sm gap-1 font-normal">
      <Icon src={Banknotes} class="h-4 w-4" />
      <span>Faucet</span>
    </label>
    <input type="checkbox" id="faucet-modal" class="modal-toggle" />
    <label for="faucet-modal" class="modal cursor-pointer">
      <label class="modal-box relative">
        <input class="absolute left-0 top-0 h-0 w-0" />
        <h3 class="mb-3 text-xl font-bold">Local Faucet</h3>
        <label for="faucet-modal" class="btn btn-circle btn-ghost btn-sm absolute right-3 top-3"> ✕ </label>
        <div class="space-y-3">
          <div class="flex space-x-4">
            <div>
              <span class="text-sm font-bold">From:</span>
              <Address address={faucetAddress} />
            </div>
            <div>
              <span class="pl-3 text-sm font-bold">Available:</span>
              <Balance address={faucetAddress} />
            </div>
          </div>
          <div class="flex flex-col space-y-3">
            <AddressInput placeholder="Destination Address" bind:value={inputAddress} />
            <EtherInput placeholder="Amount to send" value={sendValue} onchange={value => (sendValue = value)} />
            <button class="btn btn-primary btn-sm h-10 rounded-full px-2" onclick={sendETH} disabled={loading}>
              {#if loading}
                <span class="loading loading-spinner loading-sm"></span>
              {:else}
                <Icon src={Banknotes} class="h-6 w-6" />
              {/if}
              <span>Send</span>
            </button>
          </div>
        </div>
      </label>
    </label>
  </div>
{/if}
