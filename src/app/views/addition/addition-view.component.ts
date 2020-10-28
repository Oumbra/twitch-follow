import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { log } from 'src/app/app.utils';
import { Channel } from 'src/app/models/channel';
import { TwitchResponse } from 'src/app/models/twitch-response';
import { TwitchService } from 'src/app/services/twitch.service';

@Component({
    templateUrl : './addition-view.component.html',
    styleUrls   : ['./addition-view.component.scss'],
})
export class AdditionViewComponent implements OnInit {

    search: string;
    searching: boolean;
    searchUpdate: Subject<string>;
    results: Channel[];

    constructor(private twitchSrv: TwitchService) {
        this.searchUpdate = new Subject<string>();
    }

    ngOnInit() { 
        this.searchUpdate.pipe(
            debounceTime(500),
            tap(() => this.searching = true),
            tap(() =>  log(`search starting...`)),
            switchMap(query => this.twitchSrv.searchChannel({ query })),
            tap(() => log('search ended!')),
        )
        .subscribe(
            response => {
                log(`response`, response);
                this.formatResponse(response);
                log('formated!');
            },
            () => this.formatResponse({ data: [], pagination: {}})
        );
    }


    private formatResponse(response: TwitchResponse<Channel>) {
        this.searching = false;
        this.results = response.data.sort((a,b) => a < b ? -1 : a > b ? 1 : 0);
    }

}