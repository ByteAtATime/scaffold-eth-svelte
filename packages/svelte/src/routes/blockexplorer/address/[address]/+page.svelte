<script lang="ts">
  import AddressComponent from "../../_components/AddressComponent.svelte";

  const { data }: { data: { contractData: { bytecode: string; assembly: string } | null; address: string } } = $props();

  const { contractData, address } = $derived(data);
</script>

<AddressComponent {address} {contractData} />
