export type Pick='1'|'X'|'2';
export type Role='admin'|'participant';
export type RoundStatus='draft'|'published'|'closed'|'scored';
export type Match={id:string;order:number;competition:string;home_team:string;away_team:string;starts_at:string;division:'primera'|'segunda';is_pleno:boolean;result?:Pick;pleno_score?:string};
export type PredictionItem={match_id:string;pick:Pick;highlighted:boolean;pleno_score?:string};
export type Prediction={participant_id:string;items:PredictionItem[];is_default:boolean};
export type RoundScore={participant_id:string;regular_points:number;pleno_points:number;total_points:number;segunda_hits:number;away_hits:number;draw_hits:number;is_default:boolean;eliminated:boolean;saved_by_copita:boolean;rank:number};
export type Participant={id:string;display_name:string;role?:Role;team_name?:string;status?:string;money_won?:number;copitas?:number};
