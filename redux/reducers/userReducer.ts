import {
  SET_USER,
  KEPLR_SIGN_OUT,
  SHOW_HIDDEN_TOKEN_BALANCE_REQUESTED,
  SHOW_HIDDEN_TOKEN_BALANCE_SUCCESS,
} from '../actions/user';
import { HYDRATE } from 'next-redux-wrapper';
import { SigningCosmWasmClient, CosmWasmClient } from 'secretjs';

export interface UserProps {
  walletProvider: string;
  selectedWalletAddress: string;
  isKeplrInstalled?: boolean;
  isKeplrAuthorized?: boolean;
  keplrErrorMessage: string;
  secretjs: CosmWasmClient;
  secretjsSend: SigningCosmWasmClient;

  showTokenBalanceError: string;
  didUnlockHiddenBalance: boolean;

  balanceSIENNA: string;
}

const initialState: UserProps = {
  walletProvider: '',
  selectedWalletAddress: '',
  isKeplrInstalled: false,
  isKeplrAuthorized: false,
  keplrErrorMessage: '',

  secretjs: undefined,
  secretjsSend: undefined,

  showTokenBalanceError: '', // When a user wants to view the balance (generating viewing key for X token)
  didUnlockHiddenBalance: false,

  balanceSIENNA: '',
};

const user = (state = initialState, { type, payload }) => {
  switch (type) {
    case HYDRATE:
      return {
        ...state,
        ...payload.user,
      };

    case SET_USER:
      return {
        ...state,
        ...payload,
      };

    case SHOW_HIDDEN_TOKEN_BALANCE_REQUESTED:
      return {
        ...state,
        showTokenBalanceError: '',
        didUnlockHiddenBalance: false,
      };

    case SHOW_HIDDEN_TOKEN_BALANCE_SUCCESS:
      return {
        ...state,
        didUnlockHiddenBalance: true,
      };

    case KEPLR_SIGN_OUT:
      return {
        ...state,
        isKeplrAuthorized: false,
        keplrErrorMessage: '',
        balanceSIENNA: '',
      };

    default:
      return state;
  }
};

export default user;
