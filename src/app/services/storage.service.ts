import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { APP_NAME } from '../app.constantes';
import { obj } from '../app.utils';
import { Channel } from '../models/response/channel';
import { convert, Storage, Streamer } from '../models/storage';
import { TwitchService } from './twitch.service';

@Injectable({
    providedIn: 'root',
})
export class StorageService {

    private readonly SKELETON: Storage = {
        streamers: [],
    };

    constructor(private twitchSrv: TwitchService) {
    }

    addStreamer(channel: Channel): Observable<void> {
        return this.storage$.pipe(
            tap(storage => storage.streamers.push(convert(channel))),
            switchMap(storage => this.setStorage(storage))
        );
    }

    deleteStreamer(streamerId: number): Observable<void> {
        return this.storage$.pipe(
            tap(storage => storage.streamers.splice(storage.streamers.findIndex(i => i.id === `${streamerId}`), 1)),
            switchMap(storage => this.setStorage(storage))
        );
    }

    /**
     * liste de streamer à jour
     */
    get streamer$(): Observable<Streamer[]> {
        let tmpList: Streamer[];
        return this.storage$.pipe(
            map(storage => storage.streamers),
            tap(localStreamers => tmpList = localStreamers),
            map(localStreamers => localStreamers.map(streamer => `${streamer.id}`)),
            switchMap(ids => this.twitchSrv.searchStream({user_id: ids})),
            map(response => response.data.map(stream => convert(stream))),
            map(streamers => tmpList.map(s => {
                const streamer = streamers.find(streamer => streamer.id === s.id);
                return {
                    ...s,
                    is_live: streamer && streamer.is_live,
                    title: streamer && streamer.title,
                    game_id: streamer && streamer.game_id,
                    started_at: streamer && streamer.started_at,
                    viewer_count: streamer && streamer.viewer_count,
                };
            }))
        );
    }

    get storage$(): Observable<Storage> {
        return new Observable(observer => {
            chrome.storage.local.get(APP_NAME, items => {
                observer.next(items[APP_NAME] || this.SKELETON);
                observer.complete();
            });
        });
    }

    private setStorage(storage: Storage): Observable<void> {
        return new Observable(observer => {
            chrome.storage.local.set(obj(APP_NAME, storage), () => {
                observer.next();
                observer.complete();
            });
        });
    }
}