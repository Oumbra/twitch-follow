import { throwError } from 'rxjs';

export function log(message: string, ...args: any): void {
    const now = new Date();
    const format = `${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR')}`;
    console.log(`${format} | ${message}`, ...args);
}

export function obj(key: string, value: string): { [key: string]: any } {
    const _ = {};
    _[key] = value;
    return _;
}

export const standardCatchError = (e) => {
    log("error", e);
    return throwError(e);
}

export const measureText = (text: string, font: string): number => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font;
    return context.measureText(text).width;
}