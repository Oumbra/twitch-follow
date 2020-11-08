import { Component, OnInit } from '@angular/core';
import { MatButton } from '@angular/material';
import { interval } from 'rxjs';
import { delay, switchMap, tap } from 'rxjs/operators';
import { stringSort } from 'src/app/app.utils';
import { AbstractComponent } from 'src/app/components/abstract.component';
import { Streamer } from 'src/app/models/storage';
import { StorageService } from 'src/app/services/storage.service';

@Component({
    templateUrl: './main-view.component.html',
    styleUrls: ['./main-view.component.scss'],
    
})
export class MainViewComponent extends AbstractComponent<MatButton> implements OnInit {

    synchronizing: boolean = true;
    list: Streamer[] = [];
    deleting: { [key: number]: any } = {};
    
    constructor(private storageSrv: StorageService) {
        super();
    }

    ngOnInit() {
        this.synchronizing = true;

        this.storageSrv.streamer$.subscribe(streamers => {
            this.list = streamers.sort(stringSort('name'));
            this.synchronizing = false;
            this.refresh();
        });

        interval(5000)
            .pipe(switchMap(() => this.storageSrv.streamer$))
            .subscribe(streamers => {
                this.list.forEach(item => {
                    const streamer = streamers.find(s => s.id === item.id);
                    item.title = streamer.title;
                    item.is_live = streamer.is_live;
                    item.viewer_count = streamer.viewer_count;
                    item.started_at = streamer.started_at;
                });
                this.refresh();
            });
    }

    delete(id: number): void {
        this.deleting[id] = false;
        this.refresh();

        this.storageSrv.deleteStreamer(id)
            .pipe(delay(250))
            .subscribe(() => {
                delete this.deleting[id];
                this.list.splice(this.list.findIndex(item => item.id === `${id}`), 1);
                this.refresh();
            });
    }

    isNotDeleting(id: number): boolean {
        return !this.deleting.hasOwnProperty(id)
    }

    protected element(): HTMLElement {
        return this.el._elementRef.nativeElement;
    }

}