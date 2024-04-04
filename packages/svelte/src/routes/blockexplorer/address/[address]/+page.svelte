<script lang="ts">
  import { page } from "$app/stores";
  import AddressComponent from "../../_components/AddressComponent.svelte";

  const { data }: { contractData: { bytecode: string; assembly: string } | null; address: string } = $props();

  const { contractData, address } = $derived(data);
</script>

<AddressComponent {address} {contractData} />
