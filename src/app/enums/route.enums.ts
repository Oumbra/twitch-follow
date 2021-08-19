export enum ERoute {
    MAIN = 'main',
    SETTINGS = 'settings',
    ADDITION = 'addition'
}

export const getPath = (route: ERoute): string => `/${route}`;