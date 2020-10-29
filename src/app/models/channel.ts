export interface Channel {
    game_id: number;
    id: number;
    display_name: string;
    broadcaster_language: string;
    title: string;
    thumbnail_url: string;
    is_live: boolean;
    started_at: Date;
    tags_ids: string[];
}