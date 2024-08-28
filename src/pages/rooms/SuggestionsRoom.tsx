import React from 'react';
import s from './SuggestionsRoom.module.css'


import moment from 'moment';
import { IRoom } from '../../models/room.model';
import { IGame } from '../../models/game.model';


interface IRoomProps { // types of properties your component uses 
    game: IGame;
    room: IRoom;
    addRoom: any;
}
type tuserIconsColor = {
    [key:string]:string 
}
const UserIcon = ({category}: {category:string}) => {
    const userIconsColor: tuserIconsColor= {
        "fnd": "#48ACE7",
        "org" : "#FFA800",
        "pub" : "#737979",
    }
    return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill={userIconsColor[category]} xmlns="http://www.w3.org/2000/svg">
        <path d="M7.5 8.4375C9.8291 8.4375 11.7188 6.54785 11.7188 4.21875C11.7188 1.88965 9.8291 0 7.5 0C5.1709 0 3.28125 1.88965 3.28125 4.21875C3.28125 6.54785 5.1709 8.4375 7.5 8.4375ZM11.25 9.375H9.63574C8.98535 9.67383 8.26172 9.84375 7.5 9.84375C6.73828 9.84375 6.01758 9.67383 5.36426 9.375H3.75C1.67871 9.375 0 11.0537 0 13.125V13.5938C0 14.3701 0.629883 15 1.40625 15H13.5938C14.3701 15 15 14.3701 15 13.5938V13.125C15 11.0537 13.3213 9.375 11.25 9.375Z" />
    </svg>);
}
   
const SuggestionsRoom = (props: IRoomProps) => {

    let room = props.room;
    const game = props.game;
   
    //return list of icon imgs with various borders
    let inviteesImgs = room.invitees.map(function (invitee) {
        return <div key={invitee._id} className={s.gameUserInfo}>
           <UserIcon category={invitee.category} />
        </div>
       
    });
    if (room.invitees.length > 5) {
        inviteesImgs = inviteesImgs.slice(0, 4);
        inviteesImgs.push(<p>{"+" + (room.invitees.length - 4)}</p>);
    }
    return (
        // the above two lines are a container for you to now put in your html
        <div className={s.suggestionsRoom}>
            <div className={s.SRWrapper} onClick={() => props.addRoom(room)}> 
                <div>
                    <img src={game.iconSm} className={s.roomIcon} alt="game logo" />
                </div>
                <div className={s.roomDetails}>
                    <div className={s.roomDetailsR_1}>
                        <p className={s.roomGameName}>{game.name}</p>
                        <p className={s.roomGameStart}>{moment(room.startTime).format('h:mm A')}</p>
                    </div>
                    <div>
                        <p className={s.roomGameEnd}> till {moment(room.startTime).add(room.until, 'minutes').format('h:mm A')}</p>
                    </div>
                    {/* <p className="Room-Title">{room.description}</p> */}
                    <div className={s.roomDetailsR_2}>
                        <div className={s.roomCreator}>
                            {/*TODO: for all available people, list profile image as room-atendee-img */}
                            {inviteesImgs}
                        </div>
                    </div>
                </div>
            </div>
            {/* <button className={s.createRoom} >Add room</button> */}
        </div>
    );
}

export default SuggestionsRoom