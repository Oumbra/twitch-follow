import { log } from '../app.utils';

export class LinkedList<T> {
    
    private head: LinkedListItem<T>;

    get previous(): T {
        this.head = this.head.previous;
        return this.head.value;
    }
    
    get next(): T {
        this.head = this.head.next;
        return this.head.value;
    }

    get hasPrevious(): boolean {
        return this.head.previous !== undefined;
    }

    get hasNext(): boolean {
        return this.head.next !== undefined;
    }

    push(value: T): void {
        this.head = new LinkedListItem<T>(value, this.head);
    }

    reduce<O>(fn : (iitem: T, accumulator: O) => O, defaultValue: O = undefined): O {
        let value: O = defaultValue;
        let current: LinkedListItem<T> = this.head;
        
        // current + all previous
        do {
            value = fn(current.value, value);
        } while((current = current.previous) !== undefined);
        
        // all next
        current = this.head;
        while((current = current.next) !== undefined) {
            value = fn(current.value, value);
        }

        return value;
    }
}

class LinkedListItem<T> {

    public next: LinkedListItem<T>;

    constructor(public value: T, public previous: LinkedListItem<T>) {
        if (!!this.previous) {
            this.previous.next = this;
        }
    }

}