import { OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { map, tap } from "rxjs/operators";
import { isNotSame } from "../app.utils";
import { AbstractPageComponent } from "./abstract-page.component";

export abstract class AbstractFormComponent extends AbstractPageComponent implements OnInit {

    private originalValue: any;
    
    protected formStatus$: Subject<boolean>;
    
    formChanged: boolean;

    constructor(protected router: Router,
                public form: FormGroup) {
        super(router);
        this.originalValue = this.form.value;
        this.formChanged = false;
        this.formStatus$ = new Subject();
    }

    ngOnInit() {
        this.form.valueChanges.pipe(
            map(value => isNotSame(this.originalValue, value)),
            tap(bool => this.formChanged = bool),
        )
        .subscribe(bool => this.formStatus$.next(bool));
    }

    submit(): void {
        if (this.form.valid) {
            this.onSubmit();
            this.originalValue = this.form.value;
        } else {
            console.log('form invalid !!');
        }
    }

    protected abstract onSubmit(): void;
}