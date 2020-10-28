import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { CLIENT_ID, CLIENT_SECRET, TWITCH_TOKEN_NAME } from '../app.constantes';
import { log, obj, standardCatchError } from '../app.utils';

@Injectable({
    providedIn: 'root',
})
export class TokenService {
    
    readonly VALIDATE_URL: string = 'https://id.twitch.tv/oauth2/validate';
    readonly TOKEN_URL: string = 'https://id.twitch.tv/oauth2/token';

    constructor(private httpClient: HttpClient) { 
    }
    
    public getToken(): Observable<string> {
        return this.recoverToken()
            .pipe(
                switchMap(token => !!token ? this.validToken(token) : this.refreshToken()),
                catchError(standardCatchError),
            );
    }

    private validToken(token: string): Observable<string> {
        return this.httpClient.get(this.VALIDATE_URL, {
                headers: { 'Authorization': `OAuth ${token}` },
            }).pipe(
                switchMap((datas: any) => datas.client_id
                    ? of(token)
                    : this.refreshToken()
                ),
                catchError(standardCatchError),
            );
    }

    private refreshToken(): Observable<string> {
        return this.httpClient.post(`${this.TOKEN_URL}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`, null, { responseType: 'json' })
            .pipe(
                map((datas: any) => datas.access_token),
                tap(token => chrome.storage.sync.set(obj(TWITCH_TOKEN_NAME, token))),
                catchError(standardCatchError),
            );
    }

    private recoverToken(): Observable<string> {
        return new Observable((observer) => {
            chrome.storage.local.get(TWITCH_TOKEN_NAME, (items: { [key: string]: any }) => {
                observer.next(items[TWITCH_TOKEN_NAME]);
                observer.complete();
            });
        });
    }

}