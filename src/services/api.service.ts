
import axios from 'axios';
import * as Constants from "../constants";
import {authenticationService as auth} from './authentication.service';
import { IGame } from '../models/game.model';
import { IGamer } from '../models/gamer.model';

export const apiService = {
    getGame,
    getGamer,
    addGamerGame
};

async function getGame(gameId: string) {
    const response = await axios.get(Constants.APIURL + "/api/games/" + gameId, auth.getHeaderOptions());
    return (response.data as IGame);
};

async function getGamer() {
    const response = await axios.get(Constants.APIURL + "/api/gamer/", auth.getHeaderOptions());
    return (response.data as IGamer);
};

async function addGamerGame(gameId: string) {
    const response = await axios.put(Constants.APIURL + "/api/gamer/games/add/" + gameId, null, auth.getHeaderOptions());
    return (response.data as IGamer);
};

