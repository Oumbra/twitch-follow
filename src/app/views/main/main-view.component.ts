import { Component, OnInit } from '@angular/core';
import { MatButton } from '@angular/material';
import { delay } from 'rxjs/operators';
import { AbstractComponent } from 'src/app/components/abstract.component';
import { Channel } from 'src/app/models/channel';
import { StorageService } from 'src/app/services/storage.service';

@Component({
    templateUrl: './main-view.component.html',
    styleUrls: ['./main-view.component.scss'],
})
export class MainViewComponent extends AbstractComponent<MatButton> implements OnInit {

    synchronizing: boolean;
    list: Channel[] = [];
    deleting: { [key: number]: any } = {};

    
    constructor(private storageSrv: StorageService) {
        super();
    }

    ngOnInit() {
        this.synchronizing = true;

        this.storageSrv.streamer$.subscribe(streamers => {
            this.list = streamers;
            this.synchronizing = false;
            this.refresh();
        });
    }

    delete(channel: Channel): void {
        this.deleting[channel.id] = false;
        this.refresh();

        this.storageSrv.deleteStreamer(channel).pipe(delay(250)).subscribe(() => {
            delete this.deleting[channel.id];
            this.list.splice(this.list.findIndex(item => item.id === channel.id), 1);
            this.refresh();
        });
    }

    isNotDeleting(id: number): boolean {
        return !this.deleting.hasOwnProperty(id)
    }

    protected element(): HTMLElement {
        return this.el._elementRef.nativeElement;
    }

}