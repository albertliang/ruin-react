import React from 'react';
// import './Room.css';
import s from './Room.module.css'
import moment from 'moment';
import { IRoom } from '../../models/room.model';
import { IGame } from '../../models/game.model';

interface IRoomProps { // types of properties your component uses 
    game: IGame;
    room: IRoom;
}

const Room = (props: IRoomProps) => {
    const room = props.room;
    const game = props.game; 
    let roomStyle = s.pubs;
    if (room.roomCategory === 'user')
        roomStyle = s.user;
    else if (room.roomCategory === 'friends')
        roomStyle = s.friends;
    else if (room.roomCategory === 'orgs')
        roomStyle = s.orgs;

    return (
        // the above two lines are a container for you to now put in your html
        <div className={s.roomWrapper}>
            <div className={`${s.roomWrapper} ${roomStyle}`}> 
                <div>
                    <img src={game.iconSm} className={s.roomIcon} alt={game.name} />
                </div> 
                <div className={s.roomDetails}>
                    <div className={s.roomDetailsR_1}> 
                        <p className={s.roomGameName}>{game.name}</p>
                        <p className={s.roomGameStart}>{moment(room.startTime).format('h:mm A') }</p>
                    </div>
                    <p className={s.roomGameMode}>{room.gameMode}</p>
                    <div className={s.roomDetailsR_2}>
                        <div className={s.createdBy}>{room.hostUsername}</div>
                        <div className={s.playersNumber}>{room.players.length}/{room.maxPlayers}</div>
                    </div>
                </div>
            </div>
        </div>
        
    );
}

export default Room