import scaffoldConfig from "$lib/scaffold.config";
import { contracts } from "$lib/utils/scaffold-eth/contract";

export function getAllContracts() {
  const contractsData = contracts?.[scaffoldConfig.targetNetworks[0].id];
  return contractsData ? contractsData : {};
}
