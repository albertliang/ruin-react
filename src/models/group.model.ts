export interface IGroup {
    _id: string;
    name: string;
    description: string;
    url: string;
    abbreviation: string;
    isOpen: boolean;
    members: any[];
    admins: any[];
    games: any[];
    rooms: any[];
    comments: any[];
}