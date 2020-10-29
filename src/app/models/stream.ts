export interface Stream {
    game_id: number;
    id: number;
    language: string;
    started_at: Date;
    tags_ids: string[];
    thumbnail_url: string;
    title: string;
    type: string;
    user_id: string;
    user_name: string;
    viewer_count: number;
}