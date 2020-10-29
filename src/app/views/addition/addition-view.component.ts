import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, tap } from 'rxjs/operators';
import { log } from 'src/app/app.utils';
import { AbstractComponent } from 'src/app/components/abstract.component';
import { Channel } from 'src/app/models/channel';
import { LinkedList } from 'src/app/models/linkedlist';
import { TwitchResponse } from 'src/app/models/twitch-response';
import { TwitchService } from 'src/app/services/twitch.service';

@Component({
    templateUrl : './addition-view.component.html',
    styleUrls   : ['./addition-view.component.scss'],
})
export class AdditionViewComponent extends AbstractComponent implements OnInit {

    search: string;
    searchUpdate: Subject<string>;
    searching: boolean;
    hasPrevious: boolean;
    hasNext: boolean;
    results: Channel[];
    cursor: string;
    total: number;

    private historics: LinkedList<Channel[]>;

    constructor(private router: Router,
                private spinner: NgxSpinnerService,
                private twitchSrv: TwitchService) {
        super();
        this.searchUpdate = new Subject();
        this.historics = new LinkedList();
        this.total = 0;
    }

    ngOnInit() { 
        this.searchUpdate.pipe(
                takeUntil(this.ngDestroy$),
                debounceTime(500),
                distinctUntilChanged(),
                tap(() => this.updateSearchState(true)),
                tap(() => this.historics = new LinkedList()),
                tap(() => log('search starting...')),
                switchMap(query => this.twitchSrv.searchChannel({ query })),
                tap(() => log('search ended')),
            )
            .subscribe(this.formatResponse(), this.formatResponse());
    }

    back(): void {
        setTimeout(() => this.router.navigate(['/main']), this.results ? 500 : 0);
        this.total = 0;
    }

    next(): void {
        if (this.historics.hasNext) {
            this.results = this.historics.next;
            this.updateNavigation();
        } else {
            log('search starting...');
            this.twitchSrv.searchChannel({ after: this.cursor, query: this.search }).pipe(
                    takeUntil(this.ngDestroy$),
                    tap(() => this.updateSearchState(true)),
                    tap(() => log('search ended')),
                )
                .subscribe(this.formatResponse(), this.formatResponse());
        }
    }

    previous(): void {
        this.results = this.historics.previous;
        this.updateNavigation();
    }

    private formatResponse(): (response: TwitchResponse<Channel>) => void {
        return response => {
            log('format starting...');
            if (!response) {
                response = { data: [], pagination: {}};
            }
            
            this.updateSearchState(false);
            log('updateSearchState processed!');
            this.cursor = !!response.pagination ? response.pagination.cursor : undefined;
            log('extract cursor processed!');
            this.results = response.data.sort((a, b) => a.display_name < b.display_name ? -1 : a.display_name > b.display_name ? 1 : 0);
            log('extract & sort datas processed!');
            
            this.historics.push(this.results);
            log('historic assignation processed!');
            this.total = this.historics.reduce((list, acc) => acc + list.length, 0);
            log('total calcul processed!');
            this.updateNavigation();
            log('updateNavigation processed!');

            log('format ended');
        };
    }

    private updateNavigation(): void {
        this.hasNext = this.historics.hasNext;
        this.hasPrevious = this.historics.hasPrevious;
    }

    private updateSearchState(state: boolean): void {
        if (state) {
            this.spinner.show();
        } else {
            this.spinner.hide();
        }
        this.searching = state;
    }

}