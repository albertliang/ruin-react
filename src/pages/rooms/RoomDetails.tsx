import React, { useState, useEffect, useReducer } from "react";
import { MdAccountCircle } from "react-icons/md";
import { IRoom } from "../../models/room.model";
import { IGame } from "../../models/game.model";
import * as Constants from "../../constants";
import moment from "moment-timezone";
import axios from "axios";
import { useFormik } from "formik";
import { ReactComponent as CrownSVG } from "../../crown.svg";
import { authenticationService as auth } from "../../services/authentication.service";
import { Button, Modal, ModalHeader, ModalBody, FormGroup, Input } from "reactstrap";
import DatePicker from "react-datepicker";
import { FiLink } from "react-icons/fi";
import closeImg from "../../assets/img/close.svg";
import repeatImg from "../../assets/img/repeat.svg";
import cn from "classnames";
import toast from 'toasted-notes' 
import 'toasted-notes/src/styles.css';
import "react-datepicker/dist/react-datepicker.css";
import "./RoomDetails.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/pro-regular-svg-icons'

import steamImg from '../../assets/img/platforms/steam.png';
import xblImg from '../../assets/img/platforms/xbl.png';
import psnImg from '../../assets/img/platforms/psn.png';
import nintendoImg from '../../assets/img/platforms/nintendo.png';
import epicImg from '../../assets/img/platforms/epic.png';
import originImg from '../../assets/img/platforms/origin.png';
import uplayImg from '../../assets/img/platforms/uplay.png';
import bnetImg from '../../assets/img/platforms/bnet.png';
import gogImg from '../../assets/img/platforms/gog.png';

import { Dropdown, ButtonGroup, Form, FormCheck } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import Platforms from "../games/Platforms";

// INTERFACES ***********
interface IDispatchAction {
    type: string;
    field?: string;
    value?: any;
}

interface IRoomProps {
    room: IRoom;
    gameLookup: IGame;
    closeRoom: () => void;
}

// REDUCERS ***********
function reducer(state: IRoom, action: IDispatchAction) {
    if (action.type === "reload")
        return { ...action.value };
    
    if (action.type === "field")
        return { ...state, [action.field]: action.value };

    if (action.type === "repeatConfig") {
        if (action.field === "isRepeat") {
            if (action.value === true){
                return { ...state, isRepeat: true, repeatConfig: state.repeatConfig || { occursOnDays: [], startsOn: state.startTime, endsOn: null } };
            }
            else {
                return { ...state, isRepeat: false };
            }
        }
        else if (action.field.includes("occursOnDays")) {
            const dayIndex = parseInt(action.field.replace("occursOnDays", ""));
            const arrOccursOnDays: number[] = state.repeatConfig.occursOnDays || [];
            if (action.value === true) {
                arrOccursOnDays.push(dayIndex);
                return { ...state, repeatConfig: { ...state.repeatConfig, occursOnDays: arrOccursOnDays }};
            } else {
                var index = arrOccursOnDays.indexOf(dayIndex)
                if (index !== -1) {
                    arrOccursOnDays.splice(index, 1);
                    return { ...state, repeatConfig: { ...state.repeatConfig, occursOnDays: arrOccursOnDays }};
                }
            }
        }
        else {
            return { ...state, repeatConfig: { ...state.repeatConfig, [action.field]: action.value }};
        }
    }
        
}

