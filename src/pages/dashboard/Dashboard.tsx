import React, { useEffect, useRef, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Room from '../rooms/Room';
import SuggestionsRoom from '../rooms/SuggestionsRoom';
import { IDashboardData } from '../../models/dashboard.model';
import axios from 'axios';
import { IRoom } from '../../models/room.model';
import { useStoreState, useStoreActions } from "../../store/hooks";
import RoomDetails from '../rooms/RoomDetails';
import moment from 'moment';
import s from './Dashboard.module.css';
import "./Dashboard.css";
import Logo from '../../assets/img/logo.png';
import Plus from '../../assets/img/Plus.svg';
import Preloader from '../../components/preloader/preloader';
import { authenticationService as auth } from '../../services/authentication.service';
import { apiService as api } from '../../services/api.service';
import cx from 'classnames';
import * as Constants from "../../constants";
// for slick-slider 
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { IoIosArrowDown, IoIosArrowForward } from 'react-icons/all'
import { IGame } from '../../models/game.model';
import { localSettingsService, UserSettings } from '../../services/localSettings.service';
import { Collapse, Popover, PopoverBody, PopoverHeader } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/pro-regular-svg-icons'
import GroupDetails from '../networks/GroupDetails';

//this will return the rooms under the correct dates
//but not sorted within each date
function useForceUpdate() {
	const [value, setValue] = useState(0); // integer state
	return () => setValue(value + 1); // update the state to force render
}

interface IControlsPanel {
	classNames: string,
	index?: number,
	onClick?: any,
}

function Dashboard() {

	const [dashboardData, setDashboardData] = useState<IDashboardData>(null);
	const [gamesLookup, setGamesLookup] = useState<Record<string, IGame>>(null);
	const [searchGamesLookup, setSearchGamesLookup] = useState<IGame[]>(null);
	const [favoriteGames, setFavoriteGames] = useState(null);
	const [suggestionData, setSuggestionData] = useState(null);
	const [filterDate, setFilterDate] = useState(null);
	const [indexSlide, setIndexSlide] = useState(0);
	const [viewAmount, setViewAmount] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [showProfileDropdown, setShowProfileDropdown] = useState(false);
	const [showGameFilterDropdown, setGameFilterDropdown] = useState(false);
	const [roomIdToOpen, setRoomIdToOpen] = useState(null);
	const [hideSuggestions, setHideSuggestions] = useState(localSettingsService.getSetting('hideSuggestions'));
	const [gamesToSkip, setGamesToSkip] = useState<Record<string, boolean>>({});
	const [showGameSearch, setShowGameSearch] = useState(false);

	const history = useHistory();
	const refreshCounter = useStoreState(state => state.refreshCounter);
	const displayRoom = useStoreState(state => state.displayRoom);
	// if specific room and date selected
	const deepLinkRoomId = useStoreState(state => state.deepLinkRoomId);
	const deepLinkOccurrenceDate = useStoreState(state => state.deepLinkOccurrenceDate);
	const openRoom = useStoreActions(actions => actions.openRoom);

	const displayGroupId = useStoreState(state => state.displayGroupId);
	const clearRoomLink = useStoreActions(actions => actions.clearRoomLink);
	const closeRoom = useStoreActions(actions => actions.closeRoom);
	const closeGroup = useStoreActions(actions => actions.closeGroup);
	const setHasAvail = useStoreActions(actions => actions.setHasAvail);
	const setHasGames = useStoreActions(actions => actions.setHasGames);
	const forceRefresh = useStoreActions(actions => actions.forceRefresh);

	const forceUpdate = useForceUpdate();
	const userid = auth.getUserId();
	const username = auth.getUsername();
	const headerOptions = auth.getHeaderOptions();
	const addGameInput = useRef(null);

	async function createRoom() {
		//guess a startTime
		let startTime = moment().minutes(0).add(1, 'hours');
		if (moment().diff(startTime, 'minutes') < 60)
			startTime = startTime.add(1, 'hours');

		const roomInfo: any = {
			// game: room.game,
			host: userid,
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
			players: []
		}
		openRoom(roomInfo);
	}

	async function createSuggestionRoom(suggestionDetails: any) {

		const roomInfo: any = {
			game: suggestionDetails.game,
			host: userid,
			description: "",
			hostUsername: username,
			hostTimezone: auth.getUserTimezone,
			comments: [],
			privacyLevel: 5,
			startTime: suggestionDetails.startTime,
			maxPlayers: 4,
			gameMode: "Let's Play!",
			isRepeat: false,
			roomCategory: "user",
			players: []
		}
		openRoom(roomInfo);
	}

	// game lookup - if doesn't exist, get from server and add it to store lookup
	function getGameLookup(gameId: string) {
		if (!gameId)
			return null;

		let game: IGame = gamesLookup[gameId];
		if (!game) {
			try {
				//wrapped async call so RoomDetails doesn't get a Promise<IGame>
				const getGame = async () => {
					game = await api.getGame(gameId);
					setGamesLookup({ ...gamesLookup, [gameId]: game });
				};
				getGame();
			} catch (err) {
				console.log(err);
			}
		}
		return game;
	}

	// get main dashboard data
	async function getDashboardData() {

		if (!filterDate)
			return;

		setIsLoading(true);
		try {

			const dateString = moment(filterDate).format("YYYY-MM-DD");
			let response;
			if (auth.isAuthenticated()) {
				response = await axios.get(Constants.APIURL + "/api/dashboard/week?dateFilter=" + dateString, headerOptions);
			} else {
				response = await axios.get(Constants.APIURL + "/anon/dashboard/week?dateFilter=" + dateString + "&timezone=" + auth.getUserTimezone(), headerOptions);
			}

			console.log('DashboardData loaded');
			console.log(response.data);
			setDashboardData(response.data);
			setGamesLookup(response.data.games);
			setHasAvail(response.data.gamer.availsArr && response.data.gamer.availsArr.length > 0)
			setHasGames(response.data.gamer.games && response.data.gamer.games.length > 0)

			//set favorite games objects
			if (response.data.gamer && response.data.gamer.gamesPreferred && response.data.gamer.gamesPreferred.length > 0) {
				let faveGames: any = {};
				response.data.gamer.gamesPreferred.forEach((gameId: string) => {
					faveGames[gameId] = { gameId: gameId };
				});
				setFavoriteGames(faveGames);
			}
			// anon user or no favorite games, so skip getting suggestions
			else {
				setIsLoading(false);
			}

		} catch (err) {
			console.log(err);
		}
	}

	async function getSuggestionData() {
		try {
			const dateString = moment(filterDate).format("YYYY-MM-DD");
			const response = await axios.get(Constants.APIURL + "/api/dashboard/suggest?dateFilter=" + dateString, headerOptions);
			setSuggestionData(response.data);
		} catch (err) {
			console.log(err);
		}
	}

	// if specific room is deep-linked, load room data first, then alter filterDate to match
	async function getInitialRoom(roomId: string, occurrenceDate: string) {
		let response: any;
		if (occurrenceDate) {
			response = await axios.get(Constants.APIURL + `/anon/rooms/${roomId}/series/${occurrenceDate}`, headerOptions);
		} else {
			response = await axios.get(Constants.APIURL + `/anon/rooms/${roomId}`, headerOptions);
		}
		return response.data;
	}

	//if room is deep linked, change filterDate and openRoom
	async function getDeepLinkRoom() {
		if (!deepLinkRoomId) {
			setFilterDate(moment().toDate());
		} else {
			let room: IRoom = await getInitialRoom(deepLinkRoomId, deepLinkOccurrenceDate);

			if (room) {
				room.game = (room.game as any)._id; //room details crams game info into .game
				//openRoom(room);
				setRoomIdToOpen(deepLinkRoomId);
				setFilterDate(room.startTime);
			}

			//get data once and reset it so we don't refresh with it
			clearRoomLink();
		}
	}

	function findRoomInDashboardData(roomId: string): IRoom {
		if (dashboardData) {
			let foundRoom: IRoom = null;
			Object.keys(dashboardData.rooms).some(dayIndex => {
				foundRoom = dashboardData.rooms[dayIndex].find(room => room._id.toString() === roomId);
				if (!!foundRoom) {
					return true;
				}
			})
			return foundRoom;
		}
		return null;
	}

	async function addGame(gameId: string) {
		try {
			await axios.put(Constants.APIURL + "/api/gamer/games/add/" + gameId, null, headerOptions);
			setSearchGamesLookup(null);
			setShowGameSearch(false);
			forceRefresh();
		} catch (err) {
			console.log(err);
		}
	}

	// **************** BEGIN UseEffect Section ****************

	useEffect(() => {
		setViewAmount(document.getElementsByClassName('slick-slide').length - document.getElementsByClassName('slick-active').length);
		getDeepLinkRoom();
	}, []);

	// get dashboard data on filterDate change
	useEffect(() => {
		getDashboardData();
	}, [filterDate, refreshCounter]);

	// get game suggestions once fave games are loaded
	useEffect(() => {
		//if user has preferred games, load suggestionDatn
		if (dashboardData && dashboardData.gamer.gamesPreferred.length > 0) {
			getSuggestionData();
		}

	}, [favoriteGames]);

	useEffect(() => {
		//if deep link room/group found, find it and display it
		if (!isLoading && dashboardData && roomIdToOpen) {
			const foundRoom = findRoomInDashboardData(roomIdToOpen);
			setRoomIdToOpen(null);
			if (foundRoom)
				openRoom(foundRoom);
		}

	}, [isLoading]);

	// once suggestions are loaded, plug them back into the dashboard data for display
	useEffect(() => {
		if (suggestionData) {
			let keys = Object.keys(suggestionData.rooms);
			let mergedDashboard = Object.assign({}, dashboardData);

			keys.forEach(key => {
				//integrate candidate profiles into suggestion cards
				suggestionData.rooms[key].forEach((room: any) => {
					room.roomCategory = "suggest";
					room.invitees = [];
					room.candidates.forEach((candidateID: any) => {
						//now for each candidate, look up in candidateArr
						let candidate = suggestionData.candidatesLookup[candidateID];
						room.invitees.push(candidate);
					})
				})

				//merge suggestion rooms with actual dashboard rooms
				if (mergedDashboard.rooms[key]) {
					suggestionData.rooms[key].forEach((room: any) => {
						mergedDashboard.rooms[key].push(room);
					});
				} else {
					mergedDashboard.rooms[key] = suggestionData.rooms[key];
				}
			});
			setDashboardData(mergedDashboard);
		}

		setIsLoading(false);

	}, [suggestionData]);

	useEffect(() => {
		if (showGameSearch) {
			addGameInput.current.focus();
		}
	}, [showGameSearch]);

	// **************** END UseEffect Section ****************

	// toggle game to filter
	function faveGameClicked(id: string) {

		if (!id)
			return;

		if (gamesToSkip[id]) {
			setGamesToSkip({ ...gamesToSkip, [id]: false });
		}
		else {
			setGamesToSkip({ ...gamesToSkip, [id]: true });
		}

	}

	function GetFavGames() {
		var html: JSX.Element[] = [];
		if (favoriteGames && gamesLookup) {
			let count = 0;
			Object.keys(favoriteGames).forEach((gameId: any) => {
				let gameData = getGameLookup(gameId);
				html.push(
					<div key={count} className={s.roomItem + (favoriteGames[gameId].selected ? " checkedImg" : "")}>
						<img className={s.roomItemImg} src={gameData.iconLg} onClick={() => faveGameClicked(gameId)} />
						{/* <div className="overlay"><p className="selectedText">✔</p></div> */}
					</div>
				);
				count++;
			})
		}
		return (html);
	}

	function changeWeekPlus() {
		setFilterDate(moment(filterDate).add(7, 'days').toDate());
	}

	function changeWeekMinus() {
		setFilterDate(moment(filterDate).subtract(7, 'days').toDate());
	}

	// const changeCollapse = (collapse: number) => {
	//   if (collapses.includes(collapse)) {
	// 	setCollapses(collapses.filter(prop => prop !== collapse));
	//   } else {
	// 	setCollapses([...collapses, collapse]);
	//   }
	// };

	function roomSorter(types: string[]) {
		return function (a: any, b: any) {
			if (types.indexOf(a.roomCategory) < types.indexOf(b.roomCategory)) return -1; //a before b
			if (types.indexOf(a.roomCategory) > types.indexOf(b.roomCategory)) return 1; //b before a
			if (a.startTimeInc30 > b.startTimeInc30) return 1; //if same category, sort by start time
			if (a.startTimeInc30 < b.startTimeInc30) return -1;
			return 0;
		}
	}

	// render all rooms for the given dashboard data
	function GetRooms(data: IDashboardData) {
		var html: JSX.Element[] = [];
		if (data) {
			let rooms: string[] = Object.keys(data.rooms); //rooms = ["date1": [{room}, ...], ...]
			rooms.forEach((roomDate: string) => {
				const roomsByDate: IRoom[] = data.rooms[roomDate]; //roomsByDate = [{room}, ...]
				html.push(GetRoomsForDate(Number(roomDate), roomsByDate, data.games));
			});
		}
		return html;
	}

	// render the rooms for a given date
	function GetRoomsForDate(dayOfYear: number, roomsByDate: any[], gamesDict: any) {

		const shorthand: any = { "user": "Your Rooms", "friends": "Friends", "orgs": "Network", "pubs": "Public", "suggest": "Suggestions" };
		const roomTypeOrder: string[] = Object.keys(shorthand); //sort roomsByDate by [user, friends, orgs, pubs, suggest]
		roomsByDate.sort(roomSorter(roomTypeOrder));

		var htmlDate: JSX.Element[] = [];
		var suggestHtmlDate: JSX.Element[] = [];
		let dateHasGames = false;
		let roomType: string = undefined;

		roomsByDate.forEach((room) => {
			// we want to split "rooms" by real and suggestions for now
			const game = gamesDict[room.game];

			let isSuggestion = room.category == "suggest"
			let currentRoomType = (room.roomCategory != undefined ?
				room.roomCategory : "suggest");

			// filter out games specifically being skipped EXCEPT for rooms already joined
			if (gamesToSkip[game.gameId] && currentRoomType != "user") {
				return;
			}

			dateHasGames = true;
			// when roomType changes, add a section header. Assumes rooms are sorted by type already
			if (roomType != currentRoomType) {
				htmlDate.push(
					<p key={shorthand[currentRoomType]} className={s.roomType}>
						{!isSuggestion &&
							shorthand[currentRoomType]}
						{isSuggestion &&
							// expand/collapse chevron
							<div className="iconExpand">
								<a href="#" className={hideSuggestions ? 'collapsed' : ''}
									onClick={(e: any) => {
										e.preventDefault();
										localSettingsService.toggleSetting(UserSettings.hideSuggestions);
										setHideSuggestions(!hideSuggestions);
									}}>
									{shorthand[currentRoomType]} {" "}
									<FontAwesomeIcon icon={faChevronDown} />
								</a>
							</div>
						}
					</p>

				);
				roomType = currentRoomType;
			}
			if (isSuggestion) {
				suggestHtmlDate.push(
					<a onClick={forceUpdate}>
						<SuggestionsRoom key={room._id} game={game} room={room} addRoom={createSuggestionRoom} />
					</a>
				);
			} else {
				htmlDate.push(
					<a key={room._id} onClick={() => openRoom(room)}>
						<Room key={room._id} game={game} room={room} />
					</a>
				);
			}
		});

		let tempDate = new Date(new Date().getFullYear(), 0); // initialize a date in `year-01-01`
		let actualDate = moment(new Date(tempDate.setDate(dayOfYear))); // add the number of days

		let dateString = moment(actualDate).format("dddd, MMM Do");
		if (dayOfYear === moment().dayOfYear()) {
			dateString = "Today's Rooms";
		}
		// else if (dayOfYear === moment().dayOfYear() + 1) {
		// 	dateString = "Tomorrow's Rooms";
		// }
		if (dateHasGames) {
			return (
				<div className={s.gameDateInfo} key={dateString}>
					<h3 className={s.gameDate}>{dateString}</h3>
					<div className={s.gameAccessType}>
						{htmlDate}
						{/* //put collapse around suggestions */}
						<Collapse isOpen={!hideSuggestions}>
							{suggestHtmlDate}
						</Collapse>
					</div>
				</div>
			);
		}
	}
	var settings = {
		dots: false,
		arrows: true,
		infinite: false,
		autoplay: false,
		speed: 500,
		slidesToShow: 7,
		slidesToScroll: 1,
		// centerMode: true,
		nextArrow: <SliderControlPanelNext classNames={`${s.sideBlind} ${s.controlRight}`} index={indexSlide} />,
		//pass index to hide prev hidden on first slide
		prevArrow: <SliderControlPanelPrev classNames={`${s.sideBlind} ${s.controlLeft}`} index={indexSlide} />,
		beforeChange: beforeChangeSlides,
		responsive: [
			{
				breakpoint: 2500,
				settings: {
					slidesToShow: 7,
					slidesToScroll: 0,
				}
			},
			{
				breakpoint: 2350,
				settings: {
					slidesToShow: 6,
					slidesToScroll: 1,
				}
			},
			{
				breakpoint: 2000,
				settings: {
					slidesToShow: 5,
					slidesToScroll: 1,
				}
			},
			{
				breakpoint: 1650,
				settings: {
					slidesToShow: 4,
					slidesToScroll: 1,
				}
			},
			{
				breakpoint: 1380,
				settings: {
					slidesToShow: 3,
					slidesToScroll: 1,
				}
			},
			{
				breakpoint: 1120,
				settings: {
					slidesToShow: 2,
					slidesToScroll: 1,
				}
			},

			{
				breakpoint: 760,
				settings: {
					slidesToShow: 1,
					slidesToScroll: 1
				}
			},

		]
	};
	function beforeChangeSlides(prev: number, next: number) {
		setIndexSlide(next);
	}

	let slickSlider = <Slider {...settings}>
		{GetRooms(dashboardData)}
		{displayRoom && gamesLookup &&
			<RoomDetails room={displayRoom} gameLookup={getGameLookup(displayRoom.game)} closeRoom={() => { closeRoom(); }} />
		}
		{displayGroupId &&
			<GroupDetails groupId={displayGroupId} closeGroup={() => { closeGroup(); }} />
		}
	</Slider>

	function SliderControlPanelPrev({ classNames, onClick, index }: IControlsPanel) {
		return (
			<div className={classNames} onClick={onClick} style={(index === 0) ? { opacity: 0 } : null}>
				<IoIosArrowForward className={s.showMoreArrow} />
				<IoIosArrowForward className={s.showMoreArrow} />
				<IoIosArrowForward className={s.showMoreArrow} />

			</div>
		)
	}
	function SliderControlPanelNext({ classNames, onClick, index }: IControlsPanel) {
		return (
			<div className={classNames} onClick={onClick} style={index === viewAmount ? { opacity: 0 } : null}>
				<IoIosArrowForward className={s.showMoreArrow} />
				<IoIosArrowForward className={s.showMoreArrow} />
				<IoIosArrowForward className={s.showMoreArrow} />
			</div>
		)
	}
	if (window.screen.width < 500) {
		slickSlider = <div className={s.roomsNoSlider}>
			{GetRooms(dashboardData)}
			{displayRoom &&
				<RoomDetails room={displayRoom} gameLookup={dashboardData.games[displayRoom.game]} closeRoom={() => { closeRoom(); }} />
			}
		</div>
	}

	function displayGameSearchResults() {
		let html: any[] = [];
		if (searchGamesLookup) {
			searchGamesLookup.forEach(game => {
				html.push(<img src={game.iconSm} onClick={() => { addGame(game.gameId); }} alt={game.name} />);
			});
		}
		return html;
	}

	async function searchGames(searchTerm: string) {
		try {
			const searchResults = await axios.get(Constants.APIURL + "/api/games/search/" + searchTerm, headerOptions);
			setSearchGamesLookup(searchResults.data);
		} catch (err) {
			console.log(err);
		}
	}

	function toggleGameSearch() {
		setSearchGamesLookup(null);
		setShowGameSearch(!showGameSearch);
	}

	return (
		<div>
			<div className={s.header}>
				<div className={s.container}>
					<div className={s.inline}>
						<img className={s.logo} src={Logo} alt="RUIn Logo" />
						<h1>Online Game Scheduler</h1>
					</div>
					<div id="weekButtons" className={s.button_wrapper}>
						<button className={s.arrow} type="button" onClick={changeWeekMinus}>
							<IoIosArrowForward className={s.filterArrowLeft} />
						</button>
						<div className={s.datePeriod}>
							{moment(filterDate).format('ddd, MMMM DD') + " - " + moment(filterDate).add(6, "days").format("ddd, MMMM DD")}
						</div>
						<button className={s.arrow} type="button" onClick={changeWeekPlus}>
							<IoIosArrowForward className={s.filterArrowRight} />
						</button>
					</div>
					{auth.isAuthenticated() && dashboardData && dashboardData.gamer &&
						<div className={s.headerUser}>
							<div
								onClick={() => setShowProfileDropdown(!showProfileDropdown)}
								className={cx(s.filters, s.darkblue)}>
								<div className={s.filterWrap}>
									<div>Welcome {auth.getUsername()}</div>
								</div>
								<div className={cx(s.filterImageWrap)}>
									<IoIosArrowDown className={s.filtersArrow} />
								</div>
								{showProfileDropdown &&
									<div className={s.dropdownContainerBlue}>
										<div className={s.dropdownItem} onClick={auth.logout}>Sign Out</div>
										<div className={s.dropdownItem} onClick={() => history.push("/password")}>Change Password</div>
										<div className={s.dropdownItem} onClick={() => history.push("/contactus")}>Contact Us</div>
									</div>

								}
							</div>

							<img className={s.userAvatar} src={dashboardData.gamer.avatarIcon} alt={dashboardData.gamer.username} />
						</div>

					}
					{!auth.isAuthenticated() &&
						<div className="tourLogin">
							<div className={s.headerUser}>
								<Link to="/login" className={s.userWelcome}>Login</Link> |
							<Link to="/signup" className={s.userWelcome}> Sign Up</Link>
							</div>
						</div>
					}
				</div>
			</div>

			{auth.isAuthenticated() &&
				<div className={s.filters_section}>
					<div className={s.filterContainer}>
						<div
							onClick={() => setGameFilterDropdown(!showGameFilterDropdown)}
							className={s.filters}>
							<div className={s.filterWrap}>
								<div>Display:</div>
								<div>All Games</div>
							</div>
							<div className={s.filterImageWrap}>
								<IoIosArrowDown className={s.filtersArrow} />
							</div>
							{showGameFilterDropdown && false &&
								<div className={s.dropdownContainerOrange}>
									<div className={s.dropdownItem} onClick={forceUpdate}>Favorite games</div>
									<div className={s.dropdownItem}>Popular</div>
									<div className={s.dropdownItem}>Top rated</div>
								</div>
							}
						</div>

					</div>

					{/* ToBe filled with data */}
					<div className={s.roomGames}>
						{GetFavGames()}

						<div id="addGameDropdown2" className={s.roomItem + ' ' + s.addRoomItem} onClick={toggleGameSearch}>
							<img src={Plus} alt="Plus" />
						</div>
						<Popover placement="bottom" isOpen={showGameSearch} target="addGameDropdown2" className="popover-primary">
							<PopoverHeader>Add Game
							<input type="text" placeholder="search games" ref={addGameInput} onChange={(e) => { searchGames(e.target.value) }} />
							</PopoverHeader>
							<PopoverBody>
								{displayGameSearchResults()}
							</PopoverBody>
						</Popover>
					</div>
					<div className={s.createRoom} onClick={createRoom}> Create Room </div>
				</div>
			}

			{isLoading &&
				<Preloader />
			}
			{!isLoading &&
				slickSlider
			}

		</div>
	);

}


export default Dashboard;
