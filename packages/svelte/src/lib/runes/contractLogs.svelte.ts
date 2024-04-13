import { createPublicClient } from "@byteatatime/wagmi-svelte";
import type { Address, Log } from "viem";

export const createContractLogs = (address: Address) => {
  let logs = $state<Log[]>([]);
  const client = $derived.by(createPublicClient());

  $effect(() => {
    const fetchLogs = async () => {
      if (!client) return console.error("Client not found");
      try {
        const existingLogs = await client.getLogs({
          address: address,
          fromBlock: 0n,
          toBlock: "latest",
        });
        logs = existingLogs ?? [];
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      }
    };
    fetchLogs();

    return client?.watchBlockNumber({
      onBlockNumber: async (_blockNumber, prevBlockNumber) => {
        const newLogs = await client.getLogs({
          address: address,
          fromBlock: prevBlockNumber,
          toBlock: "latest",
        });
        logs = [...logs, ...(newLogs ?? [])];
      },
    });
  });

  return () => logs;
};
