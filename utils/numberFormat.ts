import { BigNumber } from 'bignumber.js';

const twoDecimalsFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const sixDecimalsFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 6,
});

export function formatWithTwoDecimals(value: number | string) {
  return twoDecimalsFormatter.format(Number(value));
}

export function formatWithSixDecimals(value: number | string) {
  return sixDecimalsFormatter.format(Number(value));
}

export function formatWithTwoDecimalsRub(value: number) {
  return `${formatWithTwoDecimals(value)} ₽`;
}

export function ones(value: number | string) {
  return new BigNumber(value).dividedBy(1e18).toNumber();
}

export const mulDecimals = (amount: string | number, decimals: string | number) => {
  return new BigNumber(amount).shiftedBy(Number(decimals)).toFixed();
};

export const divDecimals = (amount: string | number, decimals: string | number) => {
  return new BigNumber(amount).shiftedBy(Number(-decimals)).toFixed();
};

export const toFixedTrunc = (x, n) => {
  const v = (typeof x === 'string' ? x : x.toString()).split('.');
  if (n <= 0) return v[0];
  let f = v[1] || '';
  if (f.length > n) return `${v[0]}.${f.substr(0, n)}`;
  while (f.length < n) f += '0';
  return `${v[0]}.${f}`;
};
