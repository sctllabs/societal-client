export enum Environment {
  development = 'development',
  staging = 'staging',
  production = 'production'
}

export type AppConfig = {
  appName: string;
  providerSocket: string;
  customRPCMethods?: object;
};

export const appConfig: AppConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME as string,
  providerSocket: process.env.NEXT_PUBLIC_PROVIDER_SOCKET as string
};
