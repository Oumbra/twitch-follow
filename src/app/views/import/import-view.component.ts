import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { debounceTime, filter, map, tap } from "rxjs/operators";
import { AbstractFormComponent } from "src/app/components/abstract-form.component";
import { ERoute, getPath } from "src/app/enums/route.enums";
import { Storage, StorageSchema } from "src/app/models/storage";
import { StorageService } from "src/app/services/storage.service";
import { ToastService } from "src/app/services/toast.service";

@Component({
    templateUrl : './import-view.component.html',
    styleUrls   : ['./import-view.component.scss'],
})
export class ImportViewComponent extends AbstractFormComponent implements OnInit {

    private readonly APPLICATION_JSON: string = 'application/json';
    private importedStorage: Storage;

    constructor(protected router: Router,
                protected formBuilder: FormBuilder,
                protected storageSrv: StorageService,
                private toastSrv: ToastService) {
        super(
            router,
            formBuilder.group({
                data: new FormControl(undefined, Validators.required),
            })
        );
    }

    ngOnInit(): void {
        this.form.valueChanges
            .pipe(
                filter(() => this.form.valid),
                debounceTime(500),
                map(values => values.data),
                map(data => this.isValidJSON(data)),
                filter(json => this.isValidSchemas(json)),
            )
            .subscribe(
                json => this.importedStorage = json,
                error => this.toastSrv.error(error),
            );
    }

    protected onSubmit(): void {
        this.storageSrv.combineStorage(this.importedStorage)
            .pipe(
                tap(count => {
                    if (count === 0) {
                        this.toastSrv.warn('No new streamer detected');
                    }
                }),
                filter(count => count > 0)
            )
            .subscribe(
                count => {
                    this.router.navigate([getPath(ERoute.MAIN)]);
                    this.toastSrv.success(`${count} streamer(s) added`);
                },
                error => this.toastSrv.error(error),
            );
    }

    private isValidJSON(data: any): any {
        try {
            return JSON.parse(data);
        } catch (e) {
            throw ('JSON not valid');
        }
    }

    private isValidSchemas(json: any): boolean {
        if (StorageSchema.isValidSchema(json)) {
            return true;
        }
        throw ('JSON not conform');
    }

}