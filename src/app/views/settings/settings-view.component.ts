import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { debounceTime, filter, switchMap, tap } from "rxjs/operators";
import { DARK_MODE } from "src/app/app.module";
import { AbstractFormComponent } from "src/app/components/abstract-form.component";
import { StorageService } from "src/app/services/storage.service";
import { ToastService } from "src/app/services/toast.service";

@Component({
    templateUrl : './settings-view.component.html',
    styleUrls   : ['./settings-view.component.scss'],
})
export class SettingsViewComponent extends AbstractFormComponent implements OnInit {
    
    constructor(@Inject(DARK_MODE) private darkMode: Subject<boolean>,
                protected router: Router,
                protected formBuilder: FormBuilder,
                protected storageSrv: StorageService,
                private toastSrv: ToastService) {
        super(
            router,
            formBuilder.group({
                refreshTime: new FormControl(5000, [Validators.required, Validators.min(5000)]),
                infiniteNotif: new FormControl(true),
                darkMode: new FormControl(false),
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
                tap(settings => this.darkMode.next(settings.darkMode)),
                switchMap(values => this.storageSrv.updateSettings(values))
            )
            .subscribe(
                () => console.log('Mise à jour réussi!'),
                error => this.toastSrv.error(`Une erreur a empéché la mises à jour : ${error}`)
            );
    }
    
    onSubmit(): void {}

}