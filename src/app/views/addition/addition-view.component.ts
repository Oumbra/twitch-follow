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

    cursor: string;
    query: string;
    searching: boolean;
    isEmpty: boolean = true;
    results: Channel[] = [];
    query$: Subject<string> = new Subject();
    scroll$: Subject<any> = new Subject();

    @ViewChild('input', { static: true })
    input: ElementRef<HTMLImageElement>;

    constructor(private router: Router,
                private twitchSrv: TwitchService) {
        super();
    }

    ngOnInit() {
        this.query$.pipe(
                takeUntil(this.destroy$),
                debounceTime(500),
                distinctUntilChanged(),
                tap(() => this.results = []),
                tap(() => this.isEmpty = true),
                filter(query => !!query && query.length > 0),
                tap(() => this.input.nativeElement.dispatchEvent(new Event('blur'))),
                tap(() => this.searching = true),
                switchMap(query => this.twitchSrv.searchChannel({ query })),
            )
            .subscribe(this.formatResponse(), this.formatResponse());

        this.scroll$.pipe(
                takeUntil(this.destroy$),
                filter(() => !!this.cursor),
                filter(e => e.target.offsetHeight + e.target.scrollTop === e.target.scrollHeight),
                distinctUntilChanged(),
                tap(() => log('end of scroll')),
                tap(() => this.searching = true),
                switchMap(() => this.twitchSrv.searchChannel({ after: this.cursor, query: this.query })),
            )
            .subscribe(this.formatResponse(), this.formatResponse());
    }

    back(): void {
        setTimeout(() => this.router.navigate(['/main']), this.results ? 500 : 0);
        this.isEmpty = true;
        this.query = undefined;
    }

    add(): void {
        
    }

    private formatResponse(): (response: TwitchResponse<Channel>) => void {
        return response => {
            log('format starting...');
            if (!response) {
                response = { data: [], pagination: {}};
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
            
            setTimeout(() => this.input.nativeElement.dispatchEvent(new Event('focus')), 100);
        };
    }

}