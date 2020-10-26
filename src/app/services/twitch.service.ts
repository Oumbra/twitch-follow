import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CLIENT_ID } from '../app.constantes';
import { Channel } from '../models/channel';
import { ChannelSearchOpts } from '../models/channel-search-opts';
import { StreamSearchOpts } from '../models/stream-search-opts';
import { TwitchResponse } from '../models/twitch-response';
import { TokenService } from './token.service';

@Injectable({
    providedIn: 'root',
})
export class TwitchService {
    
    private STREAM_URL: string = 'https://api.twitch.tv/helix/streams';
    private CHANNEL_URL: string = 'https://api.twitch.tv/helix/search/channels';

    constructor(private httpClient: HttpClient,
                private tokenSrv: TokenService) {
    }

    searchChannel(query: ChannelSearchOpts): Observable<TwitchResponse<Channel>> {
        return this.tokenSrv.getToken()
            .pipe(
                switchMap(token => this.httpClient.get(this.CHANNEL_URL, this.opts(token, query))),
                map((datas: any) => {
                    return {
                        data: datas.data,
                        pagination: datas.pagination,
                    }
                }),
                catchError((e, obs) => {
                    console.log("error", e);
                    return throwError(e);
                })
            );
    }

    searchStream(query: StreamSearchOpts): Observable<TwitchResponse<Channel>> {
        return this.tokenSrv.getToken().pipe(
            switchMap(token => this.httpClient.get(this.STREAM_URL, this.opts(token, query))),
            map((datas: any) => {
                return {
                    data: datas.data,
                    pagination: datas.pagination,
                }
            }),
            catchError((e, obs) => {
                console.log("error", e);
                return throwError(e);
            })
        );
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