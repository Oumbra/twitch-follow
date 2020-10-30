import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
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

    query: string;
    queryUpdate: Subject<string>;
    searching: boolean;
    hasPrevious: boolean;
    hasNext: boolean;
    results: Channel[];
    cursor: string;
    total: number;

    private historics: LinkedList<Channel[]>;

    @ViewChild('input', { static: true })
    input: ElementRef<HTMLImageElement>;

    constructor(private router: Router,
                private twitchSrv: TwitchService) {
        super();
        this.queryUpdate = new Subject();
        this.historics = new LinkedList();
        this.total = 0;
    }

    ngOnInit() {
        ;
        this.queryUpdate.pipe(
                takeUntil(this.ngDestroy$),
                filter(query => !!query && query.length > 0),
                debounceTime(500),
                distinctUntilChanged(),
                tap(() => this.input.nativeElement.dispatchEvent(new Event('blur'))),
                tap(() => this.searching = true),
                tap(() => this.historics = new LinkedList()),
                tap(() => log('query starting...')),
                switchMap(query => this.twitchSrv.searchChannel({ query })),
                tap(() => log('query ended')),
            )
            .subscribe(this.formatResponse(), this.formatResponse());
    }

    back(): void {
        setTimeout(() => this.router.navigate(['/main']), this.results ? 500 : 0);
        this.total = 0;
        this.hasNext = false;
        this.hasPrevious = false;
        this.cursor = undefined;
    }

    next(): void {
        const spinnerName: string = 'navigate';
        if (this.historics.hasNext) {
            this.results = this.historics.next;
            this.updateNavigation();
        } else {
            of('').pipe(
                takeUntil(this.ngDestroy$),
                debounceTime(500),
                tap(() => this.searching = true),
                tap(() => log('query starting...')),
                switchMap(() => this.twitchSrv.searchChannel({ after: this.cursor, query: this.query })),
                tap(() => log('query ended')),
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
            
            this.searching = false;
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
            
            setTimeout(() => this.input.nativeElement.dispatchEvent(new Event('focus')), 100);
        };
    }

    private updateNavigation(): void {
        this.hasNext = this.historics.hasNext;
        this.hasPrevious = this.historics.hasPrevious;
    }

}