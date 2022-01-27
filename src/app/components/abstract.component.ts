import { OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export abstract class AbstractComponent implements OnDestroy {
    
    private destroy: Subject<void> = new Subject<void>();
    protected destroy$: Observable<void> = this.destroy.asObservable();

    ngOnDestroy() {
        this.destroy.next();
    }
    
}