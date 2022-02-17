import axios from 'axios';

export interface RewardPool {
  rewards_contract: string;
  version: string;
}

export const getRewardPools = async (): Promise<RewardPool[]> => {
  return (await axios.get(process.env.SIENNA_BACKEND_URL + '/rewards')).data.pools.filter(
    (pool) => pool.version === '3'
  );
};

export const triggerVest = async () => {
  return (await axios.post(process.env.SIENNA_VEST_URL)).data;
};
