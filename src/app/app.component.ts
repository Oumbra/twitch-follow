import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatButton } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { DARK_MODE, WINDOW_OPENNER } from './app.module';
import { AbstractElementComponent } from './components/abstract-element.component';
import { ERoute, getPath } from './enums/route.enums';
import { StorageSchema } from './models/storage';
import { StorageService } from './services/storage.service';
import { ToastService } from './services/toast.service';
import { DomUtils } from './utils/dom.utils';
import { MainViewComponent } from './views/main/main-view.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent extends AbstractElementComponent<MatButton> implements OnInit {

    private readonly CLASSES: DOMTokenList = document.body.classList;
    private readonly APPLICATION_JSON = 'application/json';
    private readonly ELEMENTS = {
        downloadLink: null as HTMLElement,
        uploadInput: null as HTMLInputElement,
    }

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
        this.ELEMENTS.downloadLink = document.createElement('a');
        this.ELEMENTS.uploadInput = document.createElement('input');
        this.ELEMENTS.uploadInput.type = 'file';
        this.ELEMENTS.uploadInput.accept = this.APPLICATION_JSON;
        this.ELEMENTS.uploadInput.onchange = file => this.readFile(file);

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
        this.ELEMENTS.uploadInput.dispatchEvent(new MouseEvent('click'));
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
                    const el: HTMLElement = this.ELEMENTS.downloadLink;
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

    private readFile(event: any): void {
        const file: File = event.target.files[0];
        if (this.APPLICATION_JSON === file.type) {
            this.readAsText(file)
                .pipe(
                    map(content => JSON.parse(content)),
                    filter(json => this.isValidJSON(json)),
                    switchMap(json => this.storageSrv.combineStorage(json)),
                    tap(count => {
                        if (count === 0) {
                            this.toastSrv.warn('No new streamer detected');
                            this.refreshView();
                        }
                    }),
                    filter(count => count > 0)
                )
                .subscribe(
                    count => {
                        // si on est sur la page d'accueil
                        if (this.viewComponent instanceof MainViewComponent) {
                            (this.viewComponent as MainViewComponent).load();
                        }
                        // sinon on lance la navigation vers la page d'accueil
                        else {
                            this.zone.run(() => this.router.navigate([getPath(ERoute.MAIN)]));
                        }
                        // tricks refresh
                        this.refreshView();
                        this.toastSrv.success(`${count} streamer(s) added`);
                    },
                    error => this.toastSrv.error(error),
                );
        } else {
            this.toastSrv.error('File is not a JSON !');
        }
        // reset de l'input file
        this.ELEMENTS.uploadInput.value = null;
    }

    private isValidJSON(json: any): boolean {
        if (StorageSchema.isValidSchema(json)) {
            return true;
        }
        throw ('JSON not conform');
    }

    private readAsText(file: Blob): Observable<string> {
        return new Observable(observer => {
            const fileReader: FileReader = new FileReader();
            fileReader.readAsText(file, "UTF-8");
            fileReader.onload = () => {
                observer.next(fileReader.result as string);
                observer.complete();
            }
            fileReader.onerror = error => observer.error(error);
        })
    }

}