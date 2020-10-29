import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CLIENT_ID } from '../app.constantes';
import { standardCatchError } from '../app.utils';
import { Channel } from '../models/channel';
import { ChannelSearchOpts } from '../models/channel-search-opts';
import { Game } from '../models/game';
import { Stream } from '../models/stream';
import { GameSearchOpts } from '../models/game-search-opts';
import { StreamSearchOpts } from '../models/stream-search-opts';
import { TwitchResponse } from '../models/twitch-response';
import { TokenService } from './token.service';

@Injectable({
    providedIn: 'root',
})
export class TwitchService {
    
    private STREAM_URL: string = 'https://api.twitch.tv/helix/streams';
    private CHANNEL_URL: string = 'https://api.twitch.tv/helix/search/channels';
    private GAME_URL: string = 'https://api.twitch.tv/helix/search/games';

    constructor(private httpClient: HttpClient,
                private tokenSrv: TokenService) {
    }

    searchChannel(query: ChannelSearchOpts): Observable<TwitchResponse<Channel>> {
        return this.tokenSrv.getToken()
            .pipe(
                switchMap(token => this.httpClient.get(this.CHANNEL_URL, this.opts(token, query))),
                map((datas: any) => this.convert<Channel>(datas)),
                catchError(standardCatchError)
            );
    }

    searchStream(query: StreamSearchOpts): Observable<TwitchResponse<Stream>> {
        return this.tokenSrv.getToken().pipe(
            switchMap(token => this.httpClient.get(this.STREAM_URL, this.opts(token, query))),
            map((datas: any) => this.convert<Stream>(datas)),
            catchError(standardCatchError)
        );
    }

    searchGame(query: GameSearchOpts): Observable<TwitchResponse<Game>> {
        return this.tokenSrv.getToken().pipe(
            switchMap(token => this.httpClient.get(this.GAME_URL, this.opts(token, query))),
            map((datas: any) => this.convert<Game>(datas)),
            catchError(standardCatchError)
        );
    }

    private convert<T>(datas: any): TwitchResponse<T> {
        return {
            data: datas.data,
            pagination: datas.pagination,
        };
    }

    private opts(token: string, searchOpt: any): { [key: string]: any } {
        return {
            headers: {
                'Client-ID': CLIENT_ID,
                'Authorization': `Bearer ${token}`
            },
            params: this.params(searchOpt),
        }
    }

    private params(objParam: any):  { [param: string]: string | string[]; } {
        const obj = {};
        for (let key in objParam) {
            obj[key] = objParam[key];
        }
        return obj;
    }
}