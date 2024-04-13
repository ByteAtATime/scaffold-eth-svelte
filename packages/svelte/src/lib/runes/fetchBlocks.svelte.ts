import {
  type Block,
  type Hash,
  type Transaction,
  type TransactionReceipt,
  createTestClient,
  publicActions,
  walletActions,
  webSocket,
} from "viem";
import { hardhat } from "viem/chains";
import { decodeTransactionData } from "$lib/utils/scaffold-eth/decodeTxData";

const BLOCKS_PER_PAGE = 20;

export const testClient = createTestClient({
  chain: hardhat,
  mode: "hardhat",
  transport: webSocket("ws://127.0.0.1:8545"),
})
  .extend(publicActions)
  .extend(walletActions);

export const createFetchBlocks = () => {
  let blocks = $state<Block[]>([]);
  let transactionReceipts = $state<{
    [key: string]: TransactionReceipt;
  }>({});
  let currentPage = $state(0);
  let totalBlocks = $state(0n);
  let error = $state<Error | null>(null);

  const fetchBlocks = async () => {
    error = null;

    try {
      const blockNumber = await testClient.getBlockNumber();
      totalBlocks = blockNumber;

      const startingBlock = blockNumber - BigInt(currentPage * BLOCKS_PER_PAGE);
      const blockNumbersToFetch = Array.from(
        {
          length: Number(BLOCKS_PER_PAGE < startingBlock + 1n ? BLOCKS_PER_PAGE : startingBlock + 1n),
        },
        (_, i) => startingBlock - BigInt(i),
      );

      const blocksWithTransactions = blockNumbersToFetch.map(async blockNumber => {
        try {
          return testClient.getBlock({ blockNumber, includeTransactions: true });
        } catch (err) {
          error = err instanceof Error ? err : new Error("An error occurred.");
          throw err;
        }
      });
      const fetchedBlocks = await Promise.all(blocksWithTransactions);

      fetchedBlocks.forEach(block => {
        block.transactions.forEach(tx => decodeTransactionData(tx as Transaction));
      });

      const txReceipts = await Promise.all(
        fetchedBlocks.flatMap(block =>
          block.transactions.map(async tx => {
            try {
              const receipt = await testClient.getTransactionReceipt({
                hash: (tx as Transaction).hash,
              });
              return { [(tx as Transaction).hash]: receipt };
            } catch (err) {
              error = err instanceof Error ? err : new Error("An error occurred.");
              throw err;
            }
          }),
        ),
      );

      blocks = fetchedBlocks;
      transactionReceipts = {
        ...transactionReceipts,
        ...Object.assign({}, ...txReceipts),
      };
    } catch (err) {
      error = err instanceof Error ? err : new Error("An error occurred.");
    }
  };

  $effect(() => {
    fetchBlocks();
  });

  $effect(() => {
    const handleNewBlock = async (newBlock: any) => {
      try {
        if (currentPage === 0) {
          if (newBlock.transactions.length > 0) {
            const transactionsDetails = await Promise.all(
              newBlock.transactions.map((txHash: string) => testClient.getTransaction({ hash: txHash as Hash })),
            );
            newBlock.transactions = transactionsDetails;
          }

          newBlock.transactions.forEach((tx: Transaction) => decodeTransactionData(tx as Transaction));

          const receipts = await Promise.all(
            newBlock.transactions.map(async (tx: Transaction) => {
              try {
                const receipt = await testClient.getTransactionReceipt({
                  hash: (tx as Transaction).hash,
                });
                return { [(tx as Transaction).hash]: receipt };
              } catch (err) {
                error = err instanceof Error ? err : new Error("An error occurred fetching receipt.");
                throw err;
              }
            }),
          );

          blocks = [newBlock, ...blocks.slice(0, BLOCKS_PER_PAGE - 1)];
          transactionReceipts = {
            ...transactionReceipts,
            ...Object.assign({}, ...receipts),
          };
        }
        if (newBlock.number) {
          totalBlocks = newBlock.number;
        }
      } catch (err) {
        error = err instanceof Error ? err : new Error("An error occurred.");
      }
    };

    return testClient.watchBlocks({ onBlock: handleNewBlock, includeTransactions: true });
  });

  return () => ({
    blocks,
    transactionReceipts,
    currentPage,
    totalBlocks,
    error,
    setCurrentPage(newCurrentPage: number) {
      currentPage = newCurrentPage;
    },
  });
};
