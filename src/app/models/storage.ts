import { Channel } from './response/channel';
import { Stream } from './response/stream';

export interface Storage {
    streamers: Streamer[];
}

export interface Streamer {
    id: string;
    name: string;
    thumbnail_url: string;
    language: string;
    is_live: boolean;
    title?: string;
    game_id?: number;
    started_at?: Date;
    viewer_count?: number;
}

export type StreamConvert = Stream | Channel;

export function convert(input: StreamConvert): Streamer {
    if ('is_live' in input) {
        const channel: Channel = input as Channel;
        
        return {
            id: `${channel.id}`,
            name: channel.display_name,
            thumbnail_url: channel.thumbnail_url,
            language: channel.broadcaster_language,
            title: channel.title,
            started_at: channel.started_at,
            is_live: channel.is_live,
        };
    } else {
        const stream: Stream = input as Stream;

        return {
            id: stream.user_id,
            name: stream.user_name,
            thumbnail_url: stream.thumbnail_url,
            language: stream.language,
            title: stream.title,
            started_at: stream.started_at,
            viewer_count: stream.viewer_count,
            game_id: stream.game_id,
            is_live: true,
        };
    }


}