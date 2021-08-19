import { keys, merge } from 'lodash';
import { throwError } from 'rxjs';

export function log(message: string, ...args: any): void {
    const now = new Date();
    const format = `${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR')}`;
    console.log(`${format} | ${message}`, ...args);
}

export function toObject(key: string, value: any): { [key: string]: any } {
    const _ = {};
    _[key] = value;
    return _;
}

export function objectify(object: any): { [key: string]: any | any[]; } {
    return keys(object)
        .map(key => toObject(key, object[key]))
        .reduce((acc, obj) => merge(obj, acc), {});
}

export function waitUntil(fn: () => void, predicate: () => boolean, interval: number = 100) {
    const timer$ = setInterval(() => {
        if (predicate()) {
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

export function focus(el: HTMLElement): () => void {
    return () => el.dispatchEvent(new Event('focus'));
}

export function stringSort<T>(attr: string): (a: T, b: T) => number {
    return (a, b) => a[attr] < b[attr] ? -1 : a[attr] > b[attr] ? 1 : 0;
}

export const standardCatchError = (e: any) => {
    log("error", e);
    return throwError(e);
}

export const measureText = (text: string, font: string): number => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font;
    return context.measureText(text).width;
}

export function isSame(src: any, target: any): boolean {
    return keys(src).length === keys(target).length
        && keys(src).reduce((acc, key) => acc && src[key] === target[key], true);
}

export function isNotSame(src: any, target: any): boolean {
    return keys(src).length !== keys(target).length
        || keys(src).reduce((acc, key) => acc || src[key] !== target[key], false);
}