import { action, Action } from "easy-peasy";
import { InitDashboardData, IDashboardData } from "./dashboard.model";
import { IRoom } from "./room.model";

export interface IStoreModel {
    refreshCounter: number,
    dashboardData: IDashboardData,
    displayRoom: IRoom,
    deepLinkRoomId: string,
    deepLinkOccurrenceDate: string,
    displayGroupId: string,
    hasAvail: boolean,
    hasGames: boolean,
    tempSkipTour: boolean,

    forceRefresh: Action,
    skipTourTemp: Action,
    openRoom: Action<any, IRoom>,
    closeRoom: Action,
    setDeepLinkRoomId: Action<any, string>
    setDeepLinkOccurrenceDate: Action<any, string>,
    setDisplayGroupId: Action<any, string>
    clearRoomLink: Action<any>,
    closeGroup: Action<any>,
    setHasAvail: Action<any, boolean>,
    setHasGames: Action<any, boolean>
}

const model: IStoreModel = {
    // Store
    refreshCounter: 0,
    dashboardData: InitDashboardData,
    displayRoom: null,
    deepLinkRoomId: null,
    deepLinkOccurrenceDate: null,
    displayGroupId: null,
    hasAvail: true,
    hasGames: true,
    tempSkipTour: false,

    // Subroutines to load from API
    // fetchFoods: thunk(async actions => {
    //   const res = await fetch(
    //     "https://jsonplaceholder.typicode.com/todos?_limit=4"
    //   );
    //   const foodsFromAPI = await res.json();
    //   actions.setFoods(foodsFromAPI);
    // }),
    // Actions
    forceRefresh: action((state: any) => {
        state.refreshCounter++;
    }),
    skipTourTemp: action((state: any) => {
        state.tempSkipTour = true;
    }),
    openRoom: action((state: any, room: IRoom) => {
        state.displayRoom = room;
    }),
    closeRoom: action((state: any) => {
        state.displayRoom = null;
        state.deepLinkRoomId = null;
        state.deepLinkOccurrenceDate = null;
    }),
    setDeepLinkRoomId: action((state: any, roomId: string) => {
        state.deepLinkRoomId = roomId;
    }),
    setDeepLinkOccurrenceDate: action((state: any, occurrenceDate: string) => {
        state.deepLinkOccurrenceDate = occurrenceDate;
    }),
    setDisplayGroupId: action((state: any, groupId: string) => {
        state.displayGroupId = groupId;
    }),
    clearRoomLink: action((state: any) => {
        state.deepLinkRoomId = null;
        state.deepLinkOccurrenceDate = null;
    }),
    closeGroup: action((state: any) => {
        state.displayGroupId = null;
    }),
    setHasAvail: action((state: any, value: boolean) => {
        state.hasAvail = value;
    }),
    setHasGames: action((state: any, value: boolean) => {
        state.hasGames = value;
    }),

    // add: action((state, food) => {
    //   food.id = uuid.v4();
    //   state.foods = [...state.foods, food];
    // }),
    // toggle: action((state, id) => {
    //   state.foods.map(food => {
    //     if (food.id === id) {
    //       food.completed = !food.completed;
    //     }
    //     return food;
    //   });
    // }),
    // remove: action((state, id) => {
    //   state.foods = state.foods.filter(food => food.id !== id);
    // })
};

export default model;