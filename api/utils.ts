import { StdFee } from 'secretjs/types/types';
import { ExecuteResult } from 'secretjs';

export const sleep = (duration: number) => new Promise((res) => setTimeout(res, duration));

export function getFeeForExecute(gas: number): StdFee {
    return {
        amount: [{ amount: String(gas), denom: 'uscrt' }],
        gas: String(gas),
    };
}


export function extractValueFromLogs(txResult: ExecuteResult, key: string): string {
    return txResult?.logs[0]?.events
        ?.find((e) => e.type === 'wasm')
        ?.attributes?.find((a) => a.key === key)?.value;
}
