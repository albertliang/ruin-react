import React, { useState, useEffect } from "react";
import { MdAccountCircle } from "react-icons/md";
import { IGroup } from "../../models/group.model";
import { IGame } from "../../models/game.model";
import * as Constants from "../../constants";
import moment, { tz } from "moment-timezone";
import { useStoreActions } from "../../store/hooks";
import axios from "axios";
import { authenticationService as auth } from "../../services/authentication.service";
import { Button, Modal, ModalHeader, ModalBody, FormGroup, Input, Popover, PopoverBody, PopoverHeader, CardHeader, CardBody, Card, Badge, Row, Col } from "reactstrap";
import { FiLink } from "react-icons/fi";
import closeImg from "../../assets/img/close.svg";
import cn from "classnames";
import toast from 'toasted-notes' 
import 'toasted-notes/src/styles.css';
import "react-datepicker/dist/react-datepicker.css";
import "./GroupDetails.css";
import Plus from '../../assets/img/Plus.svg';

import { ButtonGroup, Collapse, Form, FormCheck } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import _ from "lodash";
import { apiService } from "../../services/api.service";
import { IGamer } from "../../models/gamer.model";
import { useFormik } from "formik";
import { Link } from "@material-ui/core";
import { couldStartTrivia } from "typescript";

// INTERFACES ***********
interface IAvailMembers {
    gamers: Record<string, any>;
    timeslots: Record<string, any>[];
}

interface IGroupProps {
    groupId: string;
    closeGroup: () => void;
}

