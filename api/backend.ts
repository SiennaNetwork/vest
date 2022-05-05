import axios from 'axios';

export interface RewardPool {
  rewards_contract: string;
  version: string;
  rpt_address: string;
  mgmt_address: string;
  created: string;
  rewards_token: {
    symbol: string;
  };
  inc_token: {
    name: string;
  };
}

export const getRewardPools = async (): Promise<RewardPool[]> => {
  return (await axios.get(process.env.SIENNA_BACKEND_URL + '/rewards')).data.pools
    .filter((pool) => pool.version === '3')
    .sort((a, b) => a.inc_token.name - b.inc_token.name);
};

export const triggerVest = async () => {
  return (await axios.post(process.env.SIENNA_VEST_URL)).data;
};

export const callVestOnRPT = async (rpt_address, partner) => {
  const URL = partner ? process.env.VEST_RPT_URL_PARTNER : process.env.VEST_RPT_URL;
  return (await axios.post(URL)).data.find((res) => res.rpt_address === rpt_address);
};
