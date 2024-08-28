export interface IGame {
    _id: string;
    gameId: string;
    platformId: string;
    platforms: string[];
    name: string;
    iconSm: string;
    iconLg: string;
    imageId: string;
    releaseDate: number;
    usrRequest: boolean;
    selected?: boolean;
}