<script lang="ts">
  import type { Address as AddressType } from "viem";
  import QRCode from "@castlenine/svelte-qrcode";
  import { Address } from "$lib/components/scaffold-eth";

  const { address, modalId }: { address: AddressType; modalId: string } = $props();
</script>

<div>
  <input type="checkbox" id={modalId} class="modal-toggle" />
  <label for={modalId} class="modal cursor-pointer">
    <label class="modal-box relative">
      <!-- dummy input to capture event onclick on modal box -->
      <input class="absolute left-0 top-0 h-0 w-0" />
      <label for={`${modalId}`} class="btn btn-circle btn-ghost btn-sm absolute right-3 top-3"> ✕ </label>
      <div class="space-y-3 py-6">
        <div class="flex flex-col items-center gap-6 space-x-4">
          <QRCode
            content={address}
            size={256}
            padding={0}
            backgroundColor="oklch(var(--b1))"
            color="oklch(var(--bc))"
          />
          <Address {address} format="long" disableAddressLink />
        </div>
      </div>
    </label>
  </label>
</div>
