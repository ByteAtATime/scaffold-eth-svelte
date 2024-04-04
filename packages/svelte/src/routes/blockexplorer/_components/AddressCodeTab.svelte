<script lang="ts">
  const { bytecode, assembly }: { bytecode: string; assembly: string } = $props();

  const formattedAssembly = $derived(
    Array.from(assembly.matchAll(/\w+( 0x[a-fA-F0-9]+)?/g))
      .map(it => it[0])
      .join("\n"),
  );
</script>

<div class="flex flex-col gap-3 p-4">
  Bytecode
  <div class="mockup-code max-h-[500px] overflow-y-auto -indent-5">
    <pre class="px-5"><code class="overflow-auto whitespace-pre-wrap break-words">{bytecode}</code></pre>
  </div>
  Opcodes
  <div class="mockup-code max-h-[500px] overflow-y-auto -indent-5">
    <pre class="px-5"><code>{formattedAssembly}</code></pre>
  </div>
</div>
