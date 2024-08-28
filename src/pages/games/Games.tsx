import React from "react";
import s from "./Game.module.css";
import gameDefaultImg from "../../assets/img/game.png";
import starActiveIcon from "../../assets/img/star-active.svg";
import starDisableIcon from "../../assets/img/star-disable.svg";
import { debounce } from "lodash";
import { IoMdClose } from "react-icons/io";
import cn from "classnames";
import plusImg from '../../assets/img/thinPlus.svg'
import tickImg from '../../assets/img/tick.svg'
import * as Constants from "../../constants";
import Preloader from "../../components/preloader/preloader";
import {
	PageModalContent,
	PageModalHeader,
	PageModalSearch,
} from "../../components/pageModal/PageModal";
import delay from '../../assets/libs/delay'
import { authenticationService as auth} from '../../services/authentication.service'

interface GameInfo {
	gameId: string;
	title: string;
	imgPath: string;
}

interface ListedGameProps {
	key: string;
	id: string;
	title: string;
	imgPath: string;
	removeHandle: any;
	checkFave: any;
	favHandle: any;
}

interface SearchResultsProps {
	key: string;
	id: string;
	title: string;
	imgPath: string;
	addHandle: any;
	checkOwned: any;
}

interface GamesProps {
	isAuth: boolean
	history: any
	handleClose: () => void
}

interface GamesState {
	popGames: Array<GameInfo>;
	searchValue: string;
	defaultGames: Array<GameInfo>;
	myGames: Array<any>;
	myGamesDisplayed: Array<any>;
	favorites: Array<any>;
	currentSwitchedModal: number;
	isLoading: boolean;
	isSearching: boolean;
	isSearchError: boolean;
}

function ListedGame(props: ListedGameProps) {

	return (
		<li className={s.game}>
			{props.checkFave(props.id) && (
				<div onClick={() => props.favHandle(props.id)} className={s.chosenness}>
					<img src={starActiveIcon} alt="chosen game icon" />
				</div>
			)}
			{!props.checkFave(props.id) && (
				<div onClick={() => props.favHandle(props.id)} className={s.chosenness}>
					<img src={starDisableIcon} alt="simple game icon" />
				</div>
			)}

			<div className={s.gameIcon}>
				<img src={props.imgPath || gameDefaultImg} alt="game img" />
			</div>

			<div className={s.gameTitle}>{props.title}</div>

			<div
				onClick={() => props.removeHandle(props.id)}
				className={s.deleteGame}
			>
				<IoMdClose style={{ width: "20px", height: "20px" }} />
			</div>
		</li>
	);
}

function SearchResults(props: SearchResultsProps) {

	return (
		<li
			className={s.game}
			onClick={() => {
				if (!props.checkOwned(props.id)) {
					props.addHandle(props.id);
				}
			}}
		>
			<div className={s.gameIcon}>
				<img src={props.imgPath || gameDefaultImg} alt={props.title} />
			</div>
			{props.checkOwned() === false &&
				<div className={s.addGameIcon}>
					<img src={plusImg} alt="add game" />
				</div>
			}
			{props.checkOwned() === true &&
				<div className={s.alreadyAddedGameIcon}>
					<img src={tickImg} alt="already added" />
				</div>
			}
		</li>
	);
}

class Games extends React.Component<GamesProps, GamesState> {
	constructor(props: any) {
		super(props);

		this.state = {
			//default values
			popGames: [],
			searchValue: "",
			defaultGames: [],
			myGames: [],
			myGamesDisplayed: [],
			favorites: [],
			currentSwitchedModal: 1,
			isLoading: true,
			isSearching: false,
			isSearchError: false,
		};

		this.updateOwnedGames = this.updateOwnedGames.bind(this);
		this.setDefaultGames = this.setDefaultGames.bind(this);
		this.searchTermUpdate = this.searchTermUpdate.bind(this);
		this.resetPopGames = this.resetPopGames.bind(this);
		this.removeGame = this.removeGame.bind(this);
		this.addGame = this.addGame.bind(this);
		this.checkFavorites = this.checkFavorites.bind(this);
		this.checkOwnership = this.checkOwnership.bind(this);
		this.changeFavorite = this.changeFavorite.bind(this);
		this.searchIt = debounce(this.searchIt, 400);

	}

	switchCurrentModal(modalId: number) {
		this.setState(() => ({
			currentSwitchedModal: modalId,
		}));
	}

