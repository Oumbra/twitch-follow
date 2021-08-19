import { Observable } from "rxjs";

export interface PageApi {
    setLoading(bool: boolean): void;
    back$(): Observable<void>;
    refreshView(): void;
}