import { Channel } from './response/channel';
import { Stream } from './response/stream';

export interface Settings {
    refreshTime: number;
    infiniteNotif: boolean;
    darkMode: boolean;
}

export class SettingsSchema implements Settings {
    static readonly SKELETON = new SettingsSchema();
    static readonly PROPS = Object.keys(SettingsSchema.SKELETON);

    refreshTime: number = 10000;
    infiniteNotif: boolean = true;
    darkMode: boolean = false;

    public static isValidSchema(obj: any): boolean {
        return this.PROPS.filter(property => property in obj).length === this.PROPS.length;
    }
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

export class StreamerSchema implements Streamer {
    static readonly SKELETON = new StreamerSchema();
    static readonly PROPS = Object.keys(StreamerSchema.SKELETON);

    id: string = null;
    name: string = null;
    thumbnail_url: string = null;
    language: string = null;
    is_live: boolean = null;

    public static isValidSchema(obj: any): boolean {
        return this.PROPS.filter(property => property in obj).length === this.PROPS.length;
    }
}

export interface Storage {
    streamers: Streamer[];
    settings: Settings;
}

export class StorageSchema implements Storage {
    static readonly SKELETON = new StorageSchema();
    static readonly PROPS = Object.keys(StorageSchema.SKELETON);

    streamers: Streamer[] = [];
    settings: Settings = SettingsSchema.SKELETON;

    public static isValidSchema(obj: any): boolean {
        return this.PROPS.filter(property => property in obj).length === this.PROPS.length
            && (obj as StorageSchema)
                .streamers
                .reduce((acc, item) => acc && StreamerSchema.isValidSchema(item), true);
    }
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