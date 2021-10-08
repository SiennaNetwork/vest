declare namespace NodeJS {
  interface ProcessEnv {
    ENV: string;
    CHAIN_ID: string;
    CHAIN_NAME: string;
    SECRET_RPC: string;
    SECRET_LCD: string;
    SIENNA_CONTRACT: string;
    MGMT_CONTRACT: string;
  }
}
