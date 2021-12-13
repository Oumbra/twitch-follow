import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { MatButton } from '@angular/material';
import { Router, RouterOutlet } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { WINDOW_OPENNER } from './app.module';
import { AbstractElementComponent } from './components/abstract-element.component';
import { ERoute, getPath } from './enums/route.enums';
import { StorageSchema } from './models/storage';
import { StorageService } from './services/storage.service';
import { ToastService } from './services/toast.service';
import { MainViewComponent } from './views/main/main-view.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent extends AbstractElementComponent<MatButton> implements OnInit {

    private readonly APPLICATION_JSON = 'application/json';
    private readonly elements = {
        downloadLink: null as HTMLElement,
        uploadInput: null as HTMLInputElement,
    }

    private viewComponent: AbstractElementComponent<any>;

    constructor(@Inject(WINDOW_OPENNER) private windowOpenner: Subject<boolean>,
                private router: Router,
                private zone: NgZone,
                private toastSrv: ToastService,
                private storageSrv: StorageService) {
        super();
    }

    ngOnInit() {
        this.elements.downloadLink = document.createElement('a');
        this.elements.uploadInput = document.createElement('input');
        this.elements.uploadInput.type = 'file';
        this.elements.uploadInput.accept = this.APPLICATION_JSON;
        this.elements.uploadInput.onchange = file => this.readFile(file);

        this.windowOpenner.subscribe(bool => {
            const classes: DOMTokenList = document.body.classList;
            if (bool) {
                classes.add('opened');
            } else if (classes.contains('opened')) {
                classes.remove('opened');
            }
        });
    }

    prepareRoute(outlet: RouterOutlet) {
        return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
    }

    activateRoute(e: any) {
        this.viewComponent = e;
    }

    settings(): void {
        this.router.navigate([getPath(ERoute.SETTINGS)]);
    }

    import(): void {
        this.elements.uploadInput.dispatchEvent(new MouseEvent('click'));
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
                    const el: HTMLElement = this.elements.downloadLink;
                    el.setAttribute('href', url);
                    el.setAttribute('download', `twitch-follow_${new Date().toISOString()}.backup.json`);
                    el.dispatchEvent(new MouseEvent('click'));
                },
                err => this.toastSrv.error(err)
            );
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
        this.elements.uploadInput.value = null;
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