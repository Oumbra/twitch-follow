import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { debounceTime, filter, switchMap } from "rxjs/operators";
import { AbstractFormComponent } from "src/app/components/abstract-form.component";
import { SettingsSchema } from "src/app/models/storage";
import { StorageService } from "src/app/services/storage.service";
import { ToastService } from "src/app/services/toast.service";

@Component({
    templateUrl : './settings-view.component.html',
    styleUrls   : ['./settings-view.component.scss'],
})
export class SettingsViewComponent extends AbstractFormComponent implements OnInit {
    
    constructor(protected router: Router,
                protected formBuilder: FormBuilder,
                protected storageSrv: StorageService,
                private toastSrv: ToastService) {
        super(
            router,
            formBuilder.group({
                refreshTime: new FormControl(SettingsSchema.SKELETON.refreshTime, [Validators.required, Validators.min(10000)]),
                infiniteNotif: new FormControl(true),
            })
        );
    }

    ngOnInit(): void {
        super.ngOnInit();

        this.storageSrv.settings$.subscribe(settings => {
            this.form.patchValue(settings);
            this.page.setLoading(false);
        });

        this.form.valueChanges
            .pipe(
                filter(() => this.form.valid),
                debounceTime(500),
                switchMap(values => this.storageSrv.updateSettings(values))
            )
            .subscribe(
                () => console.log('Mise à jour réussi!'),
                error => this.toastSrv.error(`Une erreur a empéché la mises à jour : ${error}`)
            );
    }
    
    onSubmit(): void {}

}