function Room(props: IRoomProps) {

    const userId = auth.getUserId();
    const timezone = auth.getUserTimezone();
    const headerOptions = auth.getHeaderOptions();

    const [roomState, dispatch] = useReducer(reducer, { ...props.room });
    const [gameLookup, setGameLookup] = useState(props.gameLookup);
    const [showPlatform, setShowPlatform] = useState(false);
    const [linkMode, setLinkMode] = useState(0);

    const [comments, setComments] = useState(roomState.comments);
    const [candidates, setCandidates] = useState([]);
    const [playerGamerTags, setPlayerGamerTags] = useState(null);
    const [isEditable, setEditable] = useState(!(roomState && roomState._id));
    const [isReload, setIsReload] = useState(false);
    
    const [userGames, setUserGames] = useState([]);
    const [userFriends, setUserFriends] = useState([]);
    const [userNetworks, setUserNetworks] = useState([]);

    const [platformId, setPlatformId] = useState(roomState.platformId);


    const history = useHistory();

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    let newRoom = roomState;
    const formik = useFormik({
        initialValues: {
            message: "",
        },
        onSubmit: (values) => {
            writeComment(values.message);
            values.message = "";
        },
    });

    let isPlayer = false;
    const isOwner = userId === roomState.host;
    if (isOwner)
        isPlayer = true;
    else {
        for (let i = 0; i < roomState.players.length; i++) {
            if (userId === roomState.players[i].gamer)
                isPlayer = true;
        }
    }

    // FUNCTIONS ***********

    const closeRoomDetail = () => {
        document.querySelector("body").style.overflowY = "auto";
        if (isReload) {
            window.location.reload();
        }
        props.closeRoom();
    }

    const showHidePlatform = () => {
        setShowPlatform(!showPlatform);
    }

    const onChange = (e: any) => {
        dispatch({ type: "field", field: e.target.name, value: e.target.value });
    }

    const onChangeDate = (field: string, value: any) => {
        dispatch({ type: "field", field: field, value: value });
    }

    const onChangeRepeatConfigDate = (field: string, value: any) => {
        dispatch({ type: "repeatConfig", field: field, value: value });
    }

    const onChangeRepeatConfigOccursOnDays = (field: string, value: any) => {
        dispatch({ type: "repeatConfig", field: field, value: value });
    }

    const changeHours = (e: any) => {
        const currTime = moment(roomState.startTime);
        let newHours = currTime.hours() + 1;
        if (newHours === 24) {
            newHours -= 12;
        }
        else if (newHours === 12) {
            newHours -= 12;
        }
        else if (newHours > 23) {
            newHours -= 24;
        }
        else if (newHours < 0) {
            newHours += 24;
        }
        const newTime = currTime.hours(newHours);
        dispatch({ type: "field", field: 'startTime', value: newTime });
    }

    const changeMinutes = (e: any) => {
        const newMinutes = (parseInt(e.target.value) + 15) % 60;
        const newTime = moment(roomState.startTime).minutes(newMinutes);
        dispatch({ type: "field", field: 'startTime', value: newTime });
    }

    const changeIsAm = (e: any) => {
        const wasAm = moment(roomState.startTime).hours() < 12;
        const newTime = moment(roomState.startTime).add((wasAm ? 12 : -12), 'hours');
        dispatch({ type: "field", field: 'startTime', value: newTime });
    }

    async function saveRoom() {

        // if auth, join room
        if (auth.isAuthenticated()){
            if (roomState.org)
            roomState.orgName = userNetworks.find((org) => org._id == roomState.org).name;

            let newRoom: any;
            if (roomState._id) {
                newRoom = await axios.put(Constants.APIURL + "/api/rooms/" + roomState._id.toString(), roomState, headerOptions);
            } else {
                newRoom = await axios.post(Constants.APIURL + "/api/rooms", roomState, headerOptions);
                dispatch({type: "reload", value: newRoom.data});
            }

            setIsReload(true);
            setEditable(false);
        }
        //else open login/signup
        else {
            history.push("/signup");
        }
    }

    async function deleteRoom() {
        try {
            await axios.delete(Constants.APIURL + "/api/rooms/" + roomState._id.toString(), headerOptions);
            window.location.reload();
            props.closeRoom();
        } catch (err) {
            console.log(err);
        }
    }

    async function leaveRoom() {
        try {
            await axios.put(Constants.APIURL + "/api/rooms/" + roomState._id.toString() + "/leave", null, headerOptions);
            window.location.reload();
            closeRoomDetail();
        } catch (err) {
            console.log(err);
        }
    }

    async function joinRoom() {
        try {
            // if auth, join room
            if (auth.isAuthenticated()){
                let occurrenceDate = roomState.isRepeat ? "/" + moment(roomState.startTime).utc().format("MMDDYY") : "";
                await axios.put(Constants.APIURL + "/api/rooms/" + roomState._id.toString() + "/join" + occurrenceDate, null, headerOptions);
                window.location.reload();
                closeRoomDetail();
            }
            //else open login/signup
            else {
                history.push("/signup");
            }
        } catch (err) {
            console.log(err);
        }
    }

    async function inviteMember(e: any, inviteeID: string, inviteeName: string) {
        try {
            e.target.innerHTML = "Invited";
            e.target.disabled = true;
            await axios.get(Constants.APIURL + "/api/rooms/" + roomState._id.toString() + "/" + moment(roomState.startTime).format("MMDDYY") + "/invite/" + inviteeID, headerOptions);
            toast.notify(inviteeName + ' invited', {duration: 1000});
        } catch (err) {
            console.log(err);
        }
    }

    async function addFriend(e: any, inviteeID: string, inviteeName: string) {
        try {
            e.target.disabled = true;
            await axios.put(Constants.APIURL + "/api/gamer/friends/add/" + inviteeID, headerOptions);
            toast.notify(inviteeName + ' added as friend', {duration: 1000});
        } catch (err) {
            console.log(err);
        }
    }

    async function getCandidates() {
        let response: any = await axios.get(Constants.APIURL + "/api/rooms/" + roomState._id.toString() + "/" + moment(roomState.startTime).format("MMDDYY") + "/candidates", headerOptions);
        setCandidates(response.data);
    }

    async function getPlayerGamerTags(roomId: string, platform: string) {
        let response: any = await axios.get(Constants.APIURL + "/anon/rooms/" + roomId + "/platforms/" + platform, headerOptions);
        console.log(response.data);
        setPlayerGamerTags(response.data);
    }

    function isAvail(availCalc: any, indicator: number) {
        if (availCalc[indicator.toString()])
            return "availS-line";
        else
            return "base-line";
    }

    function isFriend(playerId: string) {
        return userFriends.find(friend => friend._id === playerId) ? true : false;
    }

    function copyLink(id: string) {
        const copyText = document.getElementById(id) as HTMLInputElement;
        copyText.select();
        copyText.setSelectionRange(0, 99999); /*For mobile devices*/
        document.execCommand("copy");
        toast.notify('Link copied to clipboard!', {duration: 1000});
    }

    function getInvites() {
        try {
            let html: JSX.Element[] = [];
            candidates.forEach((invitee: any) => {
                /*           build availability timeline          */
                let timeInc = -1; //Start 1hr before room time, add 30 minutes each time 5 times for availability display
                let timeIndicators: JSX.Element[] = [];

                //startTimeInc30 but 1 hour earlier
                for (timeInc; timeInc < 4; timeInc++)
                    timeIndicators.push(
                        <span className="time-indicator">
                            {moment(roomState.startTime).add(timeInc, "hours").format("h:mm")}
                        </span>
                    );
                let availCalcs: JSX.Element[] = [];
                for (let i = 0; i < 10; i++)
                    availCalcs.push(
                        <span className={isAvail(invitee.availCalc, i)} />
                    );
                //INVITE
                html.push(
                    <div key={invitee._id} className="invitee">
                        <div className="inviteDetails">
                            <div className="inviteUser">
                                <img
                                    src={invitee.avatarIcon}
                                    className={
                                        invitee.isFriend
                                            ? "friendIcon"
                                            : invitee.isOrg
                                                ? "orgIcon"
                                                : "pubIcon"
                                    }
                                />
                                <p className="inviteName">{invitee.username}</p>
                            </div>
                            <button
                                className="inviteButton"
                                id={"inviteeButton" + invitee._id}
                                onClick={(e) => inviteMember(e, invitee._id, invitee.username)}
                            >
                                Invite
                            </button>
                        </div>
                        <div className="availabilityTimeline">
                            <div className={"time-indicators"}>{timeIndicators}</div>
                            <div className={"lines"}>{availCalcs}</div>
                        </div>
                        <br />
                    </div>
                );
            });
            return html;
        } catch (err) {
            console.log(err);
        }
    }

    async function writeComment(message: string) {
        let payload: any = {
            comment: message,
            startTime: moment().toDate(),
        };
        try {
            let occurrenceDate = roomState.isRepeat ? "/" + moment(roomState.startTime).utc().format("MMDDYY") : "";
            await axios.put(Constants.APIURL + "/api/rooms/" + roomState._id.toString() + "/comment" + occurrenceDate, payload, headerOptions)
                .then((res) => setComments(res.data.comments));
        } catch (err) {
            console.log(err, "message error");
        }
    }

    function getComments() {
        var html: JSX.Element[] = [];
        for (let i = 0; i < comments.length; i++) {
            const comment = comments[i];
            html.push(
                <div className="indv_comment">
                    <span className="msg_user">{comment.username}</span>
                    <span className="comment_time">
                        {moment(comment.ts).format("MMMM Do h:mm a")}
                    </span>
                    <br />
                    {comment.comment}
                </div>
            );
        }
        return html;
    }

    async function getUserProfile() {
        let userURL = Constants.APIURL + "/api/gamer";
        const response = await axios.get(userURL, headerOptions);
        console.log("response user data", response.data);
        setUserGames(response.data.games);
        setUserFriends(response.data.friends);
        setUserNetworks(response.data.orgs);
    }

	// **************** BEGIN UseEffect Section ****************

    useEffect(() => {
        document.querySelector("body").style.overflowY = "hidden";
    }, [])

    useEffect(() => {
        if (!auth.isAuthenticated())
            return;
            
        getUserProfile();

        if (!isEditable) 
            getCandidates();

    }, [isEditable, comments]);

    useEffect(() => {

        if (!isEditable) 
            getPlayerGamerTags(roomState._id, roomState.platformId);

    }, [isEditable]);

	// **************** END UseEffect Section ****************

    function getPlayerAlias(gamerId: string) {
        if (playerGamerTags && playerGamerTags.players) {
            const entry = playerGamerTags.players.find((p: any) => p.gamerId === gamerId)
            if (entry && entry.alias) {
                const imgSrc = getPlatformImage(playerGamerTags.platform);
                return (
                    <>
                    |&nbsp;&nbsp;
                    {imgSrc &&
                        <img src={imgSrc} className="platformIcon" />
                    }
                    {playerGamerTags.url &&
                        <a href={playerGamerTags.url + entry.alias} target="_blank">{entry.alias}</a>
                    }
                    {!playerGamerTags.url &&
                        entry.alias
                    }
                    </>
                );
            } 
        }
        return null;
    }

    function getPlatformImage(platform: string) {
        switch (platform) {
            case "steam":
                return steamImg;
            case "epic":
                return epicImg;
            case "origin":
                return originImg;
            case "uplay":
                return uplayImg;
            case "bnet":
                return bnetImg;
            case "gog":
                return gogImg;
            case "xbl":
                return xblImg;
            case "psn":
                return psnImg;
            case "wiiu":
            case "switch":
                return nintendoImg;
            default:
                return steamImg;
        }
    }

    function formatStartTime(startTime: Date, timezone: string, room: IRoom) {
        if (!room.isRepeat) {
            return moment.tz(startTime, timezone).format("MMM D YYYY, h:mma");
        } else {
            return formatStartTimeSeries(startTime, timezone, room.repeatConfig);
        }
    }

    function formatStartTimeSeries(startTime: Date, timezone: string, repeatConfig: any) {

        let result = "";
        let localDay: any;
        result = moment.tz(startTime, "utc").tz(timezone).format("MMM D YYYY, h:mma");
        result += " (every ";
        repeatConfig.occursOnDays.forEach((occursOn: number) => {
            localDay = moment.tz(startTime, timezone).day(occursOn).format("ddd");
            result += localDay + ", ";
        });

        //remove trailing comma
        result = result.substring(0, result.length - 2);
        if (repeatConfig.endsOn) {
            result += " till " + moment.tz(repeatConfig.endsOn, timezone).format("MMM D");
        }
        result += ")";
        return result;
    }

    function handleRepeat() {
        //repeat is being turned on
        if (!roomState.isRepeat) {
            dispatch({type: "repeatConfig", field: "isRepeat", value: true});
        }
        //repeat is being turned off
        else {
            dispatch({type: "repeatConfig", field: "isRepeat", value: false});
        }
    }

    return (
        <Modal
            isOpen={!!roomState}
            toggle={() => closeRoomDetail()}
            size="xl"
            zIndex="2000"
            className={cn("roomModal", { small: isEditable })}
        >
            <ModalHeader className="roomHeader">
                <div className="roomHeader-header">
                    <div className="roomHeader-imageAndDesc">
                        <div className="roomHeader-image">
                            {gameLookup && (
                                <div className={"game-icon-container"}>
                                    <img className="gameIcon" src={gameLookup.iconLg} />
                                </div>
                            )}
                            {/* {!props.game && (
                <div className={"game-icon-container addNewGameTrigger"}>
                  <img src={plusImg} alt="" />
                </div>
              )} */}
                        </div>

                        <div className="roomHeader-desc">
                            <div className="gameName">
                                {isEditable &&
                                    <Dropdown className="no-arrow">
                                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                                            {(gameLookup && gameLookup.name) || "Select Game"}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {userGames.map((game) => {
                                                return (
                                                    <Dropdown.Item onClick={() => {
                                                        newRoom.game = game.gameId;
                                                        setGameLookup(game);
                                                    }}>
                                                        {game.name}
                                                    </Dropdown.Item>
                                                );
                                            })}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                }
                                {!isEditable && gameLookup &&
                                    gameLookup.name
                                }
                            </div>

                            <div className="platform">
                                {isEditable && gameLookup &&
                                    <Dropdown className="no-arrow">
                                        <Dropdown.Toggle variant="success" id="dropdown-platform">
                                            {platformId || "Select Platform"}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {gameLookup.platforms.map((platform) => {
                                                if (platform === "win") {
                                                    return (
                                                        <>
                                                        <Dropdown.Item disabled>windows/mac</Dropdown.Item>
                                                        <Dropdown.Divider/>
                                                        {['steam', 'epic', 'other'].map((winPlatform) => {
                                                            return (
                                                            <Dropdown.Item onClick={() => {
                                                                newRoom.platformId = winPlatform;
                                                                setPlatformId(winPlatform);
                                                            }}>
                                                            • {winPlatform}
                                                            </Dropdown.Item>
                                                        );})}
                                                        <Dropdown.Divider/>
                                                        </>
                                                              
                                                    );
                                                }
                                                else {
                                                    return (
                                                        <Dropdown.Item onClick={() => {
                                                            newRoom.platformId = platform;
                                                            setPlatformId(platform);
                                                        }}>
                                                            {platform}
                                                        </Dropdown.Item>
                                                    );
                                                }
                                            })}

                                        </Dropdown.Menu>
                                    </Dropdown>
                                }
                                {!isEditable && gameLookup &&
                                    roomState.platformId
                                }
                            </div>
                            {!isEditable &&
                                <div className="time">
                                    {formatStartTime(roomState.startTime, timezone, roomState)}
                                </div>
                            }
                        </div>
                    </div>

                    <div className="close-button-container">
                        <div onClick={() => closeRoomDetail()} className="close">
                            <img src={closeImg} alt="close" />
                        </div>
                    </div>

                    <div className="roomActionWrap">
                        <ButtonGroup vertical>

                            {//if creating a new room
                                roomState && !roomState._id ? (
                                    <div>
                                        <Button color="primary"
                                            className="roomActionButton"
                                            onClick={() => saveRoom()} >
                                            Create
                                        </Button>
                                    </div>
                                ) : (
                                        //if editing an existing room
                                        isOwner && isEditable ? (
                                            <div>
                                                <Button color="warning"
                                                    className="roomActionButton"
                                                    onClick={() => setEditable(false)} >
                                                    Cancel
                                                </Button>
                                                <Button color="primary"
                                                    className="roomActionButton"
                                                    onClick={() => saveRoom()} >
                                                    Save
                                                </Button>
                                            </div>
                                        ) : (
                                                //if viewing (not editing) an existing room:
                                                isOwner && !isEditable && roomState && roomState._id ? (
                                                    <div>
                                                        <Button color="primary"
                                                            className="roomActionButton"
                                                            onClick={() => setEditable(true)} >
                                                            Edit
                                                        </Button>
                                                        {//if last player/owner of room, delete
                                                            roomState.players.length === 1 &&
                                                            <Button color="danger"
                                                                className="roomActionButton leaveButton"
                                                                onClick={() => deleteRoom()} >
                                                                Delete
                                                            </Button>
                                                        }
                                                        {roomState.players.length > 1 &&
                                                            <Button color="danger"
                                                                className="roomActionButton leaveButton"
                                                                onClick={() => leaveRoom()} >
                                                                Leave
                                                            </Button>
                                                        }
                                                    </div>
                                                ) : (
                                                        //if not already a player in this room
                                                        isPlayer ? (
                                                            <Button color="danger"
                                                                className="roomActionButton"
                                                                onClick={() => leaveRoom()}
                                                                style={{ marginRight: 24 }} >
                                                                Leave
                                                            </Button>
                                                        ) : (
                                                            //if not a player of the room:
                                                            <Button color="primary"
                                                                className="roomActionButton"
                                                                onClick={() => joinRoom()} >
                                                                Join
                                                            </Button>
                                                            )
                                                    ))
                                    )}

                        </ButtonGroup>
                    </div>
                </div>
            </ModalHeader>
            <ModalBody className={"room-body"}>
                {isEditable ? (
                    <div>
                        <Form id="editRoom" onSubmit={saveRoom}>
                            <FormGroup>
                                <div className="timeField">
                                    {!roomState.isRepeat &&
                                    <DatePicker
                                        className="border-input date"
                                        selected={moment(roomState.startTime).toDate()}
                                        onChange={(date) => onChangeDate("startTime", date)}
                                        placeholderText="Date"
                                    />
                                    }
                                    <Input
                                        type="button"
                                        className="border-input time"
                                        defaultValue={moment(roomState.startTime).format("h")}
                                        // min={1} max={12}
                                        onClick={changeHours}
                                    />
                                    <p>:</p>
                                    <Input
                                        type="button"
                                        className="border-input time"
                                        defaultValue={moment(roomState.startTime).format("mm")}
                                        onClick={changeMinutes}
                                    />
                                    <Input type="button" id="isAm" className="border-input time"
                                        defaultValue={moment(roomState.startTime).hours() < 12 ? "AM" : "PM"} onClick={changeIsAm}/>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleRepeat();
                                        }}
                                        className={"button_time-repeat"}
                                    >
                                        <img src={repeatImg} alt="repeat" />
                                        <p>Repeat</p>
                                    </button>
                                </div>

                                {roomState.isRepeat &&
                                    <div>
                                        <div className="repeatable">

                                            {daysOfWeek.map((day, index) => {
                                                return (

                                                    <FormCheck inline custom
                                                        checked={roomState.repeatConfig && roomState.repeatConfig.occursOnDays.includes(index)}
                                                        type="checkbox"
                                                        label={day}
                                                        id={day}
                                                        onClick={(e: any) => onChangeRepeatConfigOccursOnDays(`occursOnDays${index}`, e.target.checked)}
                                                    />
                                                )
                                            })}
                                        </div>
                                        <div className="roomTimepicker">
                                            <DatePicker
                                                selected={(roomState.repeatConfig && roomState.repeatConfig.startsOn && moment(roomState.repeatConfig.startsOn).toDate())}
                                                onChange={(date) => onChangeRepeatConfigDate("startsOn", date)}
                                                placeholderText="starting from"
                                            />
                                        </div>
                                        <div className="roomTimepicker">
                                            <DatePicker
                                                selected={roomState.repeatConfig && roomState.repeatConfig.endsOn && moment(roomState.repeatConfig.endsOn).toDate()}
                                                onChange={(date) => onChangeRepeatConfigDate("endsOn", date)}
                                                placeholderText="until"
                                            />
                                        </div>
                                    </div>
                                }
                            </FormGroup>
                            <FormGroup>
                                <Input
                                    type="text"
                                    name="gameMode"
                                    placeholder="Game mode"
                                    className="border-input"
                                    defaultValue={roomState.gameMode}
                                    onChange={onChange}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Input
                                    type="textarea"
                                    name="description"
                                    placeholder="Description"
                                    className="border-input"
                                    defaultValue={roomState.description}
                                    onChange={onChange}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Input
                                    type="text"
                                    name="joinServer"
                                    placeholder="Server / Discord url "
                                    className="border-input"
                                    defaultValue={roomState.joinServer}
                                    onChange={onChange}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Form.Control name="org" as="select" onChange={onChange} value={roomState.org}>
                                    <option value="">No group affiliation</option>
                                    {userNetworks.map((item) => {
                                        return (
                                            <option value={item._id}>{item.name}</option>
                                        );
                                    })}
                                </Form.Control>
                            </FormGroup>
                            <FormGroup>
                                <Form.Control name="privacyLevel" as="select" onChange={onChange} value={roomState.privacyLevel.toString()}>
                                    <option value={4}>Friends and Groups only</option>
                                    <option value={5}>Public</option>
                                </Form.Control>
                            </FormGroup>
                            <FormGroup className={"maxPlayers-container"} style={{ marginBottom: 0 }} >
                                <input
                                    type="number"
                                    name="maxPlayers"
                                    className="border-input"
                                    defaultValue={roomState.maxPlayers}
                                    onChange={onChange}
                                />
                                <label htmlFor="maxPlayers">Players</label>
                            </FormGroup>
                        </Form>
                    </div>
                ) : (
                        <div>
                            <div className="roomModalInfo__container ">
                                <div className="roomModalInfo">
                                    <div className="title">Game mode:</div>
                                    <div className="value">{roomState.gameMode}</div>

                                    {roomState.description && (
                                        <>
                                            <div className="title">Description:</div>
                                            <div className="value">{roomState.description}</div>
                                        </>
                                    )}
                                    {roomState.orgName && (
                                        <>
                                            <div className="title">Group:</div>
                                            <div className="value">
                                                <a href="#" onClick={() => { closeRoomDetail(); history.push("/groups/" + roomState.org); }}>{roomState.orgName}</a>
                                            </div>
                                        </>
                                    )}
                                    {roomState.joinServer && (
                                        <>
                                            <div className="title">Discord link:</div>
                                            <div className="link-input">
                                                <div className="link-icon" onClick={() => copyLink("joinServer-input")}>
                                                    <FiLink style={{ color: "#737979", fontSize: 18 }} />
                                                </div>
                                                <div className="link-input-field">
                                                    <input id="joinServer-input" value={roomState.joinServer} />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div className="tourDeepLink">
                                        <div className="title">Share this link!
                                            <span className="deep-link-select"> [ <a href="#" className={linkMode === 0 ? "active-deep-link" : ""} onClick={() => setLinkMode(0)}>url only</a></span> | 
                                            <span className="deep-link-select"> <a href="#" className={linkMode === 1 ? "active-deep-link" : ""} onClick={() => setLinkMode(1)}>url + image</a> ]</span>
                                        </div>
                                        {linkMode === 0 &&
                                        <div className="link-input">
                                            <div className="link-icon" onClick={() => copyLink("share-link")}>
                                                <FiLink style={{ color: "#737979", fontSize: 18 }} />
                                            </div>
                                            <div className="link-input-field">
                                                {!roomState.isRepeat &&
                                                    <input id="share-link" value={`${Constants.SITEURL}/#/rooms/${roomState._id}`} />
                                                }
                                                {roomState.isRepeat &&
                                                    <input id="share-link" value={`${Constants.SITEURL}/#/rooms/${roomState._id}/series/${moment(roomState.startTime).utc().format('MMDDYY')}`} />
                                                }
                                            </div>
                                        </div>
                                        }
                                        {linkMode === 1 &&
                                        <div className="link-input">
                                            <div className="link-icon" onClick={() => copyLink("share-link-img")}>
                                                <FiLink style={{ color: "#737979", fontSize: 18 }} />
                                            </div>
                                            <div className="link-input-field">
                                                <input id="share-link-img" value={`<a href='${Constants.SITEURL}/#/rooms/${roomState._id}'><img src='http://${Constants.SITEURL_CLOUDFRONT}/${roomState.hostUsername}/${roomState._id}.jpg' /></a>`} />
                                            </div>
                                        </div>
                                        }
                                    </div>
                                </div>
                                <div className="roomModalInfo">
                                    <div className="players-container">
                                        <dt>
                                        {" "} Players ({roomState.players.length}/{roomState.maxPlayers}){" "}
                                        </dt>
                                        <div className="player__item-container">
                                            {roomState.players.map((player: any) => (
                                                <>
                                                <div key={player.gamer} className="player__item">
                                                    <div>
                                                        {player.avatarIcon && (
                                                            <img src={player.avatarIcon} className="playerIcon" />
                                                        )}
                                                        {!player.avatarIcon && (
                                                            <MdAccountCircle className="playerIcon" />
                                                        )}

                                                        {player.gamer === roomState.host && <CrownSVG />}
                                                        {player.username} {getPlayerAlias(player.gamer)}
                                                    </div>

                                                    <div>
                                                        {userId != player.gamer && !isFriend(player.gamer) &&
                                                        <Button
                                                            color="primary"
                                                            className="roomActionButton"
                                                            onClick={(e: any) => addFriend(e, player.gamer, player.username)}
                                                            style={{ marginRight: 24 }}
                                                        >
                                                        + Friend
                                                        </Button>
                                                        }
                                                        { //show platform button if this user is also the player
                                                        userId == player.gamer &&
                                                        <FontAwesomeIcon icon={faCog} size="lg" onClick={(e: any) => setShowPlatform(true)} className="roomActionIcon"/>
                                                        }
                                                    </div>
                                                </div>
                                                { //show platform button if this user is also the player
                                                    showPlatform && userId == player.gamer &&
                                                        <Platforms handleClose={showHidePlatform}/>
                                                }
                                                </>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="players-invite-container">
                                        <p>Invite</p>
                                        <div className="players-invite">
                                            {getInvites()}
                                        </div>

                                    </div>

                                </div>
                                <div className="roomModalInfo">
                                    <div className="comment-container">
                                        <dt>Message Board</dt>
                                        <div className="comments">
                                            {getComments()}
                                        </div>
                                        <div className="CommentSection">
                                            <form
                                                className="CommentField"
                                                onSubmit={formik.handleSubmit}
                                            >
                                                <input
                                                    type="text"
                                                    id="message"
                                                    placeholder="Message here"
                                                    onChange={formik.handleChange}
                                                    value={formik.values.message}
                                                />
                                                <input id="comment_submit" type="submit" value="submit" />
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
            </ModalBody>

        </Modal>
    );
}

export default Room;
