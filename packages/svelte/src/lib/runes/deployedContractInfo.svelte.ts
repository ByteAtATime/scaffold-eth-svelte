import { targetNetwork } from "./global.svelte";
import { createPublicClient } from "@byteatatime/wagmi-svelte";
import { ContractCodeStatus, contracts, type Contract, type ContractName } from "$lib/utils/scaffold-eth/contract";

export const createDeployedContractInfo = <TContractName extends ContractName>(contractName: TContractName) => {
  const deployedContract = $state(
    contracts?.[targetNetwork.targetNetwork.id]?.[contractName as ContractName] as Contract<TContractName>,
  );
  let status = $state(ContractCodeStatus.LOADING);
  const publicClient = createPublicClient({ chainId: targetNetwork.targetNetwork.id });

  $effect(() => {
    const checkContractDeployment = async () => {
      if (!deployedContract) {
        status = ContractCodeStatus.NOT_FOUND;
        return;
      }
      const code = await publicClient.result?.getBytecode({
        address: deployedContract.address,
      });

      if (code === "0x") {
        status = ContractCodeStatus.NOT_FOUND;
        return;
      }
      status = ContractCodeStatus.DEPLOYED;
    };

    checkContractDeployment();
  });

  return {
    get data() {
      return status === ContractCodeStatus.DEPLOYED ? deployedContract : undefined;
    },
    get isLoading() {
      return status === ContractCodeStatus.LOADING;
    },
  };
};
