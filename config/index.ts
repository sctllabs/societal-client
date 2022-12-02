export enum Environment {
    development = 'development',
    staging = 'staging',
    production = 'production'
}

export type AppConfig = {
    providerSocket: string
}

export const appConfig: AppConfig = {
    providerSocket: process.env.NEXT_PUBLIC_PROVIDER_SOCKET as string
}
