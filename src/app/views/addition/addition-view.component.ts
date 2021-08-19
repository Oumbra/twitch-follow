import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AbstractFormComponent } from 'src/app/components/abstract-form.component';
import { Channel } from 'src/app/models/response/channel';
import { TwitchResponse, TwitchResponseSkeleton } from 'src/app/models/response/twitch-response';
import { StorageService } from 'src/app/services/storage.service';
import { TwitchService } from 'src/app/services/twitch.service';
import { StringUtils } from 'src/app/utils/string.utils';

@Component({
    templateUrl : './addition-view.component.html',
    styleUrls   : ['./addition-view.component.scss'],
})
export class AdditionViewComponent extends AbstractFormComponent implements OnInit {

    cursor: string;
    isEmpty: boolean = true;
    searching: boolean;
    results: Channel[] = [];
    selected: { [key: number]: boolean } = {};
    scroll$: Subject<any> = new Subject();

    constructor(protected router: Router,
                protected formBuilder: FormBuilder,
                private storageSrv: StorageService,
                private twitchSrv: TwitchService) {
        super(router, formBuilder.group({ query: new FormControl() }));
    }

    protected onSubmit(): void {}

    ngOnInit() {
        super.ngOnInit();

        // repertorie les streamers déjà suivi
        this.storageSrv.storage$.pipe(
                takeUntil(this.destroy$),
                map(storage => storage.streamers),
                map(streamers => streamers.map(s => parseInt(s.id))),
            )
            .subscribe(ids => ids.forEach(id => this.selected[id] = true));

        this.form.get('query').valueChanges.pipe(
                takeUntil(this.destroy$),
                debounceTime(500),
                distinctUntilChanged(),
                tap(() => this.results = []),
                tap(() => this.isEmpty = true),
                filter(query => !!query && query.length > 0),
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

        this.page.back$().subscribe(() => {
            this.page.setLoading(true);
            this.form.setValue({ query: '' });
            this.isEmpty = true;
        });

        this.page.setLoading(false);
    }

    get query(): string {
        return this.form.get('query').value;
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

    private formatResponse(): (response: TwitchResponse<Channel>) => void {
        return response => {
            if (!response) {
                response = {...TwitchResponseSkeleton};
            }
            
            this.searching = false;
            this.cursor = !!response.pagination ? response.pagination.cursor : undefined;
            this.results.push(
                ...response.data.sort(StringUtils.compareBy('display_name'))
            );
            this.isEmpty = this.results.length === 0;

            this.page.refreshView();
        };
    }

}