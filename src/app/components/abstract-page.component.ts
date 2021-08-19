import { OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { Subject, timer } from "rxjs";
import { delayWhen, map } from "rxjs/operators";
import { ERoute, getPath } from "../enums/route.enums";
import { AbstractComponent } from "./abstract.component";
import { PageApi } from "./page/page-api";
import { PageComponent } from "./page/page.component";

export abstract class AbstractPageComponent extends AbstractComponent implements OnInit {
    
    readonly ERoute: typeof ERoute = ERoute;
    readonly navigate: Subject<ERoute> = new Subject<ERoute>();

    @ViewChild(PageComponent, {static: true}) page: PageApi;


    constructor(protected router: Router) {
        super();
    }

    ngOnInit(): void {
        this.navigate
            .pipe(
                delayWhen(() => timer(this.getNavigateDelay())),
                map(route => getPath(route))
            )
            .subscribe(route => this.router.navigate([route]));
    }

    getNavigateDelay(): number {
        return 0;
    }
}