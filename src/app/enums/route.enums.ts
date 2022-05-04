export enum ERoute {
    ADDITION = 'addition',
    IMPORT = 'import',
    MAIN = 'main',
    SETTINGS = 'settings'
}

export const getPath = (route: ERoute): string => `/${route}`;