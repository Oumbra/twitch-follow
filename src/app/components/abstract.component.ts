import { OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { blur, waitUntil } from '../app.utils';

export abstract class AbstractComponent<T> implements OnDestroy {

    private destroy: Subject<void> = new Subject<void>();
    protected destroy$: Observable<void> = this.destroy.asObservable();

    @ViewChild('refresh', { static: true }) el: T;
    
    ngOnDestroy() {
        this.destroy.next();
    }
    
    refreshView(): void {
        waitUntil(blur(this.element()), () => !!this.element(), 250);
    }

    protected abstract element(): HTMLElement;
}