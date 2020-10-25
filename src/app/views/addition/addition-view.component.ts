import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

@Component({
    templateUrl : './addition-view.component.html',
    styleUrls   : ['./addition-view.component.scss'],
})
export class AdditionViewComponent implements OnInit {

    search: string;
    searching: boolean;
    searchUpdate: Subject<string>;

    constructor() {
        this.searchUpdate = new Subject<string>();
    }

    ngOnInit() { 
        this.searchUpdate.pipe(
            debounceTime(500),
            distinctUntilChanged(),
            tap(() => this.searching = true)
        )
        .subscribe(
            value => this.searchIntoTwitch(value), 
            () => this.searching = false
        );
    }


    private searchIntoTwitch(twitchId: string) {
        console.log(`search : ${twitchId}`);
        setTimeout(() => this.searching = false, 500);
    }

}