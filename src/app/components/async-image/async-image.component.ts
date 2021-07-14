import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ELoadState } from 'src/app/enums/load-state';
import { AbstractComponent } from '../abstract.component';

@Component({
    selector: 'app-async-image',
    templateUrl: 'async-image.component.html',
    styleUrls  : ['./async-image.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AsyncImageComponent extends AbstractComponent  implements OnChanges, AfterViewInit, EventListenerObject {

    readonly ELoadState = ELoadState;

    @ViewChild('asyncImage', { static: true })
    element: ElementRef<HTMLImageElement>;

    @Input() src: string;
    @Input() timeout: number = 5000;
    @Output() loadStatus: EventEmitter<ELoadState> = new EventEmitter<ELoadState>();

    safeUrl: SafeUrl;
    status: ELoadState = ELoadState.IN_PROGRESS;

    private timer: NodeJS.Timer;

    constructor(private domSanitizer: DomSanitizer) {
        super();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.src.currentValue) {
            this.setLoadStatus(ELoadState.IN_PROGRESS);
            this.src = changes.src.currentValue;
            clearTimeout(this.timer);
        }
        this.safeUrl = this.domSanitizer.bypassSecurityTrustUrl(this.src);
        this.timer = setTimeout(() => {
            if (this.status === ELoadState.IN_PROGRESS) {
                this.setLoadStatus(ELoadState.FAILED);
            }
        }, this.timeout);
    }

    ngAfterViewInit(): void {
        this.element.nativeElement.addEventListener('load', this);
    }

    handleEvent(evt: Event) {
        this.setLoadStatus(ELoadState.SUCCESSED);
    }

    private setLoadStatus(status: ELoadState): void {
        this.status = status;
        this.loadStatus.emit(status);
    }

}