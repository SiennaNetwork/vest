import { StdFee } from 'secretjs/types/types';
import { SigningCosmWasmClient, CosmWasmClient } from 'secretjs';

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


export interface RPTStatus {
  progress: {
    claimed: string;
    elapsed: number;
    launched: number;
    time: number;
    unlocked: string;
  }
}

export const queryRPTStatus = (secretjs: CosmWasmClient, unixTime: number): Promise<RPTStatus> => {
  return secretjs.queryContractSmart(process.env.MGMT_CONTRACT, {
    progress: {
      address: process.env.RPT_CONTRACT,
      time: unixTime
    },
  }
  );
};