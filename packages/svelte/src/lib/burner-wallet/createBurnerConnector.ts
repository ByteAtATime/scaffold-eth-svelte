/*
 * TODO: Need to find better way to handle `getProvider`
 * TODO: Burner Wallet does not show in Rainbow wallets
 * If we don't find any good solution might need to implement our provider
 * Good reference: https://github.com/safe-global/safe-apps-sdk/blob/main/packages/safe-apps-provider/src/provider.ts#L1
 * Using ethers `EIP1193ProviderBridge` to create a provider also does not work properly
 * @example:
 * ```ts
 * const provider = new EIP1193ProviderBridge(wallet, provider);
 * ```
 */
import { loadBurnerSK } from "./utils";
import { BaseError, createWagmiConnector } from "@byteatatime/wagmi-svelte";
import {
  type EIP1193RequestFn,
  type Hex,
  RpcRequestError,
  SwitchChainError,
  type Transport,
  type WalletRpcSchema,
  createWalletClient,
  custom,
  fromHex,
  getAddress,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getHttpRpcClient, hexToBigInt, numberToHex } from "viem/utils";
import type { SendTransactionParameters } from "viem/zksync";

export const burnerWalletId = "burnerWallet";
export const burnerWalletName = "Burner Wallet";
export const burnerWalletIconBase64 =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUzIiBoZWlnaHQ9IjM1MiIgdmlld0JveD0iMCAwIDM1MyAzNTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHg9IjAuNzE2MzA5IiB5PSIwLjMxNzEzOSIgd2lkdGg9IjM1MS4zOTQiIGhlaWdodD0iMzUxLjM5NCIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzNfMTUxKSIvPgo8Y2lyY2xlIGN4PSIzNC40OTUzIiBjeT0iMzQuNDk1MyIgcj0iMzQuNDk1MyIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMjA3LjAxOCAyNTQuMTIpIiBmaWxsPSIjRkY2NjBBIi8+CjxwYXRoIGQ9Ik0xNTQuMzE4IDMxNy45NTVDMTcxLjI3MyAzMTAuODkgMTc2LjU4MiAyOTAuNzE1IDE3Ni4xNTcgMjgzLjQ4N0wyMDcuMDE4IDI4OC44NjRDMjA3LjAxOCAzMDMuMzE0IDIwMC4yMTIgMzA5LjQwMiAxOTcuODI0IDMxMi40MzNDMTkzLjQ3NCAzMTcuOTU1IDE3My4zNTEgMzMwLjAzIDE1NC4zMTggMzE3Ljk1NVoiIGZpbGw9InVybCgjcGFpbnQxX3JhZGlhbF8zXzE1MSkiLz4KPGcgZmlsdGVyPSJ1cmwoI2ZpbHRlcjBfZF8zXzE1MSkiPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTIyNy4zNzcgMzAyLjI3NkMyMjYuNDI2IDMwNS44OTcgMjMwLjMxNSAzMDkuNDA1IDIzMy4zOTYgMzA3LjI3OUMyNTQuNTM4IDI5Mi42ODQgMjcwLjQ3OSAyNjkuOTQ1IDI3NC44OSAyNDcuNDg5QzI4Mi4yNCAyMTAuMDcxIDI3Mi4yMzUgMTc1LjcyNyAyMzguMDI4IDE0NS45MjVDMjAwLjg3NCAxMTMuNTU2IDE5MS44NDQgODguNDU2MSAxOTAuMTYyIDUwLjg3MThDMTg5Ljc5NyA0Mi43MjE4IDE4MS42MDQgMzcuMjk0NyAxNzQuODI0IDQxLjgzMTdDMTUyLjY2OCA1Ni42NTc0IDEzMi41MTIgODQuNDk5IDEzOC45MTEgMTIwLjc1OEMxNDEuMDA0IDEzMi42MjEgMTQ2Ljc5NCAxNDEuMDE2IDE1MS45NyAxNDguNTIzQzE1OC40OTEgMTU3Ljk3OCAxNjQuMDM5IDE2Ni4wMjMgMTU5Ljk5NyAxNzcuODFDMTU1LjIwMyAxOTEuNzk0IDEzOS4xMzQgMTk5LjE2MiAxMjguNzQ3IDE5Mi40MjlDMTE0LjE3IDE4Mi45ODEgMTEzLjI1MyAxNjYuNjUxIDExNy45NjkgMTQ5LjQ1NkMxMTguOTAyIDE0Ni4wNTUgMTE1LjQ3MSAxNDMuMjA0IDExMi42OCAxNDUuMzU5QzkxLjM2MDQgMTYxLjgyMSA2OS4xNTMyIDE5OS4yNjcgNzcuNjY0NyAyNDcuNDg5Qzg1Ljk3OTIgMjc2LjIxMiA5Ny45Mjc3IDI5Mi41MzcgMTEwLjk3MSAzMDEuNTQxQzExMy43NjMgMzAzLjQ2OCAxMTcuMTU5IDMwMC42MzEgMTE2LjU5NyAyOTcuMjg2QzExNi4wODEgMjk0LjIxMiAxMTUuODEzIDI5MS4wNTQgMTE1LjgxMyAyODcuODMzQzExNS44MTMgMjU2LjUxMyAxNDEuMjAzIDIzMS4xMjMgMTcyLjUyMyAyMzEuMTIzQzIwMy44NDIgMjMxLjEyMyAyMjkuMjMyIDI1Ni41MTMgMjI5LjIzMiAyODcuODMzQzIyOS4yMzIgMjkyLjgyNCAyMjguNTg3IDI5Ny42NjUgMjI3LjM3NyAzMDIuMjc2WiIgZmlsbD0idXJsKCNwYWludDJfbGluZWFyXzNfMTUxKSIvPgo8L2c+CjxkZWZzPgo8ZmlsdGVyIGlkPSJmaWx0ZXIwX2RfM18xNTEiIHg9IjcyLjExMTIiIHk9IjM2LjQ5NCIgd2lkdGg9IjIwOC43NDIiIGhlaWdodD0iMjc1LjEyIiBmaWx0ZXJVbml0cz0idXNlclNwYWNlT25Vc2UiIGNvbG9yLWludGVycG9sYXRpb24tZmlsdGVycz0ic1JHQiI+CjxmZUZsb29kIGZsb29kLW9wYWNpdHk9IjAiIHJlc3VsdD0iQmFja2dyb3VuZEltYWdlRml4Ii8+CjxmZUNvbG9yTWF0cml4IGluPSJTb3VyY2VBbHBoYSIgdHlwZT0ibWF0cml4IiB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDEyNyAwIiByZXN1bHQ9ImhhcmRBbHBoYSIvPgo8ZmVPZmZzZXQvPgo8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIxLjg0NTA2Ii8+CjxmZUNvbXBvc2l0ZSBpbjI9ImhhcmRBbHBoYSIgb3BlcmF0b3I9Im91dCIvPgo8ZmVDb2xvck1hdHJpeCB0eXBlPSJtYXRyaXgiIHZhbHVlcz0iMCAwIDAgMCAxIDAgMCAwIDAgMC40MiAwIDAgMCAwIDAgMCAwIDAgMC43IDAiLz4KPGZlQmxlbmQgbW9kZT0ibXVsdGlwbHkiIGluMj0iQmFja2dyb3VuZEltYWdlRml4IiByZXN1bHQ9ImVmZmVjdDFfZHJvcFNoYWRvd18zXzE1MSIvPgo8ZmVCbGVuZCBtb2RlPSJub3JtYWwiIGluPSJTb3VyY2VHcmFwaGljIiBpbjI9ImVmZmVjdDFfZHJvcFNoYWRvd18zXzE1MSIgcmVzdWx0PSJzaGFwZSIvPgo8L2ZpbHRlcj4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzNfMTUxIiB4MT0iMTc2LjQxMyIgeTE9IjAuMzE3MTM5IiB4Mj0iMTc2LjQxMyIgeTI9IjM1MS43MTEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI0ZGRjI3OSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNGRkQzMzYiLz4KPC9saW5lYXJHcmFkaWVudD4KPHJhZGlhbEdyYWRpZW50IGlkPSJwYWludDFfcmFkaWFsXzNfMTUxIiBjeD0iMCIgY3k9IjAiIHI9IjEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBncmFkaWVudFRyYW5zZm9ybT0idHJhbnNsYXRlKDIxOC4wNDggMjQ5LjM0Nykgcm90YXRlKDEyNC4wMTgpIHNjYWxlKDg5LjI5NTUgMjY0LjgwOSkiPgo8c3RvcCBvZmZzZXQ9IjAuNjQwODUiIHN0b3AtY29sb3I9IiNGRjY2MEEiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRkZCRTE1Ii8+CjwvcmFkaWFsR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQyX2xpbmVhcl8zXzE1MSIgeDE9IjE3Ni40ODIiIHkxPSI0MC4xODQxIiB4Mj0iMTc2LjQ4MiIgeTI9IjMxNy4yNzgiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agb2Zmc2V0PSIwLjMzODU0MiIgc3RvcC1jb2xvcj0iI0ZGOEYzRiIvPgo8c3RvcCBvZmZzZXQ9IjAuNjU2MjUiIHN0b3AtY29sb3I9IiNGRjcwMjAiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRkYzRDAwIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==";

