import { CosmWasmClient, BroadcastMode } from 'secretjs';
import { divDecimals, formatWithSixDecimals, toFixedTrunc } from '../utils/numberFormat';
import {
  unlockToken,
  fixUnlockToken,
  ERROR_WRONG_VIEWING_KEY,
  SECRET_RPC,
  SECRET_LCD,
} from '../constants';
import { sleep } from './utils';
import { Snip20GetBalance } from './snip20';
import { PatchedSigningCosmWasmClient } from '../libs/PatchedSigningCosmWasmClient'

const chainId = process.env.CHAIN_ID;
export interface Keplr {
  suggestToken: any;
  experimentalSuggestChain: any;
  enable: any;
  getSecret20ViewingKey: any;
}

export const getViewingKey = async (params: {
  keplr: any;
  chainId: string;
  address: string;
  currentBalance?: string;
}) => {
  const { keplr, chainId, address, currentBalance } = params;

  if (typeof currentBalance === 'string' && currentBalance.includes(ERROR_WRONG_VIEWING_KEY)) {
    await sleep(1000);
  }

  let viewingKey: string;

  let tries = 0;
  while (true) {
    tries += 1;
    try {
      viewingKey = await keplr.getSecret20ViewingKey(chainId, address);
      // console.log('-- viewingKey: ', viewingKey);
    } catch (error) { }
    if (viewingKey || tries === 3) {
      break;
    }
    await sleep(100);
  }

  return viewingKey;
};

export const getKeplr = (): Keplr | undefined => {
  if (window.keplr) {
    return window.keplr;
  }
  return undefined;
};

export const getKeplrOrFail = (): Keplr => {
  const keplr = getKeplr();
  if (keplr) {
    return keplr;
  }
  throw new Error('Global variable keplr is undefined.');
};

export const keplrCheckPromise = async () => {
  return new Promise(async (resolve, reject) => {
    // 1. Every one second, check if Keplr was injected to the page
    try {
      const keplrCheckInterval = setInterval(async () => {
        try {
          const keplr = getKeplr();
          const isKeplrWallet = !!keplr && !!window.getOfflineSigner && !!window.getEnigmaUtils;

          if (isKeplrWallet) {
            // Keplr is present, stop checking
            clearInterval(keplrCheckInterval);
            resolve({ keplr, isKeplrWallet });
            return;
          }
        } catch (error) {
          console.error(error);
        }
      }, 1000);
    } catch (error) {
      reject(error);
    }
  });
};

export const signInKeplr = async () => {
  try {
    const chainId = process.env.CHAIN_ID;
    const keplr = getKeplrOrFail();

    // Setup Secret Testnet (not needed on mainnet)
    if (process.env.ENV !== 'MAINNET') {
      await keplr.experimentalSuggestChain({
        chainId,
        chainName: process.env.CHAIN_NAME,
        rpc: SECRET_RPC,
        rest: SECRET_LCD,
        bip44: {
          coinType: 529,
        },
        coinType: 529,
        stakeCurrency: {
          coinDenom: 'SCRT',
          coinMinimalDenom: 'uscrt',
          coinDecimals: 6,
        },
        bech32Config: {
          bech32PrefixAccAddr: 'secret',
          bech32PrefixAccPub: 'secretpub',
          bech32PrefixValAddr: 'secretvaloper',
          bech32PrefixValPub: 'secretvaloperpub',
          bech32PrefixConsAddr: 'secretvalcons',
          bech32PrefixConsPub: 'secretvalconspub',
        },
        currencies: [
          {
            coinDenom: 'SCRT',
            coinMinimalDenom: 'uscrt',
            coinDecimals: 6,
          },
        ],
        feeCurrencies: [
          {
            coinDenom: 'SCRT',
            coinMinimalDenom: 'uscrt',
            coinDecimals: 6,
          },
        ],
        gasPriceStep: {
          low: 0.1,
          average: 0.25,
          high: 0.4,
        },
        features: ['secretwasm'],
      });
    }

    // Ask the user for permission
    await keplr.enable(chainId);

    const keplrOfflineSigner = window.getOfflineSigner(chainId);
    const accounts = await keplrOfflineSigner.getAccounts();
    const address = accounts[0].address;

    const secretjsSend = initSecretJS(SECRET_LCD, true, address, chainId);
    const secretjs = initSecretJS(SECRET_LCD, false, address, chainId);

    return { keplrOfflineSigner, address, accounts, secretjs, secretjsSend, chainId };
  } catch (error) {
    console.log('error: ', error);
    throw new Error(error);
  }
};

const initSecretJS = (
  address: string,
  isSigner: boolean,
  walletAddress: string,
  chainId: string
) => {
  try {
    const client = isSigner
      ? new PatchedSigningCosmWasmClient(
        address,
        walletAddress,
        window.getOfflineSigner(chainId),
        window.getEnigmaUtils(chainId),
        {
          init: {
            amount: [{ amount: '300000', denom: 'uscrt' }],
            gas: '300000',
          },
          exec: {
            amount: [{ amount: '500000', denom: 'uscrt' }],
            gas: '500000',
          },
        },
        BroadcastMode.Sync
      )
      : new CosmWasmClient(address);
    return client;
  } catch (error) {
    console.log('keplr login error', error);
    return undefined;
  }
};

export const getSnip20Balance = async (
  snip20Address: string,
  secretjs: CosmWasmClient,
  walletAddress: string,
  decimals?: string | number
) => {
  try {
    if (!secretjs) {
      return '0';
    }

    const keplr = getKeplrOrFail();
    const viewingKey = await getViewingKey({
      keplr,
      chainId: chainId,
      address: snip20Address,
    });

    if (!viewingKey) {
      return 'Unlock';
    }

    const rawBalance = await Snip20GetBalance({
      secretjs: secretjs,
      token: snip20Address,
      address: walletAddress,
      key: viewingKey,
    });

    if (isNaN(Number(rawBalance))) {
      return fixUnlockToken;
    }

    if (decimals) {
      const decimalsNum = Number(decimals);
      return divDecimals(rawBalance, decimalsNum);
    }

    return rawBalance;
  } catch (error) {
    throw new Error(error);
  }
};

export const getSIENNABalance = async (walletAddress: string, secretjs: CosmWasmClient) => {
  return new Promise(async (resolve, reject) => {
    let balanceSIENNA = {};

    try {
      const balance = await getSnip20Balance(
        process.env.SIENNA_CONTRACT,
        secretjs,
        walletAddress,
        18
      );

      if (balance.includes(unlockToken)) {
        balanceSIENNA = balance;
        resolve(balanceSIENNA);
      } else {
        balanceSIENNA = formatWithSixDecimals(toFixedTrunc(balance, 6));
      }
    } catch (error) {
      balanceSIENNA = unlockToken;
      reject(error);
    } finally {
      resolve(balanceSIENNA);
    }
  });
};

export const unlockTokenBalance = async (tokenAddress: string) => {
  try {
    const keplr = getKeplrOrFail();
    return await keplr.suggestToken(chainId, tokenAddress);
  } catch (error) {
    console.error(error);
  }
};
