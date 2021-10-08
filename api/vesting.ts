import { StdFee } from 'secretjs/types/types';
import { SigningCosmWasmClient } from 'secretjs';

// Claims vested tokens. Useful for investors.
export const claimVestedTokens = (secretjs: SigningCosmWasmClient, address: string, fee?: StdFee) => {
  return secretjs.execute(address, {
    claim: {},
  },
    '',
    [],
    fee
  );
};


export const callVestOnRPT = (secretjs: SigningCosmWasmClient, address: string, fee?: StdFee) => {
  return secretjs.execute(address, {
    vest: {},
  },
    '',
    [],
    fee
  );
};
