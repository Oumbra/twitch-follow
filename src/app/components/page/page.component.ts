import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from "@angular/core";
import { MatButton } from "@angular/material";
import { Router } from "@angular/router";
import { Observable, Subject, timer } from "rxjs";
import { delayWhen, map } from "rxjs/operators";
import { ERoute, getPath } from "src/app/enums/route.enums";
import { AbstractElementComponent } from "../abstract-element.component";
import { PageApi } from "./page-api";

@Component({
    selector: "app-page",
    templateUrl: "./page.component.html",
    styleUrls: ["./page.component.scss"],
    encapsulation: ViewEncapsulation.None,
})
export class PageComponent extends AbstractElementComponent<MatButton> implements OnInit, OnChanges, PageApi {

    @Input() returnLink?: ERoute;
    @Input() returnDelay?: number;
    
    _back$: Subject<void> = new Subject();
    loading: boolean = true;

    constructor(private router: Router) {
        super();
    }

    protected element(): HTMLElement {
        return this.el._elementRef.nativeElement;
    }

    ngOnInit() {
        this.back$()
            .pipe(
                delayWhen(() => timer(this.returnDelay)),
                map(() => getPath(this.returnLink))
            )
            .subscribe(route => this.router.navigate([route]));
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.returnDelay = this.returnDelay || 0;
    }

    back$(): Observable<void> {
        return this._back$.asObservable();
    }

    setLoading(bool: boolean): void {
        this.loading = bool;
        this.refreshView();
    }
}