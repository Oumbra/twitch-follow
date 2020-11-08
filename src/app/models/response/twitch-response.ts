export interface TwitchResponse<T> {
    data: T[];
    pagination: { [key: string]: string };
}

export const TwitchResponseSkeleton: TwitchResponse<any> = { data: [], pagination: {} };