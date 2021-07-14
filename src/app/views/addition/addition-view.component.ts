import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { blur, log } from 'src/app/app.utils';
import { AbstractElementComponent } from 'src/app/components/abstract-element.component';
import { Channel } from 'src/app/models/response/channel';
import { TwitchResponse, TwitchResponseSkeleton } from 'src/app/models/response/twitch-response';
import { StorageService } from 'src/app/services/storage.service';
import { TwitchService } from 'src/app/services/twitch.service';

@Component({
    templateUrl : './addition-view.component.html',
    styleUrls   : ['./addition-view.component.scss'],
})
export class AdditionViewComponent extends AbstractElementComponent<ElementRef> implements OnInit {

    cursor: string;
    query: string;
    searching: boolean;
    isEmpty: boolean = true;
    results: Channel[] = [];
    selected: { [key: number]: boolean } = {};
    query$: Subject<string> = new Subject();
    scroll$: Subject<any> = new Subject();

    constructor(private router: Router,
                private storageSrv: StorageService,
                private twitchSrv: TwitchService) {
        super();
    }

    ngOnInit() {
        // repertorie les streamers déjà suivi
        this.storageSrv.storage$.pipe(
                takeUntil(this.destroy$),
                map(storage => storage.streamers),
                map(streamers => streamers.map(s => parseInt(s.id))),
            )
            .subscribe(ids => ids.forEach(id => this.selected[id] = true));

        this.query$.pipe(
                takeUntil(this.destroy$),
                debounceTime(500),
                distinctUntilChanged(),
                tap(() => this.results = []),
                tap(() => this.isEmpty = true),
                filter(query => !!query && query.length > 0),
                tap(blur(this.element())),
                tap(() => this.searching = true),
                switchMap(query => this.twitchSrv.searchChannel({ query })),
            )
            .subscribe(this.formatResponse(), this.formatResponse());

        this.scroll$.pipe(
                takeUntil(this.destroy$),
                filter(() => !!this.cursor),
                filter(e => e.target.offsetHeight + e.target.scrollTop === e.target.scrollHeight),
                distinctUntilChanged(),
                tap(() => this.searching = true),
                switchMap(() => this.twitchSrv.searchChannel({ after: this.cursor, query: this.query })),
            )
            .subscribe(this.formatResponse(), this.formatResponse());
    }

    back(): void {
        setTimeout(() => this.router.navigate(['/main']), this.isEmpty ? 0 : 500);
        this.isEmpty = true;
        this.query = undefined;
    }

    add(channel: Channel): void {
        this.selected[channel.id] = false;
        this.storageSrv.addStreamer(channel)
            .subscribe(() => this.selected[channel.id] = true);
    }

    isNotSelected(id: number): boolean {
        return !this.selected.hasOwnProperty(id);
    }

    isSelected(id: number): boolean {
        return !this.isNotSelected(id) && this.selected[id];
    }

    isSelecting(id: number): boolean {
        return !this.isNotSelected(id) && !this.selected[id];
    }

    protected element(): HTMLElement {
        return this.el.nativeElement;
    }

    private formatResponse(): (response: TwitchResponse<Channel>) => void {
        return response => {
            log('format starting...');
            if (!response) {
                response = {...TwitchResponseSkeleton};
            }
            
            this.searching = false;
            log('searching updated!');
            this.cursor = !!response.pagination ? response.pagination.cursor : undefined;
            log('extract cursor processed!');
            this.results.push(
                ...response.data.sort((a, b) => a.display_name < b.display_name ? -1 : a.display_name > b.display_name ? 1 : 0)
            );
            log('extract & sort datas processed!');
            this.isEmpty = this.results.length === 0;
            log('isEmpty updated!');

            log('format ended');
            this.refreshView();
        };
    }

}