	async updateOwnedGames() {
		this.setState({ isLoading: true });
		const token = window.localStorage.getItem("authtoken");
		let prevChosen = JSON.parse(window.localStorage.getItem("newUserGames"));
		if (prevChosen) {
			for (let i = 0; i < prevChosen.length; i++) {
				this.addGame(prevChosen[i].gameId);
			}
			window.localStorage.removeItem("newUserGames");
		}
		let userURL = Constants.APIURL + "/api/gamer";
		const userRes = await fetch(userURL, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
		});
		const user = await userRes.json();
		let userGames = user.games;
		let favorGames = user.gamesPreferred;
		this.setState(() => ({
			myGames: userGames,
			myGamesDisplayed: userGames,
			favorites: favorGames,
			isLoading: false,
			searchValue: ""
		}));
	}

	async setDefaultGames() {
		var idArray = [
			"5e8a2a097ae0f544b467c338",
			"5e8a2a097ae0f544b467c339",
			"5e8a2a097ae0f544b467c33e",
			"5df479435422db66c80271eb",
			"5df479405422db66c8026e8d",
		];

		var newGames: Array<GameInfo> = this.state.popGames;
		const token = window.localStorage.getItem("authtoken");

		var gameRes: any;
		let gameUrl: string;
		let searchResults: any;
		let newestGame: any;
		let i = 0;
		let j = 0;
		while (j < 4) {
			gameUrl = Constants.APIURL + "/api/games/" + idArray[j];
			gameRes = await fetch(gameUrl, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
			});
			searchResults = await gameRes.json();
			if (searchResults) {
				newestGame = {
					gameId: searchResults.gameId,
					title: searchResults.name,
					imgPath: searchResults.iconSm,
				};
				newGames[i++] = newestGame;
			}
			j++;
		}
		this.setState(() => ({
			defaultGames: newGames,
			popGames: newGames,
		}));
	}

	async componentDidMount() {

		if (!this.props.isAuth) {
			this.props.history.push("/login");
		} else {
			this.updateOwnedGames();

			this.setDefaultGames();
		}
	}

	checkFavorites(key: string) {
		let faves: Array<any> = this.state.favorites;
		let result = false;
		for (let i = 0; i < faves.length; i++) {
			if (faves[i]._id === key) {
				result = true;
			}
		}
		return result;
	}

	checkOwnership(key: string) {
		let games: Array<any> = this.state.myGames;
		let result = false;
		if (games) {
			for (let i = 0; i < games.length; i++) {
				if (games[i].gameId === key) {
					result = true;
				}
			}
		}

		return result;
	}

	async changeFavorite(key: string) {
		const token = window.localStorage.getItem("authtoken");
		if (this.checkFavorites(key)) {
			let remURL = Constants.APIURL + "/api/gamer/preferredgames/remove/" + key;
			const remRes = await fetch(remURL, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
			});
			await remRes.json();
			let userURL = Constants.APIURL + "/api/gamer";
			const userRes = await fetch(userURL, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
			});
			const user = await userRes.json();
			let newFavors = user.gamesPreferred;

			this.setState(() => ({
				favorites: newFavors,
			}));
			return;
		} else {
			let addURL = Constants.APIURL + "/api/gamer/preferredgames/add/" + key;
			const addRes = await fetch(addURL, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
			});
			await addRes.json();

			let userURL = Constants.APIURL + "/api/gamer";
			const userRes = await fetch(userURL, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
			});
			const user = await userRes.json();
			let newFavors = user.gamesPreferred;

			this.setState(() => ({
				favorites: newFavors,
			}));
			return;
		}
	}

	async removeGame(key: string) {
		this.setState(() => ({
			isLoading: true,
		}));

		const token = window.localStorage.getItem("authtoken");

		let remURL = Constants.APIURL + "/api/gamer/games/remove/" + key;
		const remRes = await fetch(remURL, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
		});
		let removal = await remRes.json();

		let userURL = Constants.APIURL + "/api/gamer";
		const userRes = await fetch(userURL, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
		});
		const user = await userRes.json();
		let userGames = user.games;

		this.setState(() => ({
			myGames: userGames,
		}));
		await this.updateOwnedGames();
		return;
	}

	async addGame(key: string) {

		this.setState(() => ({
			isLoading: true,
			isSearchError: false,
			isSearching: false
		}));

		const token = window.localStorage.getItem("authtoken");

		let addURL = Constants.APIURL + "/api/gamer/games/add/" + key;
		const addRes = await fetch(addURL, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
		});
		let addition = await addRes.json();

		let userURL = Constants.APIURL + "/api/gamer";
		const userRes = await fetch(userURL, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
		});
		const user = await userRes.json();
		let userGames = user.games;

		this.setState(() => ({
			myGames: userGames,
		}));

		await this.updateOwnedGames();
		return;
	}

	resetPopGames() {
		let holder = JSON.parse(JSON.stringify(this.state.defaultGames));
		this.setState(() => ({
			popGames: holder,
		}));
	}

	searchTermUpdate(e: any) {
		e.persist();
		this.setState(() => ({
			searchValue: e.target.value,
			isSearching: true,
			isSearchError: false
		}));
		delay(this.searchIt(e), 500)
	}

	async searchIt(e: any) {
		e.preventDefault();

		this.setState(() => ({
			isSearching: true,
			isSearchError: false
		}));

		const token = window.localStorage.getItem("authtoken");

		if (this.state.searchValue === "") {
			this.updateOwnedGames();
			this.resetPopGames();
			this.setState(() => ({
				isSearching: false,
				isSearchError: false
			}));
		} else {

			let url =
				Constants.APIURL + "/api/games/search/" + this.state.searchValue;
			const response = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
			});
			var searchResults = await response.json();
			// console.log(searchResults)

			if (searchResults.length !== 0) {
				let loopMax = 0;
				var newestResult: GameInfo;
				var newResults: Array<GameInfo> = [];
				var ownedResults: any = [];
				var ownIndex = 0;
				if (searchResults.length > 4) {
					loopMax = 12;
				} else {
					loopMax = searchResults.length;
				}
				for (let i = 0; i < searchResults.length; i++) {
					if (i < loopMax) {
						newestResult = {
							gameId: searchResults[i].gameId,
							title: searchResults[i].name,
							imgPath: searchResults[i].iconSm,
						};
						newResults[i] = newestResult;

						if (this.checkOwnership(searchResults[i]._id)) {
							ownedResults[ownIndex++] = searchResults[i];
						}
					} else {
						if (this.checkOwnership(searchResults[i]._id)) {
							ownedResults[ownIndex++] = searchResults[i];
						}
					}
				}
				newResults.length = loopMax;

				this.setState(() => ({
					popGames: newResults,
					myGamesDisplayed: ownedResults,
					isSearching: false,
					isSearchError: false
				}));
			} else {
				// alert("No Games Found with that Search");
				// this.updateOwnedGames();
				this.resetPopGames();

				this.setState(() => ({
					isSearching: false,
					isSearchError: true
				}));
			}
		}
	}

	render() {
		if (!this.props.isAuth)
			return null

		let listOfGames: any;
		if (this.state.myGames) {
			listOfGames = this.state.myGamesDisplayed.map((game: any) => (
				<ListedGame
					key={game.gameId}
					id={game.gameId}
					title={game.name}
					imgPath={game.iconSm}
					removeHandle={this.removeGame}
					checkFave={this.checkFavorites}
					favHandle={this.changeFavorite}
				/>
			));
		} else {
			listOfGames = null;
		}



		let listOfResults: any;
		if (this.state.popGames) {
			listOfResults = this.state.popGames.map((game: any) => {
				console.log(game)
				return <SearchResults
					key={game.gameId}
					id={game.gameId}
					title={game.title}
					imgPath={game.imgPath}
					addHandle={this.addGame}
					checkOwned={() => this.checkOwnership(game.gameId)}
				/>
			});

		} else {
			listOfResults = null;
		}


		return (
			<div className="tourGames">

				<PageModalHeader title={"Games"} handleClose={this.props.handleClose} preloader={this.state.isLoading}>
					<PageModalSearch
						searchDefaultValue={this.state.searchValue}
						searchPlaceholder={"Add new games"}
						searchOnChange={this.searchTermUpdate}
						searchOnSubmit={this.searchIt}
					/>
				</PageModalHeader>

				<PageModalContent>

					{!this.state.isLoading &&
						<div className={s.gamesContainer}>
							{this.state.searchValue === '' &&
								<div className={s.gamesGroup}>
									<div className={s.gamesHeader}>
										<h3>My Games</h3>
									</div>

									{listOfGames === null && (
										<p className={s.gamesWarning}>No games yet. Add some!</p>
									)}

									{listOfGames !== null && (
										<div className={s.gamesContent}>
											{this.state.isLoading && <div>...</div>}
											<ul className={cn(s.gamesList, s.wideList)}>
												{!this.state.isLoading && listOfGames}
											</ul>
										</div>
									)}
								</div>
							}
							<div className={s.gamesGroup}>
								<div className={s.gamesHeader}>
									<h3>Add Games</h3>
								</div>

								{listOfResults !== null && (

									<div className={s.gamesContent}>
										{this.state.isSearching &&
											<Preloader />
										}
										{!this.state.isSearching && !this.state.isSearchError &&
											<ul className={cn(s.gamesList, s.shortList)}>
												{listOfResults}
											</ul>
										}
										{this.state.isSearchError &&
											<p className={s.gamesWarning}>No results</p>
										}
									</div>
								)}
							</div>
						</div>
					}
				</PageModalContent>

			</div>
		);
	}
}

export default Games;
