import { OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export abstract class AbstractComponent implements OnDestroy {

    private _$: Subject<void> = new Subject<void>();

    ngOnDestroy() {
        this._$.next();
    }

    get ngDestroy$(): Observable<void> {
        return this._$;
    }
}