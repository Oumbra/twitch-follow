import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { CLIENT_ID, CLIENT_SECRET, TOKEN_URL, TWITCH_TOKEN_NAME, VALIDATE_URL } from '../app.constantes';
import { obj, standardCatchError } from '../app.utils';


@Injectable({
    providedIn: 'root',
})
export class TokenService {

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
        return this.httpClient.get(VALIDATE_URL, {
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
        return this.httpClient.post(`${TOKEN_URL}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`, null, { responseType: 'json' })
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