export interface TwitchResponse<T> {
    data: T[];
    pagination: { [key: string]: string };
}