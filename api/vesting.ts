import { StdFee } from 'secretjs/types/types';
import { SigningCosmWasmClient, CosmWasmClient } from 'secretjs';
import moment from 'moment';

// Claims vested tokens. Useful for investors.
export const claimVestedTokens = (
  secretjs: SigningCosmWasmClient,
  address: string,
  fee?: StdFee
) => {
  return secretjs.execute(
    address,
    {
      claim: {},
    },
    '',
    [],
    fee
  );
};

export const callVestOnRPT = (secretjs: SigningCosmWasmClient, address: string, fee?: StdFee) => {
  return secretjs.execute(
    address,
    {
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
  };
}

export interface RewardPoolStatus {
  address: string;
  clock: number;
  clock_should_be: number;
  name: string;
}

export const queryRPTStatus = async (
  secretjs: CosmWasmClient,
  RPTAddress: string,
  MGMTAddress: string
): Promise<RPTStatus> => {
  const result = await secretjs.queryContractSmart(MGMTAddress, {
    progress: {
      address: RPTAddress,
      time: Math.floor(Date.now() / 1000),
    },
  });
  const status = result.progress ? result.progress : result;
  status.elapsed = `${Math.round(status.elapsed / 86400)} days`;
  status.launched = moment(status.launched, 'X').format('YYYY-MM-DD');
  return status;
};

export const queryRewardPoolClock = (
  pools,
  secretjs: CosmWasmClient
): Promise<RewardPoolStatus[]> => {
  return Promise.all(
    pools.map(async (pool) => {
      return {
        address: pool.address,
        clock: (
          await secretjs.queryContractSmart(pool.address, {
            rewards: { pool_info: { at: Math.floor(Date.now() / 1000) } },
          })
        ).rewards.pool_info.clock.number,
        clock_should_be: +moment().diff(moment(pool.created), 'days') - 1,
        name: pool.name,
      };
    })
  );
};
