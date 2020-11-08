export interface Channel {
    id?: number;
    display_name: string;
    thumbnail_url: string;
    broadcaster_language?: string;
    game_id?: number;
    title?: string;
    tags_ids?: string[];
    started_at?: Date;
    is_live: boolean;
}