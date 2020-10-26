export interface Channel {
    broadcaster_language: string;
    display_name: string;
    game_id: number;
    id: number;
    is_live: boolean;
    tags_ids: string[];
    thumbnail_url: string;
    title: string;
    started_at: Date;
}