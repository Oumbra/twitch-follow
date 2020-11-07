import { throwError } from 'rxjs';

export function log(message: string, ...args: any): void {
    const now = new Date();
    const format = `${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR')}`;
    console.log(`${format} | ${message}`, ...args);
}

export function obj(key: string, value: any): { [key: string]: any } {
    const _ = {};
    _[key] = value;
    return _;
}

export function waitUntil(fn: () => void, predicate: () => boolean, interval: number = 100) {
    const timer$ = setInterval(() => {
        if(predicate()) {
            clearInterval(timer$);
            fn();
        } else {
            log('waitUntil');
        }
    }, interval);
}

export function blur(el: HTMLElement): () => void {
    return () => el.dispatchEvent(new Event('blur'));
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
