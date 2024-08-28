export interface IRoom  {
    _id: string;
    game: string;
    platformId: string;
    org: string; //org affiliation (optional)
	orgName: string;
	host: string;
    description: string;
    hostUsername: string;
    hostTimezone: string;
    joinServer: string;
    comments: any[];
    password: string;
    isLocked: boolean;
    privacyLevel: number; //0 - none, 1 - invite only, 2 - friends only, 3 - org only, 4 - friends or org, 5 - any
    startTime: Date; //Date and Time in UTC when the room is scheduled to start
    startTimeInc30: number; //used for grouping rooms on dashboard, represents 30min increments from midnight, ie: 0=12am, 2=1am, 5=2:30am, 24=12pm, 47=11:30pm
    until?: number;
    maxPlayers: number;
    players: any[];
    gameMode: string;
	isRepeat: boolean;
	repeatConfig: any;
	repeatParentId:string; // if this room is an occurrance of a series, this is the parent room Id
    roomCategory: string;
    invitees?: any[];
}