export interface IGamer {
    _id: string;
    username: string;
	avatarUrlSm: string;
	avatarUrlLg: string;
	avatarIcon: string;
    platforms: any;
    games: string[]; //games owned
    gamesPreferred: string[]; //preferred games to filter by
    orgs: string[];
    friends: string[];
    rooms: string[];
	avails: any[];
	availsArr: number[];
	hasAvail: boolean;
    updateTS: Date;
    user: string;
}