export class ConnectorNotConnectedError extends BaseError {
  override name = "ConnectorNotConnectedError";
  constructor() {
    super("Connector not connected.");
  }
}

export class ChainNotConfiguredError extends BaseError {
  override name = "ChainNotConfiguredError";
  constructor() {
    super("Chain not configured.");
  }
}

type Provider = ReturnType<Transport<"custom", Record<any, any>, EIP1193RequestFn<WalletRpcSchema>>>;

export const createBurnerConnector = () => {
  let connected = true;
  let connectedChainId: number;

  return createWagmiConnector<Provider>(config => ({
    id: burnerWalletId,
    name: burnerWalletName,
    type: "burnerWallet",
    icon: burnerWalletIconBase64,
    async connect({ chainId } = {}) {
      const provider = await this.getProvider();
      const accounts = await provider.request({
        method: "eth_accounts",
      });
      let currentChainId = await this.getChainId();
      if (chainId && currentChainId !== chainId && this.switchChain) {
        const chain = await this.switchChain({ chainId });
        currentChainId = chain.id;
      }
      connected = true;
      return { accounts, chainId: currentChainId };
    },
    async getProvider({ chainId } = {}) {
      const chain = config.chains.find(x => x.id === chainId) ?? config.chains[0];

      const url = chain.rpcUrls.default.http[0];
      const burnerAccount = privateKeyToAccount(loadBurnerSK());
      const client = createWalletClient({
        chain: chain,
        account: burnerAccount,
        transport: http(),
      });

      const request: EIP1193RequestFn = async ({ method, params }) => {
        if (method === "eth_sendTransaction") {
          const actualParams = (params as SendTransactionParameters[])[0];
          const value = actualParams.value ? hexToBigInt(actualParams.value as unknown as Hex) : undefined;
          const hash = await client.sendTransaction({
            ...(params as SendTransactionParameters[])[0],
            value,
          });
          return hash;
        }

        if (method === "eth_accounts") {
          return [burnerAccount.address];
        }

        if (method === "wallet_switchEthereumChain") {
          type Params = [{ chainId: Hex }];
          connectedChainId = fromHex((params as Params)[0].chainId, "number");
          this.onChainChanged(connectedChainId.toString());
          return;
        }

        const body = { method, params };
        const httpClient = getHttpRpcClient(url);
        const { error, result } = await httpClient.request({ body });
        if (error) throw new RpcRequestError({ body, error, url });

        return result;
      };

      return custom({ request })({ retryCount: 0 });
    },
    onChainChanged(chain) {
      const chainId = Number(chain);
      config.emitter.emit("change", { chainId });
    },
    async getAccounts() {
      if (!connected) throw new ConnectorNotConnectedError();
      const provider = await this.getProvider();
      const accounts = await provider.request({ method: "eth_accounts" });
      return [accounts.map(x => getAddress(x))[0]];
    },
    async onDisconnect() {
      config.emitter.emit("disconnect");
      connected = false;
    },
    async getChainId() {
      const provider = await this.getProvider();
      const hexChainId = await provider.request({ method: "eth_chainId" });
      return fromHex(hexChainId, "number");
    },
    async isAuthorized() {
      if (!connected) return false;
      const accounts = await this.getAccounts();
      return !!accounts.length;
    },
    onAccountsChanged(accounts) {
      if (accounts.length === 0) this.onDisconnect();
      else
        config.emitter.emit("change", {
          accounts: accounts.map(x => getAddress(x)),
        });
    },
    async switchChain({ chainId }) {
      const provider = await this.getProvider();
      const chain = config.chains.find(x => x.id === chainId);
      if (!chain) throw new SwitchChainError(new ChainNotConfiguredError());

      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: numberToHex(chainId) }],
      });
      return chain;
    },
    disconnect() {
      console.log("disconnect from burnerwallet");
      connected = false;
      return Promise.resolve();
    },
  }));
};
