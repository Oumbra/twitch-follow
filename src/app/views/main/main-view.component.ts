import { Component, OnInit } from '@angular/core';
import { MatButton } from '@angular/material';
import { Router } from '@angular/router';
import { interval } from 'rxjs';
import { delay, switchMap, takeUntil } from 'rxjs/operators';
import { AbstractElementComponent } from 'src/app/components/abstract-element.component';
import { Streamer } from 'src/app/models/storage';
import { StorageService } from 'src/app/services/storage.service';

@Component({
    templateUrl: './main-view.component.html',
    styleUrls: ['./main-view.component.scss'],
    
})
export class MainViewComponent extends AbstractElementComponent<MatButton> implements OnInit {

    list: Streamer[] = [];
    synchronizing: boolean = true;
    isEmpty: boolean = true;
    isOpen: boolean = false;

    private deleting: { [key: number]: any } = {};

    constructor(private router: Router,
                private storageSrv: StorageService) {
        super();
    }

    ngOnInit() {
        this.storageSrv.streamer$
            .pipe(takeUntil(this.destroy$))
            .subscribe(streamers => {
                this.list = streamers.sort(this.sortStreamer());
                this.isEmpty = this.list.length === 0;
                this.isOpen = this.list.length > 3;
                this.synchronizing = false;
                this.refreshView();
            });

        interval(5000)
            .pipe(
                takeUntil(this.destroy$),
                switchMap(() => this.storageSrv.streamer$)
            )
            .subscribe(streamers => {
                this.list.sort(this.sortStreamer())
                    .map(this.updateItem(streamers));
                this.refreshView();
            });
    }

    open(name: string): void {
        window.open(`https://www.twitch.tv/${name}`, '_blank');
    }

    delete(id: number): void {
        this.deleting[id] = false;
        this.refreshView();

        this.storageSrv.deleteStreamer(id)
            .pipe(
                takeUntil(this.destroy$),
                delay(250)
            )
            .subscribe(() => {
                delete this.deleting[id];
                this.list.splice(this.list.findIndex(item => item.id === `${id}`), 1);
                this.refreshView();
            });
    }

    toAdd(): void {
        setTimeout(() => this.router.navigate(['/addition']), this.isOpen ? 500: 0);
        this.isOpen = false;
    }

    isDeleting(id: number): boolean {
        return this.deleting.hasOwnProperty(id)
    }

    protected element(): HTMLElement {
        return this.el._elementRef.nativeElement;
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