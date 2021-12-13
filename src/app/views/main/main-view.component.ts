import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subject } from 'rxjs';
import { delay, switchMap, takeUntil } from 'rxjs/operators';
import { TWITCH_URL } from 'src/app/app.constantes';
import { WINDOW_OPENNER } from 'src/app/app.module';
import { AbstractPageComponent } from 'src/app/components/abstract-page.component';
import { Streamer } from 'src/app/models/storage';
import { StorageService } from 'src/app/services/storage.service';

@Component({
    templateUrl: './main-view.component.html',
    styleUrls: ['./main-view.component.scss'],
})
export class MainViewComponent extends AbstractPageComponent implements OnInit {

    list: Streamer[];
    synchronizing: boolean;
    isEmpty: boolean;
    navigateDelay: number;
    hasLive: boolean = false;
    hasOffline: boolean = false;

    private deleting: { [key: number]: any } = {};
    private isOpen: boolean = false;

    constructor(protected router: Router,
                @Inject(WINDOW_OPENNER) private windowOpenner: Subject<boolean>,
                private storageSrv: StorageService) {
        super(router);
    }

    get lives(): Streamer[] {
        return this.list.filter(streamer => streamer.is_live);
    }

    get offlines(): Streamer[] {
        return this.list.filter(streamer => !streamer.is_live);
    }

    ngOnInit() {
        super.ngOnInit();

        this.load();

        this.navigate.subscribe(() => {
            this.setOpen(false);
            this.page.setLoading(true);
        });

        interval(5000)
            .pipe(
                takeUntil(this.destroy$),
                switchMap(() => this.storageSrv.streamer$),
            )
            .subscribe(streamers => {
                this.list = this.list.map(this.updateItem(streamers));
                this.hasLive = this.lives.length > 0;
                this.hasOffline = this.offlines.length > 0;
                this.page.refreshView();
            });
    }

    getNavigateDelay(): number {
        return this.isOpen ? 500 : 0;
    }

    load(): void {
        this.list = [];
        this.synchronizing = true;
        this.isEmpty = true;
        this.setOpen(false);

        this.storageSrv.streamer$
            .pipe(takeUntil(this.destroy$))
            .subscribe(streamers => {
                this.list = streamers;
                this.hasLive = this.lives.length > 0;
                this.hasOffline = this.offlines.length > 0;
                this.isEmpty = this.list.length === 0;
                this.synchronizing = false;
                this.setOpen(this.list.length > 3);
                this.page.setLoading(false);
            });
    }

    open(name: string): void {
        window.open(`${TWITCH_URL}${name}`, '_blank');
    }

    delete(id: number): void {
        this.deleting[id] = false;
        this.page.refreshView();

        this.storageSrv.deleteStreamer(id)
            .pipe(
                takeUntil(this.destroy$),
                delay(250)
            )
            .subscribe(() => {
                delete this.deleting[id];
                this.list.splice(this.list.findIndex(item => item.id === `${id}`), 1);
                this.page.refreshView();
            });
    }

    isDeleting(id: number): boolean {
        return this.deleting.hasOwnProperty(id)
    }

    private updateItem(streamers: Streamer[]): (s: Streamer) => Streamer {
        return item => {
            const streamer = streamers.find(s => s.id === item.id);
            item.title = streamer.title;
            item.is_live = streamer.is_live;
            item.viewer_count = streamer.is_live ? streamer.viewer_count : 0;
            item.started_at = streamer.started_at;
            item.game_id = streamer.game_id;
            return item;
        }
    }

    private setOpen(is: boolean): void {
        this.isOpen = is;
        this.windowOpenner.next(is);
    }
}