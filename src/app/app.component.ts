import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { slideInAnimation } from './animations/slide.animation';
import { AbstractComponent } from './components/abstract.component';
import { StorageService } from './services/storage.service';

@Component({
    selector    : 'app-root',
    templateUrl : './app.component.html',
    styleUrls   : ['./app.component.scss'],
    animations  : [slideInAnimation],
})
export class AppComponent extends AbstractComponent {

    private readonly setting = {
      element: null as HTMLElement
    }

    constructor(private storageSrv: StorageService) {
        super();
    }

    prepareRoute(outlet: RouterOutlet) {
        return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
    }

    import() {
        console.log('import');
    }

    export() {
        this.storageSrv.storage$
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                datas => {
                    if (!this.setting.element) {
                        this.setting.element = document.createElement('a');
                    }
                    const blob = new Blob([JSON.stringify(datas, null, 2)], {type: 'application/json'});
                    const element: HTMLElement = this.setting.element;
                    element.setAttribute('href', window.URL.createObjectURL(blob));
                    element.setAttribute('download', `twitch-follow_${new Date().toISOString()}.backup.json`);
                    element.dispatchEvent(new MouseEvent('click'));
                },
                err => console.log('error', err)
            )
    }
    
}