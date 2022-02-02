
import { toObject } from '../app.utils';

export interface ILocalStorage {
    /**
     * Sets multiple items.
     * @param items An object which gives each key/value pair to update storage with. Any other key/value pairs in storage will not be affected.
     * Primitive values such as numbers will serialize as expected. Values with a typeof "object" and "function" will typically serialize to {}, with the exception of Array (serializes as expected), Date, and Regex (serialize using their String representation).
     * @param callback Optional.
     * Callback on success, or on failure (in which case runtime.lastError will be set).
     */
    set(items: Object, callback?: () => void): void;
    /**
     * Gets one or more items from storage.
     * @param keys A single key to get, list of keys to get, or a dictionary specifying default values.
     * An empty list or object will return an empty result object. Pass in null to get the entire contents of storage.
     * @param callback Callback with storage items, or on failure (in which case runtime.lastError will be set).
     * Parameter items: Object with items in their key-value mappings.
     */
    get(key: string, callback: (items: { [key: string]: any }) => void): void;

}

export class LocalStorage implements ILocalStorage {

    set(items: Object, callback?: () => void): void {
        Object.keys(items).forEach(key => {
            const value: string = items[key];
            localStorage.setItem(key, JSON.stringify(value));
        });
        if (!!callback) {
            callback();
        }
    }
    
    get(key: string, callback: (items: { [key: string]: any; }) => void): void {
        const value: string = localStorage.getItem(key);
        const object: any = toObject(key, JSON.parse(value));
        callback(object);
    }
    
}

export interface IStorage {
    local: ILocalStorage;
}

export class BouchonStorage implements IStorage {
    local: ILocalStorage;

    constructor() {
        this.local = new LocalStorage();
    }
    
}

export interface IExtensionApi {
    notifications: any;
    storage: IStorage;
}

export class BouchonApi implements IExtensionApi {
    notifications: any;
    storage: IStorage;

    constructor() {
        this.storage = new BouchonStorage();
    }

}