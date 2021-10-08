import { put, call, takeLatest, takeEvery, select } from 'redux-saga/effects';

import {
  SET_USER,
  SET_USER_REQUESTED,
  CHECK_KEPLR_REQUESTED,
  SHOW_HIDDEN_TOKEN_BALANCE_REQUESTED,
  SHOW_HIDDEN_TOKEN_BALANCE_SUCCESS,
  REFRESH_BALANCE_FOR_TOKEN_REQUESTED,
} from '../actions/user';
import {
  keplrCheckPromise,
  signInKeplr,
  unlockTokenBalance,
  getSIENNABalance,
} from '../../api/keplr';
import { CosmWasmClient } from 'secretjs';
import { IStore } from '../store';

function* updateUser({ payload }: { type: any; payload: any }) {
  yield put({ type: SET_USER, payload });
}

function* checkKeplr() {
  try {
    const { isKeplrWallet } = yield call(keplrCheckPromise);

    yield put({
      type: SET_USER,
      payload: {
        isKeplrInstalled: isKeplrWallet,
      },
    });

    const { address, secretjs, secretjsSend, chainId } = yield call(signInKeplr);

    yield put({
      type: SET_USER,
      payload: {
        isKeplrAuthorized: true,
        selectedWalletAddress: address,
        walletProvider: 'Keplr',
        keplrErrorMessage: '',
        chainId,
        secretjs,
        secretjsSend,
      },
    });

    yield call(getBalanceSIENNA, secretjs, address);
  } catch (error) {
    console.log('saga keplr error: ', error);

    yield put({
      type: SET_USER,
      payload: {
        isKeplrAuthorized: false,
        selectedWalletAddress: '',
        walletProvider: '',
        keplrErrorMessage: error.message || error,
      },
    });
  }
}

function* getBalanceSIENNA(secretjs: CosmWasmClient, walletAddress: string) {
  try {
    const balanceSIENNA = yield call(getSIENNABalance, walletAddress, secretjs);

    yield put({
      type: SET_USER,
      payload: {
        balanceSIENNA,
      },
    });
  } catch (error) {
    console.log('balanceSIENNA error: ', error);
  }
}

function* showHiddenTokenBalance({
  payload,
}: {
  type: typeof SHOW_HIDDEN_TOKEN_BALANCE_REQUESTED;
  payload: { symbol: string; tokenAddress: string };
}) {
  const state: IStore = yield select();
  const user = state.user;

  try {
    yield call(unlockTokenBalance, payload.tokenAddress);
    yield put({ type: SHOW_HIDDEN_TOKEN_BALANCE_SUCCESS });
    yield call(getBalanceSIENNA, user.secretjs, user.selectedWalletAddress);
  } catch (error) {
    console.log(' showHiddenTokenBalance error: ', error.message);

    yield put({
      type: SET_USER,
      payload: {
        showTokenBalanceError: error.message,
      },
    });
  }
}

export default function* userSaga() {
  yield takeLatest(SET_USER_REQUESTED, updateUser);
  yield takeLatest(CHECK_KEPLR_REQUESTED, checkKeplr);
  yield takeEvery(SHOW_HIDDEN_TOKEN_BALANCE_REQUESTED, showHiddenTokenBalance);
  yield takeEvery(REFRESH_BALANCE_FOR_TOKEN_REQUESTED, getSIENNABalance as any);
}
