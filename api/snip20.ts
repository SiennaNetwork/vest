import { CosmWasmClient } from 'secretjs';
import { unlockToken } from '../constants';
export const Snip20GetBalance = async (params: {
  secretjs: CosmWasmClient;
  token: string;
  address: string;
  key: string;
}) => {
  const { secretjs, address, token, key } = params;

  let balanceResponse;
  try {
    balanceResponse = await secretjs.queryContractSmart(token, {
      balance: {
        address,
        key,
      },
    });
  } catch (e) {
    // console.log(e);
    return unlockToken;
  }

  if (balanceResponse.viewing_key_error) {
    return 'Fix Unlock';
  }

  if (Number(balanceResponse.balance.amount) === 0) {
    return '0';
  }
  return balanceResponse.balance.amount;
};
