import { HttpEvent, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

export interface HttpRequest {

    get(url: string, options: HttpOptions): Observable<HttpEvent<any>>;

    post(url: string, body: any | null, options: HttpOptions): Observable<HttpEvent<Object>>;

}

export interface HttpOptions {
    headers?: HttpHeaders | { [header: string]: string | string[]; };
    observe: "events"; 
    params?: HttpParams | { [param: string]: string | string[]; };
    reportProgress?: boolean;
    responseType?: "json";
    withCredentials?: boolean;
}