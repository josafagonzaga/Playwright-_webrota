export type WebrotaLoginAccount = {
  name: string;
  username?: string;
  password?: string;
  usernameEnv: string;
  passwordEnv: string;
  companyDocument?: string;
  companyDocumentEnv?: string;
  expectedLoggedUserName?: string;
  expectedLoggedUserNameEnv?: string;
  expectedHomeUrl?: RegExp;
};

export const loginAccounts: WebrotaLoginAccount[] = [
  {
    name: 'admin',
    username: process.env.WEBROTA_USERNAME,
    password: process.env.WEBROTA_PASSWORD,
    usernameEnv: 'WEBROTA_USERNAME',
    passwordEnv: 'WEBROTA_PASSWORD',
    expectedHomeUrl: /\/admin\/system/,
  },
  {
    name: 'customer',
    username: process.env.WEBROTA_CUSTOMER_USERNAME,
    password: process.env.WEBROTA_CUSTOMER_PASSWORD,
    usernameEnv: 'WEBROTA_CUSTOMER_USERNAME',
    passwordEnv: 'WEBROTA_CUSTOMER_PASSWORD',
    companyDocument: process.env.WEBROTA_CUSTOMER_DOCUMENT,
    companyDocumentEnv: 'WEBROTA_CUSTOMER_DOCUMENT',
    expectedLoggedUserName: process.env.WEBROTA_CUSTOMER_LOGGED_USER_NAME,
    expectedLoggedUserNameEnv: 'WEBROTA_CUSTOMER_LOGGED_USER_NAME',
    expectedHomeUrl: /\/app\/system/,
  },
  {
    name: 'operator',
    username: process.env.WEBROTA_OPERATOR_USERNAME,
    password: process.env.WEBROTA_OPERATOR_PASSWORD,
    usernameEnv: 'WEBROTA_OPERATOR_USERNAME',
    passwordEnv: 'WEBROTA_OPERATOR_PASSWORD',
    expectedHomeUrl: /\/app\/system/,
  },
];
