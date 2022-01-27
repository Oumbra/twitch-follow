import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CHANNEL_URL, CLIENT_ID, GAME_URL, STREAM_URL, USER_URL } from '../app.constantes';
import { standardCatchError } from '../app.utils';
import { ChannelSearchOpts } from '../models/parameter/channel-search-opts';
import { GameSearchOpts } from '../models/parameter/game-search-opts';
import { StreamSearchOpts } from '../models/parameter/stream-search-opts';
import { Channel } from '../models/response/channel';
import { Game } from '../models/response/game';
import { Stream } from '../models/response/stream';
import { TwitchResponse } from '../models/response/twitch-response';
import { User } from '../models/response/user';
import { TokenService } from './token.service';

@Injectable({
    providedIn: 'root',
})
export class TwitchService {

    readonly CREDENTIALS = {
        'Client-ID': CLIENT_ID,
    };

    constructor(private httpClient: HttpClient,
                private tokenSrv: TokenService) {
    }

    searchUser(id: string[]): Observable<TwitchResponse<User>> {
        return this.tokenSrv.getToken()
            .pipe(
                switchMap(token => this.httpClient.get(USER_URL, this.options(token, { id }))),
                map((datas: any) => this.convert<User>(datas)),
                catchError(standardCatchError)
            );
    }

    searchChannel(query: ChannelSearchOpts): Observable<TwitchResponse<Channel>> {
        return this.tokenSrv.getToken()
            .pipe(
                switchMap(token => this.httpClient.get(CHANNEL_URL, this.options(token, query))),
                map((datas: any) => this.convert<Channel>(datas)),
                catchError(standardCatchError)
            );
    }

    searchStream(query: StreamSearchOpts): Observable<TwitchResponse<Stream>> {
        return this.tokenSrv.getToken().pipe(
            switchMap(token => this.httpClient.get(STREAM_URL, this.options(token, query))),
            map((datas: any) => this.convert<Stream>(datas)),
            catchError(standardCatchError)
        );
    }

    searchGame(query: GameSearchOpts): Observable<TwitchResponse<Game>> {
        return this.tokenSrv.getToken().pipe(
            switchMap(token => this.httpClient.get(GAME_URL, this.options(token, query))),
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

    private options(token: string, searchOpt?: any): { [key: string]: any } {
        return {
            headers: this.headers(token),
            params: searchOpt || {},
        }
    }

    private headers(token: string, overrides?: HttpHeaders | { [header: string]: string | string[]; }): HttpHeaders {
        return new HttpHeaders({
            ...(overrides || {}),
            ...this.CREDENTIALS,
            Authorization: `Bearer ${token}`
        })
    }

}