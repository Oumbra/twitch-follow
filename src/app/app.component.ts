import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatButton } from '@angular/material';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { DARK_MODE, WINDOW_OPENNER } from './app.module';
import { AbstractElementComponent } from './components/abstract-element.component';
import { ERoute, getPath } from './enums/route.enums';
import { StorageService } from './services/storage.service';
import { ToastService } from './services/toast.service';
import { DomUtils } from './utils/dom.utils';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent extends AbstractElementComponent<MatButton> implements OnInit {

    private readonly CLASSES: DOMTokenList = document.body.classList;
    private readonly APPLICATION_JSON: string = 'application/json';
    private readonly DOWNLOAD_LINK: HTMLElement = document.createElement('a') as HTMLElement;

    private viewComponent: AbstractElementComponent<any>;

    form: FormGroup;

    constructor(@Inject(WINDOW_OPENNER) private windowOpenner: Subject<boolean>,
                @Inject(DARK_MODE) private darkMode: Subject<boolean>,
                private router: Router,
                private zone: NgZone,
                private toastSrv: ToastService,
                private storageSrv: StorageService,
                protected formBuilder: FormBuilder) {
        super();
        this.form = formBuilder.group({
            darkMode: new FormControl(false),
        });
    }

    ngOnInit() {
        this.form.get('darkMode').valueChanges
            .pipe(
                filter(() => this.form.valid),
                tap(darkMode => this.darkMode.next(darkMode)),
                switchMap(bool => this.storageSrv.updateSettings({ darkMode: bool }))
            )
            .subscribe(
                () => console.log('Mise à jour réussi!'),
                error => this.toastSrv.error(`Une erreur a empéché la mises à jour : ${error}`)
            );

        this.darkMode.subscribe(bool => {
            this.form.patchValue({ darkMode: bool }, { emitEvent: false });
            if (bool) {
                this.CLASSES.add('dark');
            } else if (this.CLASSES.contains('dark')) {
                this.CLASSES.remove('dark');
            }
        })

        this.windowOpenner.subscribe(bool => {
            if (bool) {
                this.CLASSES.add('opened');
            } else if (this.CLASSES.contains('opened')) {
                this.CLASSES.remove('opened');
            }
        });

        this.storageSrv.settings$.subscribe(settings => this.darkMode.next(settings.darkMode));
    }

    activateRoute(e: any) {
        this.viewComponent = e;
    }

    settings(): void {
        this.router.navigate([getPath(ERoute.SETTINGS)]);
    }
    
    import(): void {
        this.router.navigate([getPath(ERoute.IMPORT)]);
    }

    export(): void {
        this.storageSrv.storage$
            .pipe(
                takeUntil(this.destroy$),
                map(datas => new Blob([JSON.stringify(datas, null, 2)], { type: this.APPLICATION_JSON })),
                map(blob => window.URL.createObjectURL(blob))
            )
            .subscribe(
                url => {
                    const el: HTMLElement = this.DOWNLOAD_LINK;
                    el.setAttribute('href', url);
                    el.setAttribute('download', `twitch-follow_${new Date().toISOString()}.backup.json`);
                    el.dispatchEvent(new MouseEvent('click'));
                },
                err => this.toastSrv.error(err)
            );
    }

    onClickSlider($event: MouseEvent) {
        $event.stopPropagation();
        const target: any = $event.target;
        if (DomUtils.notIsOrContains('#dark-mode-toggle', target)) {
            const el: HTMLElement = document.querySelector('#dark-mode-toggle .mat-slide-toggle-input');
            el.dispatchEvent(new MouseEvent('click'));
        }
    }

    protected element(): HTMLElement {
        return this.el._elementRef.nativeElement;
    }

}