function GroupDetails(props: IGroupProps) {

    const userId = auth.getUserId();
    const username = auth.getUsername();
    const headerOptions = auth.getHeaderOptions();
    const isAuth = auth.isAuthenticated();

    const initGroup: any = {
        name: "",
        description: "",
        isOpen: true,
        admins: [],
        members: [],
        games: []
    }

    const [groupState, setGroupState] = useState<IGroup>(initGroup);
    const [gamerProfile, setGamerProfile] = useState<IGamer>();
    const [forceRefresh, setForceRefresh] = useState(false);
    const [showGameSearch, setShowGameSearch] = useState(false);
    const [showSection, setShowSection] = useState(2);
    
	const [gamesLookup, setGamesLookup] = useState<IGame[]>(null);
    const [availMembers, setAvailMembers] = useState<IAvailMembers>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isMember, setIsMember] = useState(false);
    const [isEditable, setEditable] = useState(!props.groupId);
    const [isReloadOnClose, setIsReloadOnClose] = useState(false);
    const [filterGameId, setFilterGameId] = useState(null);
    const [filterGameName, setFilterGameName] = useState(null);
    const [maxAvail, setMaxAvail] = useState(0);
    const [comments, setComments] = useState(null);
    const [dayInc, setDayInc] = useState(null);
    const [timeInc, setTimeInc] = useState(null);

	const openRoom = useStoreActions(actions => actions.openRoom);

    const history = useHistory();

    // FUNCTIONS ***********

    const closeGroupDetail = () => {
        document.querySelector("body").style.overflowY = "auto";
        if (isReloadOnClose) {
            window.location.reload();
        }
        props.closeGroup();
    }

    async function saveGroup() {

        // if auth, join Group
        if (auth.isAuthenticated()){

            let newGroup: any;
            if (groupState._id) {
                newGroup = await axios.put(Constants.APIURL + "/api/orgs/" + groupState._id.toString(), groupState, headerOptions);
            } else {
                newGroup = await axios.post(Constants.APIURL + "/api/orgs", groupState, headerOptions);
            }

            if (newGroup && newGroup.data && newGroup.data._id) {
                setGroupState({...groupState, _id: newGroup.data._id});
            }

            setIsReloadOnClose(true);
            setEditable(false);
        }
        //else open login/signup
        else {
            history.push("/signup");
        }
    }

    async function getGroup(groupId: string) {
        try {
            let group = await axios.get(Constants.APIURL + "/anon/orgs/" + groupId, headerOptions);
            setGroupState(group.data);
            setComments(group.data.comments);
        } catch (err) {
            console.log(err);
        }
    }

    async function getGamer() {
        try {
            // let gamer = await apiService.getGamer();
            let gamer = await axios.get(Constants.APIURL + "/api/gamer", headerOptions);
            setGamerProfile(gamer.data);
        } catch (err) {
            console.log(err);
        }
    }

    async function getAvailMembers(groupId: string, gameId: string) {
        let response: any;

        if (auth.isAuthenticated()) {
            response = await axios.get(Constants.APIURL + "/api/orgs/" + groupId + "/candidates/games/" + gameId, headerOptions);
        } else {
            response = await axios.get(Constants.APIURL + "/anon/orgs/" + groupId + "/candidates/games/" + gameId + "?timezone=" + auth.getUserTimezone(), headerOptions);
        }

        setAvailMembers(response.data);
    }

    async function joinGroup(groupId: string) {
        try {
            // if auth, join Group
            if (auth.isAuthenticated()){
                if (groupState.isOpen)
                    await axios.put(Constants.APIURL + "/api/orgs/" + groupId + "/join", null, headerOptions);
                else
                    await axios.put(Constants.APIURL + "/api/orgs/" + groupId + "/request", null, headerOptions);

                setForceRefresh(!forceRefresh);
            }
            //else open login/signup
            else {
                history.push(`/signup?redirectToGroup=${groupId}`);
            }
        } catch (err) {
            console.log(err);
        }
    }

    async function deleteGroup(groupId: string) {
        try {
            await axios.delete(Constants.APIURL + "/api/orgs/" + groupId, headerOptions);
            window.location.reload();
            props.closeGroup();
        } catch (err) {
            console.log(err);
        }
    }

    async function leaveGroup(groupId: string) {
        try {
            await axios.put(Constants.APIURL + "/api/orgs/" + groupId + "/leave", null, headerOptions);
            window.location.reload();
            closeGroupDetail();
        } catch (err) {
            console.log(err);
        }
    }

    async function searchGames(searchTerm: string) {
        try {
            const searchResults = await axios.get(Constants.APIURL + "/api/games/search/" + searchTerm, headerOptions);
            setGamesLookup(searchResults.data);
        } catch (err) {
            console.log(err);
        }
    }

            
    async function addGame(groupId: string, gameId: string) {
        try {
            await axios.post(Constants.APIURL + "/api/orgs/" + groupId + "/games/" + gameId, null, headerOptions);
            setGamesLookup(null);
            setShowGameSearch(false);
            setForceRefresh(!forceRefresh);
        } catch (err) {
            console.log(err);
        }
    }

    async function deleteGame(groupId: string, gameId: string) {
        try {
            await axios.delete(Constants.APIURL + "/api/orgs/" + groupId + "/games/" + gameId, headerOptions);

            // remove game from games list and default avails to all members
            let currGames = groupState.games;
            _.remove(currGames, (game) => game._id == gameId);
            setGroupState({ ...groupState, games: currGames});

            if (filterGameId === gameId) {
                setFilterGameId(null);
                setFilterGameName(null);
            }
        } catch (err) {
            console.log(err);
        }
    }

    async function addGamerGame(gameId: string) {
        try {
            await apiService.addGamerGame(gameId);
            let newGames: any = gamerProfile.games;
            newGames.push({_id: gameId});

            setGamerProfile({...gamerProfile, games: newGames})
            setForceRefresh(!forceRefresh);
            toast.notify('Game added to your library', {duration: 2000});
        } catch (err) {
            console.log(err);
        }
    }
    
    async function addGamerAvail() {
        history.push("/availability");
    }

    const formik = useFormik({
        initialValues: {
            message: "",
        },
        onSubmit: (values) => {
            writeComment(values.message);
            values.message = "";
        },
    });
    
    async function writeComment(message: string) {
        let payload: any = {
            comment: message,
            startTime: moment().toDate(),
        };
        try {
            await axios.put(Constants.APIURL + "/api/orgs/" + groupState._id.toString() + "/comment", payload, headerOptions)
                .then((res) => setComments(res.data.comments));
        } catch (err) {
            console.log(err, "message error");
        }
    }

    function getComments() {
        var html: JSX.Element[] = [];
        
        if (comments) {

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
    }

    function copyLink(id: string) {
        const copyText = document.getElementById(id) as HTMLInputElement;
        copyText.select();
        copyText.setSelectionRange(0, 99999); /*For mobile devices*/
        document.execCommand("copy");
        toast.notify('Link copied to clipboard!', {duration: 2000});
    }

	// **************** BEGIN UseEffect Section ****************

    useEffect(() => {
        document.querySelector("body").style.overflowY = "hidden";
    }, [])

    useEffect(() => {
        getGroup((groupState && groupState._id) || props.groupId);
    }, [isEditable, forceRefresh]);

    useEffect(() => {
        if (auth.isAuthenticated())
            getGamer();
    }, []);

    useEffect(() => {

        if (groupState) {
            setIsAdmin(groupState.admins && groupState.admins.findIndex(a => a._id.toString() === userId) >= 0 ? true : false);
            setIsMember(groupState.members && groupState.members.findIndex(a => a._id.toString() === userId) >= 0 ? true : false);

            // default filtered game if there are any
            // if (filterGameId === null && groupState.games && groupState.games.length > 0) {
            //     setFilterGameId(groupState.games[0]._id);
            // }

            if (groupState.members && groupState._id) {
                getAvailMembers(groupState._id, "");
            }
        }
    }, [groupState]);

    useEffect(() => {
        // get avail members for chosen game
        if (filterGameId != null) {
            if (groupState.members && groupState.members.length > 1 && 
                groupState.games && groupState.games.length > 0) {

                getAvailMembers(groupState._id, filterGameId);
            }
        } else if (groupState.members && groupState._id) {
            getAvailMembers(groupState._id, "");
        }
    }, [filterGameId]);

    function GenerateBoxes() {
        const times = ['12am', '', '1am', '', '2am', '', '3am', '', '4am', '', '5am', '', '6am', '', '7am', '', '8am', '', '9am', '', '10am', '', '11am', '', '12pm', '', '1pm', '', '2pm', '', '3pm', '', '4pm', '', '5pm', '', '6pm', '', '7pm', '', '8pm', '', '9pm', '', '10pm', '', '11pm', ''];
        const items = [];

        for (let i = 0; i < 48; i++) {
            items.push(GridRow(times[i], i));
        }
        return items;
    }

    //returns  [HH:MM aa, | Box 1, ......, Box 7 ]
    function GridRow(time: string, timeInc: number) { 
        let row: JSX.Element[] = [<th key={timeInc}>{time}</th>];
        let tempMax = 0;
        for (let dayInc = 0; dayInc < 7; dayInc++) {
            const numMembers = GridAvailMembers(dayInc, timeInc.toString());
            if (numMembers > tempMax) { tempMax = numMembers; }

            row.push(
                <td key={`${dayInc}/${timeInc}`}>
                    <button 
                        onClick={() => createRoom(dayInc, timeInc)}
                        onMouseOver={() => {
                            setDayInc(dayInc); 
                            setTimeInc(timeInc);
                        }}
                        onMouseLeave={() => {setDayInc(null); setTimeInc(null);}}
                        style={GridHeatMapColor(numMembers, maxAvail)}
                        id={`${dayInc*48 + timeInc}`}
                    >
                        {numMembers}
                    </button>
                </td>
            );
        }
 
        if (tempMax > maxAvail) {
            setMaxAvail(tempMax);
        }
        return (<tr key={timeInc}>{row}</tr>);
    }

    function GridAvailMembers(dayInc: number, timeInc: string) {
        if (availMembers && availMembers.timeslots) {
            let members = availMembers.timeslots[dayInc][timeInc];
            if (members && members.org)
                return members.org.length;
        }
        return '';
    }

    function GridHeatMapColor(availMembers: number, maxAvailMembers: number) {
        const fraction = availMembers / maxAvailMembers;

        if (fraction < .2) {
            return { color: "white", backgroundColor: "#00008b"}; //dk blue
        } else if (fraction < .4) {
            return { color: "white", backgroundColor: "#400068"}; //purple
        } else if (fraction < .6) {
            return { color: "white", backgroundColor: "#800045"}; //dk red
        } else if (fraction < .8) {
            return { color: "white", backgroundColor: "#bf0023"}; //red
        } else if (fraction >= .8) {
            return { color: "white", backgroundColor: "#ff0000"}; //br red
        }
    }

    // function GetPlayerHtml(player: any) {
    //     let row: JSX.Element[] = [<th key={timeInc}>{time}</th>];

    //     <div key={player.gamer} className="player__item">
    //                     <div>
    //                         {player.avatarIcon && (
    //                             <img src={player.avatarIcon} className="playerIcon" />
    //                         )}
    //                         {!player.avatarIcon && (
    //                             <MdAccountCircle className="playerIcon" />
    //                         )}
    //                         {player.username}
    //                     </div>
    //                 </div>
    // }

    // for the given timeslot highlighted, show who's available
    function ShowAvailMembers(dayInc: number, timeInc: number) {
        if (!dayInc) {
            return;
        }

        let html: JSX.Element[] = [];
        let members = availMembers.timeslots[dayInc][timeInc];
        if (members && members.org)
        {
            members.org.forEach((gamerId: string) => {
                if (availMembers.gamers && availMembers.gamers[gamerId]) {
                    var player = availMembers.gamers[gamerId];
                    html.push(
                        <div key={player.gamer} className="player__item">
                            <div>
                                {player.avatarIcon && (
                                    <img src={player.avatarIcon} className="playerIcon" />
                                )}
                                {!player.avatarIcon && (
                                    <MdAccountCircle className="playerIcon" />
                                )}
                                {player.username}
                            </div>
                        </div>
                    );
                }
            })
            return <Card id="availMembersCard"><CardBody>{html}</CardBody></Card>;
        }
        return;
    }

    function createRoom(dayInc: number, timeInc: number){

        //guess a startTime
        let startTime = moment().day(dayInc).hours(timeInc/2).minutes(30 * (timeInc%2)).seconds(0);
        if (startTime < moment()) {
            startTime.add(7, 'day');
        }
 
        const roomInfo: any = {
            game: filterGameId,
            host: userId,
            description: "",
            hostUsername: username,
            hostTimezone: auth.getUserTimezone(),
            comments: [],
            privacyLevel: 5,
            startTime: startTime.toDate(),
            maxPlayers: 4,
            gameMode: "Let's Play!",
            isRepeat: false,
            roomCategory: "user",
            org: groupState._id,
            players: []
        }
        openRoom(roomInfo);
    }

    function toggleGameSearch() {
        setGamesLookup(null);
        setShowGameSearch(!showGameSearch);
    }

    function displayGameSearchResults() {
        let html: any[] = [];
        if (gamesLookup) {
            gamesLookup.forEach(game => {
                html.push(<img src={game.iconSm} onClick={() => {addGame(groupState._id, game.gameId);}}/>);
            });
        }
        return html;
    }
 
    return (
        <Modal
            isOpen={!!groupState}
            toggle={() => closeGroupDetail()}
            size="xl"
            className={cn("GroupModal", { small: isEditable })}
        >
            <div className="tourGroupDemo">
            <ModalHeader className="groupHeader">
                <div className="groupHeader-header">
                    <div className="groupHeader-imageAndDesc">
                        {/* <div className="groupHeader-desc"> */}
                            <div className="titleName">
                                {groupState.name}
                            </div>
                            {groupState.description && 
                            <div className="platform">
                                {groupState.description}
                            </div>
                            }
                            {groupState.url &&
                            <div className="platform">
                                <a href={groupState.url} target="_blank">{groupState.url}</a>
                            </div>
                            }
                            {groupState._id &&
                            <div className="link-input">
                                <div className="link-icon" onClick={() => copyLink("share-link")}>
                                    <FiLink style={{ color: "#737979", fontSize: 18 }} />
                                </div>
                                <div className="link-input-field-group">
                                    <input id="share-link" value={`${Constants.SITEURL}/#/groups/${groupState._id}`} />
                                </div>
                            </div>
                            }
                        {/* </div> */}
                    </div>
                    <div className="close-button-container">
                        <div onClick={() => closeGroupDetail()} className="close">
                            <img src={closeImg} alt="close" />
                        </div>
                    </div>

                    <div className="groupActionWrap">
                        <ButtonGroup>

                            {//if creating a new Group
                                groupState && !groupState._id ? (
                                    <div>
                                        <Button color="primary"
                                            className="groupActionButton"
                                            onClick={() => saveGroup()} >
                                            Create
                                        </Button>
                                    </div>
                                ) : (
                                        //if editing an existing Group
                                        isAdmin && isEditable ? (
                                            <div>
                                                <Button color="warning"
                                                    className="groupActionButton"
                                                    onClick={() => setEditable(false)} >
                                                    Cancel
                                                </Button>&nbsp;
                                                <Button color="primary"
                                                    className="groupActionButton"
                                                    onClick={() => saveGroup()} >
                                                    Save
                                                </Button>
                                            </div>
                                        ) : (
                                                //if viewing (not editing) an existing Group:
                                                isAdmin && !isEditable && groupState && groupState._id ? (
                                                    <div>
                                                        <Button color="primary"
                                                            className="groupActionButton"
                                                            onClick={() => setEditable(true)} >
                                                            Edit
                                                        </Button>&nbsp;
                                                        {//if last player/owner of Group, delete
                                                            groupState.members.length === 1 &&
                                                            <Button color="danger"
                                                                className="groupActionButton leaveButton"
                                                                onClick={() => deleteGroup(groupState._id.toString())} >
                                                                Delete
                                                            </Button>
                                                        }
                                                        {groupState.members.length > 1 &&
                                                            <Button color="danger"
                                                                className="groupActionButton leaveButton"
                                                                onClick={() => leaveGroup(groupState._id.toString())} >
                                                                Leave
                                                            </Button>
                                                        }
                                                    </div>
                                                ) : (
                                                        //if not already a member in this Group
                                                        isMember ? (
                                                            <Button color="danger"
                                                                className="groupActionButton"
                                                                onClick={() => leaveGroup(groupState._id.toString())}
                                                                style={{ marginRight: 24 }} >
                                                                Leave
                                                            </Button>
                                                        ) : (
                                                            //if not a player of the Group:
                                                            <Button color="primary"
                                                                className="groupActionButton"
                                                                onClick={() => joinGroup(groupState._id.toString())} >
                                                                Join
                                                            </Button>
                                                        )
                                                )
                                            )
                                    )}

                        </ButtonGroup>
                    </div>
                </div>
            </ModalHeader>
            <ModalBody className={"Group-body"}>
                {isEditable ? (
                    <div>
                        <Form id="editGroup" onSubmit={saveGroup}>
                            <FormGroup>
                                <Input
                                    type="text"
                                    name="name"
                                    placeholder="Group Name"
                                    className="border-input"
                                    defaultValue={groupState.name}
                                    onChange={(e) => setGroupState({...groupState, name: e.target.value})}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Input
                                    type="textarea"
                                    name="description"
                                    placeholder="Description"
                                    className="border-input"
                                    defaultValue={groupState.description}
                                    onChange={(e) => setGroupState({...groupState, description: e.target.value})}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Input
                                    type="text"
                                    name="url"
                                    placeholder="Group Url"
                                    className="border-input"
                                    defaultValue={groupState.url}
                                    onChange={(e) => setGroupState({...groupState, url: e.target.value})}
                                />
                            </FormGroup>
                            <FormGroup>
                                <FormCheck inline custom
                                    checked={groupState.isOpen}
                                    type="checkbox"
                                    label="Anyone can join"
                                    id="isOpen"
                                    onClick={(e: any) => setGroupState({...groupState, isOpen: e.target.checked})}
                                />  
                            </FormGroup>
                            {/* <FormGroup>
                                <Input
                                    type="text"
                                    name="alias"
                                    placeholder="alias"
                                    className="border-input"
                                    defaultValue={groupState.abbreviation}
                                    onChange={(e) => setGroupState({...groupState, abbreviation: e.target.value})}
                                />
                            </FormGroup> */}
                        </Form>
                    </div>
                ) : (
                        <div>
                            <div className="groupModalInfo__container ">

                            {/* <div aria-multiselectable={true} id="accordion" role="tablist"> */}
                                <Card className="no-transition card">
                                    <CardHeader
                                        className="card-collapse groupModalHeader"
                                        id="headingOne"
                                        role="tab"
                                    >
                                        <Row>
                                            <Col sm="4">
                                                <Button block color="info" aria-expanded={showSection == 1}
                                                    onClick={e => {
                                                        e.preventDefault();
                                                        setShowSection(1);
                                                    }} >
                                                    Members{" "}
                                                    <Badge >{groupState.members.length}</Badge>{" "}
                                                </Button>
                                            </Col>
                                            <Col sm="4">
                                                <Button block color="info" aria-expanded={showSection == 2}
                                                    onClick={e => {
                                                        e.preventDefault();
                                                        setShowSection(2);
                                                    }} >
                                                    Schedule a Game{" "}
                                                </Button>
                                            </Col>
                                            <Col sm="4">
                                                <Button block color="info" aria-expanded={showSection == 3}
                                                    onClick={e => {
                                                        e.preventDefault();
                                                        setShowSection(3);
                                                    }} >
                                                    Message Board{" "}
                                                </Button>
                                                
                                            </Col>
                                        </Row>
                          
                                    </CardHeader>
                                    <Collapse in={showSection == 1}>
                                        <CardBody>
                                            {groupState.members.map((player: any) => (
                                                <>
                                                <div key={player.gamer} className="player__item">
                                                    <div>
                                                        {player.avatarIcon && (
                                                            <img src={player.avatarIcon} className="playerIcon" />
                                                        )}
                                                        {!player.avatarIcon && (
                                                            <MdAccountCircle className="playerIcon" />
                                                        )}
                                                        {player.username}
                                                    </div>
                                                </div>
                                                </>
                                            ))}
                                        </CardBody>
                                    </Collapse>

                                    <Collapse in={showSection == 2}>
                                    <CardBody>
                                        {/* Schedule Games */}
                                        <div className="groupModalInfo">
                                            <div className="players-container">
                                                <dt>Games</dt>
                                                <div className="groupGames">

                                                    <div className={cn("gameItem addGameItem allMembers", filterGameId === null ? "selected" : "")}
                                                        onClick={() => { setFilterGameId(null)}}>
                                                        All Members
                                                    </div>
                                                    
                                                    {groupState.games && groupState.games.map((game: any) => {
                                                        return (
                                                        <div id={game._id} className={cn("gameItem ", filterGameId === game._id ? "selected" : "")}>
                                                            {isAdmin &&
                                                                <button className="gameItem-remove" onClick={() => { deleteGame(groupState._id.toString(), game._id)}} >x</button>
                                                            }
                                                            <img className={"gameIcon"} src={game.iconSm} onClick={() => { setFilterGameId(game._id); setFilterGameName(game.name); }} />
                                                        </div>
                                                        );
                                                    })
                                                    }
 
                                                    {isMember && groupState.games && groupState.games.length <= 3 &&
                                                    <div>
                                                        <div id="addGameDropdown" className="gameItem addGameItem" onClick={toggleGameSearch}>
                                                            <img src={Plus} alt="Plus" />
                                                        </div>
                                                        <Popover placement="bottom" isOpen={showGameSearch} target="addGameDropdown" className="popover-primary">
                                                            <PopoverHeader>Add Game
                                                                <input type="text" placeholder="search games" onChange={(e) => {searchGames(e.target.value)}}/>
                                                            </PopoverHeader>
                                                            <PopoverBody>
                                                                { displayGameSearchResults() }                                          
                                                            </PopoverBody>
                                                        </Popover>
                                                    </div>
                                                    }
                                                </div>
                                            </div>
                                            <div className="players-invite-container">
                                                {/* if user logged in and doesn't have have any availability, button to add it*/}
                                                {gamerProfile && (!gamerProfile.availsArr || gamerProfile.availsArr.length === 0) && 
                                                    <div className="centeredButton">
                                                        <Button color="primary"
                                                            className="groupActionButton"
                                                            onClick={() => addGamerAvail()} >
                                                            Add Your Availability
                                                        </Button>
                                                    </div>
                                                }
                                                <p>Available Members
                                                    {filterGameId ? ' for: ' + filterGameName : ''}
                                                    {/* if user logged in and doesn't have this game, button to add it*/}
                                                    {gamerProfile && gamerProfile.games && filterGameId && (gamerProfile.games as any[]).findIndex(g => g._id === filterGameId) === -1 && 
                                                        <Button color="primary"
                                                            className="groupActionButton"
                                                            onClick={() => addGamerGame(filterGameId)} >
                                                            Add Game
                                                        </Button>
                                                    }
                                                </p>
                                                <Row>
                                                    <Col lg="6">
                                                        <div className="tableContainer">
                                                            <div>
                                                                <table className="tableHeader">
                                                                    <tbody className="timeButtons">
                                                                        <tr>
                                                                            <th className="timeColumn"/>
                                                                            <td>Sun</td>
                                                                            <td>Mon</td>
                                                                            <td>Tue</td>
                                                                            <td>Wed</td>
                                                                            <td>Thu</td>
                                                                            <td>Fri</td>
                                                                            <td>Sat</td>
                                                                        </tr>
                                                                        {GenerateBoxes()} 
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col lg="4">
                                                        {ShowAvailMembers(dayInc, timeInc)} 
                                                    </Col>
                                                </Row>
                                            </div> 
                                        </div>
                                       
                                    </CardBody>
                                    </Collapse>

                                    <Collapse in={showSection == 3}>
                                        <CardBody>
                                            {/* Message Board */}
                                            <div className="groupModalInfo">
                                                <div className="comments">
                                                    {getComments()}
                                                </div>    
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
                                        </CardBody>
                                    </Collapse>


                                </Card>
                            {/* </div> */}
                              

                            </div>
                        </div>
                    )}
            </ModalBody>
            </div>

        </Modal>
    );
}

export default GroupDetails;
