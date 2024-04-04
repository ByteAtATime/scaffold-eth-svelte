import type { TransactionWithFunction } from "./block";
import type { GenericContractsDeclaration } from "./contract";
import type { AbiConstructor, AbiError, AbiFallback, AbiFunction } from "abitype";
import { type Abi, decodeFunctionData, getAbiItem, type AbiEvent } from "viem";
import { hardhat } from "viem/chains";
import contractData from "$lib/contracts/deployedContracts";

type ContractsInterfaces = Record<string, Abi>;
type TransactionType = TransactionWithFunction | null;

const deployedContracts = contractData as GenericContractsDeclaration | null;
const chainMetaData = deployedContracts?.[hardhat.id];
const interfaces = chainMetaData
  ? Object.entries(chainMetaData).reduce((finalInterfacesObj, [contractName, contract]) => {
      finalInterfacesObj[contractName] = contract.abi;
      return finalInterfacesObj;
    }, {} as ContractsInterfaces)
  : {};

export const decodeTransactionData = (tx: TransactionWithFunction) => {
  if (tx.input.length >= 10 && !tx.input.startsWith("0x60e06040")) {
    for (const [, contractAbi] of Object.entries(interfaces)) {
      try {
        const { functionName, args } = decodeFunctionData({
          abi: contractAbi,
          data: tx.input,
        });
        tx.functionName = functionName;
        tx.functionArgs = args as any[];
        const abiItem = getAbiItem({ abi: contractAbi, name: functionName }) as
          | AbiConstructor
          | AbiError
          | AbiEvent
          | AbiFallback
          | AbiFunction;
        tx.functionArgNames = abiItem?.inputs?.map((input: any) => input.name);
        tx.functionArgTypes = abiItem?.inputs?.map((input: any) => input.type);

        break;
      } catch (e) {
        console.error(`Parsing failed: ${e}`);
      }
    }
  }
  return tx;
};

export const getFunctionDetails = (transaction: TransactionType) => {
  if (
    transaction &&
    transaction.functionName &&
    transaction.functionArgNames &&
    transaction.functionArgTypes &&
    transaction.functionArgs
  ) {
    const details = transaction.functionArgNames.map(
      (name, i) => `${transaction.functionArgTypes?.[i] || ""} ${name} = ${transaction.functionArgs?.[i] ?? ""}`,
    );
    return `${transaction.functionName}(${details.join(", ")})`;
  }
  return "";
};
