import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { interval } from 'rxjs';
import { delay, switchMap, takeUntil } from 'rxjs/operators';
import { TWITCH_URL } from 'src/app/app.constantes';
import { AbstractPageComponent } from 'src/app/components/abstract-page.component';
import { Streamer } from 'src/app/models/storage';
import { StorageService } from 'src/app/services/storage.service';
import { TwitchService } from 'src/app/services/twitch.service';

@Component({
    templateUrl: './main-view.component.html',
    styleUrls: ['./main-view.component.scss'],
})
export class MainViewComponent extends AbstractPageComponent implements OnInit {

    list: Streamer[];
    synchronizing: boolean;
    isEmpty: boolean;
    isOpen: boolean;
    navigateDelay: number;

    private deleting: { [key: number]: any } = {};

    constructor(protected router: Router,
                private twitchSrv: TwitchService,
                private storageSrv: StorageService) {
        super(router);
    }

    ngOnInit() {
        super.ngOnInit();

        this.load();

        this.navigate.subscribe(() => {
            this.isOpen = false;
            this.page.setLoading(true);
        });

        interval(5000)
            .pipe(
                takeUntil(this.destroy$),
                switchMap(() => this.storageSrv.streamer$),
            )
            .subscribe(streamers => {
                this.list = this.list
                    .map(this.updateItem(streamers))
                    .sort(this.sortStreamer());
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
        this.isOpen = false;

        this.storageSrv.streamer$
            .pipe(takeUntil(this.destroy$))
            .subscribe(streamers => {
                this.list = streamers.sort(this.sortStreamer());
                this.isEmpty = this.list.length === 0;
                this.isOpen = this.list.length > 3;
                this.synchronizing = false;
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

    private sortStreamer(): (a: Streamer, b: Streamer) => number {
        return (a, b) => {
            const status = a.is_live === b.is_live ? 0 : a.is_live ? -1 : 1;
            const name = a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
            // A en live alors que B non
            return status < 0 ? status :
                // status egal ET nom precedent
                status === 0 && name < 0 ? -1 : 1;
        }
    }

    private updateItem(streamers: Streamer[]): (Streamer) => Streamer {
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
}