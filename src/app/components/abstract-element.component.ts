import { ViewChild } from "@angular/core";
import { blur, waitUntil } from "../app.utils";
import { AbstractComponent } from "./abstract.component";

export abstract class AbstractElementComponent<T> extends AbstractComponent {

    @ViewChild('refresh', { static: true }) el: T;
    
    refreshView(): void {
        waitUntil(blur(this.element()), () => !!this.element(), 250);
    }

    protected abstract element(): HTMLElement;
}