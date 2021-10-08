import { CosmWasmClient, SigningCosmWasmClient } from 'secretjs';

declare global {
  interface Window {
    keplr?: any;
    secretjs?: CosmWasmClient;
    secretjsSend?: SigningCosmWasmClient;
    getOfflineSigner: any;
    getEnigmaUtils: any;
  }
}
