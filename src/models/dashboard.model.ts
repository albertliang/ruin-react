import { IRoom } from "./room.model";
import { IGame } from "./game.model";

export interface IDashboardData {
	rooms: Record<string, IRoom[]>,
	games: Record<string, IGame>,
	gamer: Record<string, any>
}

export const InitDashboardData: IDashboardData = {rooms: {}, games: {}, gamer: {}};