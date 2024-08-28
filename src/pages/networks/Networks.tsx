import React from "react";
import s from "./Networks.module.css";
import { debounce } from "lodash";
import NetworkListItem from "./NetworkListItem/NetworkListItem";
import Preloader from "../../components/preloader/preloader";
import {
	PageModalHeader,
	PageModalSearch,
	PageModalContent,
	PageModalPlusButton,
} from "../../components/pageModal/PageModal";
import delay from '../../assets/libs/delay'
import * as Constants from "../../constants";
import GroupDetails from "./GroupDetails";

interface NetworksProps {
	handleClose: any,
	history: any
	isAuth: boolean
}

interface NetworksState {
	myNetworks: Array<any>;
	myNetworksGames: Array<any>;
	topNetworks: Array<any>;
	topNetworksGames: Array<any>;
	searchValue: string;
	showModal: boolean;
	currentOrg: any;
	isLoading: boolean;
	isSearching: boolean;
	isSearchError: boolean;
	initing: boolean;
}

// interface ListedOrgProps {
//   key: string;
//   id: string;
//   title: string;
//   joined: boolean;
//   members: Array<any>;
//   open: boolean;
//   joinHandle: any;
//   requestHandle: any;
//   leaveHandle: any;
//   games: any;
// }

class Networks extends React.Component<NetworksProps, NetworksState> {
	constructor(props: any) {
		super(props);

		this.state = {
			myNetworks: [],
			myNetworksGames: [],
			topNetworks: [],
			topNetworksGames: [],
			searchValue: "",
			showModal: false,
			currentOrg: {},
			isLoading: true,
			isSearching: false,
			isSearchError: false,
			initing: false,
		};
		this.checkMembership = this.checkMembership.bind(this);
		this.updateNetworks = this.updateNetworks.bind(this);
		this.resetTopNetworks = this.resetTopNetworks.bind(this);
		this.joinNetwork = this.joinNetwork.bind(this);
		this.requestNetwork = this.requestNetwork.bind(this);
		this.leaveNetwork = this.leaveNetwork.bind(this);
		this.searchTermUpdate = this.searchTermUpdate.bind(this);
		this.searchIt = debounce(this.searchIt, 400);
		this.openModal = this.openModal.bind(this);
		this.createGroup = this.createGroup.bind(this);
		this.closeModal = this.closeModal.bind(this);
	}

	checkMembership(key: string) {
		let result = false;
		for (let i = 0; i < this.state.myNetworks.length; i++) {
			if (this.state.myNetworks[i]._id === key) {
				result = true;
			}
		}
		return result;
	}

	async updateNetworks() {
		const token = window.localStorage.getItem("authtoken");
		let userURL = Constants.APIURL + "/api/gamer";
		const userRes = await fetch(userURL, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
		});
		const user = await userRes.json();
		let userOrgs = user.orgs;

		let netGames: any = [];

		let netURL = Constants.APIURL + "/anon/orgs/";
		let gamerURL = Constants.APIURL + "/api/gamers/";
		let networkTemp: any = [];
		let NetworkRes: any = [];
		let adminRes: any;
		let adminTemp: any;

		if (userOrgs) {
			for (let i = 0; i < userOrgs.length; i++) {
				NetworkRes = await fetch(netURL + userOrgs[i]._id, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: token,
					},
				});
				networkTemp = await NetworkRes.json();
				userOrgs[i] = networkTemp;
				if (networkTemp.admins[0]) {
					adminRes = await fetch(gamerURL + networkTemp.admins[0]._id, {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: token,
						},
					});
					adminTemp = await adminRes.json();
					netGames[i] = adminTemp.gamesPreferred;
				} else {
					netGames[i] = [];
				}
			}
		}

		this.setState(() => ({
			myNetworks: userOrgs,
			myNetworksGames: netGames,
			isLoading: false
		}));
	}

	async resetTopNetworks() {
		const token = window.localStorage.getItem("authtoken");

		let topURL = Constants.APIURL + "/api/orgs/top/5";
		const topRes = await fetch(topURL, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
		});
		let tops = await topRes.json();

		// tops = tops.filter((top: any) => {
		//   return this.state.myNetworks.find(
		//     (network: any) => network._id === top._id
		//   );
		// });

		let topInfoTemp: any = [];
		let topInfoRes: any = [];

		let netURL = Constants.APIURL + "/api/orgs/";

		let gamerURL = Constants.APIURL + "/api/gamers/";
		let adminRes: any;
		let adminTemp: any;
		let topGames: any = [];

		for (let i = 0; i < tops.length; i++) {
			topInfoRes = await fetch(netURL + tops[i]._id, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
			});
			topInfoTemp = await topInfoRes.json();
			tops[i] = topInfoTemp;
			if (topInfoTemp.admins[0]) {
				adminRes = await fetch(gamerURL + topInfoTemp.admins[0]._id, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: token,
					},
				});
				adminTemp = await adminRes.json();
				topGames[i] = adminTemp.gamesPreferred;
			} else {
				topGames[i] = [];
			}
		}

		this.setState(() => ({
			topNetworks: tops,
			topNetworksGames: topGames,
			isLoading: false,
		}));
	}

	async joinNetwork(key: string) {
		this.setState({ isLoading: true, searchValue: '' });
		const token = window.localStorage.getItem("authtoken");
		// alert(JSON.stringify(key));
		let addURL = Constants.APIURL + "/api/orgs/" + key + "/join";
		const addRes = await fetch(addURL, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
		});
		await addRes.json();
		await this.updateNetworks();
		this.setState({ isLoading: false });
		return;
	}

	async requestNetwork(key: string) {
		this.setState({ isLoading: true, searchValue: '' });
		const token = window.localStorage.getItem("authtoken");

		let addURL = Constants.APIURL + "/api/orgs/" + key + "/request";
		const addRes = await fetch(addURL, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
		});
		await addRes.json();
		// alert("Invite Sent to Network Admin!");
		this.updateNetworks();
		return;
	}

	async leaveNetwork(key: string) {
		this.setState({ isLoading: true, searchValue: '' });
		const token = window.localStorage.getItem("authtoken");

		let addURL = Constants.APIURL + "/api/orgs/" + key + "/leave";
		const addRes = await fetch(addURL, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
		});
		await addRes.json();
		this.updateNetworks();
		this.setState({ showModal: false });
		return;
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

		this.setState({
			isSearching: true,
			isSearchError: false
		})

		const token = window.localStorage.getItem("authtoken");

		if (this.state.searchValue === "") {
			this.resetTopNetworks();
			this.updateNetworks();
			this.setState({
				isSearching: false,
				isSearchError: false
			})
		} else {
			let url =
				Constants.APIURL + "/api/orgs/search/" + this.state.searchValue;
			const response = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
			});
			var searchResults = await response.json();

			if (searchResults.length !== 0) {
				var newResults: any = [];
				var ownedResults: any = [];
				var ownIndex = 0;
				let loopMax = 0;
				if (searchResults.length > 5) {
					loopMax = 5;
				} else {
					loopMax = searchResults.length;
				}
				let topInfoTemp: any = [];
				let topInfoRes: any = [];

				let netURL = Constants.APIURL + "/anon/orgs/";
				for (let i = 0; i < searchResults.length; i++) {
					if (i < loopMax) {
						topInfoRes = await fetch(netURL + searchResults[i]._id, {
							method: "GET",
							headers: {
								"Content-Type": "application/json",
								Authorization: token,
							},
						});
						topInfoTemp = await topInfoRes.json();
						newResults[i] = topInfoTemp;
						if (this.checkMembership(topInfoTemp._id)) {
							ownedResults[ownIndex++] = topInfoTemp;
						}
					} else {
						if (this.checkMembership(searchResults[i]._id)) {
							topInfoRes = await fetch(netURL + searchResults[i]._id, {
								method: "GET",
								headers: {
									"Content-Type": "application/json",
									Authorization: token,
								},
							});
							topInfoTemp = await topInfoRes.json();
							ownedResults[ownIndex++] = topInfoTemp;
						}
					}
				}
				this.setState(() => ({
					topNetworks: newResults,
					myNetworks: ownedResults,
					isSearching: false
				}));
			} else {
				// alert("No Networks Found with that Search");
				this.resetTopNetworks();
				// this.updateNetworks();

				this.setState({
					isSearching: false,
					isSearchError: true
				})
			}
		}
	}

	async componentDidMount() {

		if (!this.props.isAuth) {
			this.props.history.push("/login");
		} else {
			this.setState({ initing: true });
			await this.updateNetworks();

			await this.resetTopNetworks();

			let { myNetworks, topNetworks } = this.state;
			topNetworks = topNetworks.filter((network) => {

				return (
					myNetworks.filter((myNetwork) => myNetwork._id !== network._id).length <
					1
				);
			});

			this.setState({
				topNetworks,
				initing: false,
				isLoading: false
			});
		}
	}

	async openModal(org: any, event: any) {
		event.preventDefault();
		let show = true;
		const myElementToCheckIfClicksAreInsideOf = document.getElementsByClassName(
			"addNetworkPlus"
		);
		Array.from(myElementToCheckIfClicksAreInsideOf).forEach((el) => {
			if (el.contains(event.target)) {
				show = false;
			}
		});
		if (show) {
			this.setState({ isLoading: true });
			const token = window.localStorage.getItem("authtoken");
			let roomList = [];
			let count = 0;
			for (let i = 0; i < org.rooms.length; i++) {
				let url = Constants.APIURL + "/api/rooms/" + org.rooms[i];
				const response = await fetch(url, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: token,
					},
				});
				var roomResults = await response.json();
				if (roomResults) {
					roomList[count++] = roomResults;
				}
				if (count >= 3) {
					break;
				}
			}
			let orgGames: any = [];
			if (org.admins[0]) {
				let gamerUrl = Constants.APIURL + "/api/gamers/" + org.admins[0]._id;
				const gamerResponse = await fetch(gamerUrl, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: token,
					},
				});
				var gamerResults = await gamerResponse.json();
				orgGames = gamerResults.gamesPreferred;
			}
			let didJoin = this.checkMembership(org._id);
			let modalOrg: any = {
				id: org._id,
				title: org.name,
				joined: didJoin,
				admin: org.admins[0],
				members: org.members,
				open: org.isOpen,
				joinHandle: this.joinNetwork,
				requestHandle: this.requestNetwork,
				leaveHandle: this.leaveNetwork,
				rooms: roomList,
				games: orgGames,
				descr: org.description,
			};
			this.setState(() => ({
				showModal: true,
				currentOrg: modalOrg,
				isLoading: false,
			}));
		}
	}

	async createGroup() {
		
		// const token = window.localStorage.getItem("authtoken");
		// let didJoin = this.checkMembership(org._id);
		// let modalOrg: any = {
		// 	id: org._id,
		// 	title: org.name,
		// 	joined: didJoin,
		// 	admin: org.admins[0],
		// 	members: org.members,
		// 	open: org.isOpen,
		// 	joinHandle: this.joinNetwork,
		// 	requestHandle: this.requestNetwork,
		// 	leaveHandle: this.leaveNetwork,
		// 	rooms: roomList,
		// 	games: orgGames,
		// 	descr: org.description,
		// };
		this.setState(() => ({
			showModal: true,
			currentOrg: null,
			isLoading: false,
		}));
	}

	closeModal() {
		this.setState(() => ({
			showModal: false,
		}));
	}

	render() {
		let listOfOrgs: any;
		let listOfJoins: any;
		let i = 0;

		if (Array.isArray(this.state.myNetworks) && this.state.myNetworks.length) {
			listOfOrgs = this.state.myNetworks.map((org: any) => (
				<a
					href="#networkID"
					className={s.modalLink}
					key={"a" + org._id}
					onClick={(e) => this.openModal(org, e)}
				>
					<NetworkListItem
						key={org._id}
						id={org._id}
						title={org.name}
						members={org.members}
						joined={true}
						open={org.isOpen}
						joinHandle={async () => {
							await this.joinNetwork(org._id);
							let { myNetworks, topNetworks } = this.state;
							topNetworks = topNetworks.filter((network) => {
								return myNetworks.find(
									(myNetwork) => myNetwork._id !== network._id
								);
							});
							this.setState({ topNetworks });
						}}
						requestHandle={this.requestNetwork}
						leaveHandle={this.leaveNetwork}
						games={this.state.topNetworksGames[i++]}
					/>
				</a>
			));
		} else {
			listOfOrgs = null;
		}

		if (
			Array.isArray(this.state.topNetworks) &&
			this.state.topNetworks.length
		) {
			listOfJoins = this.state.topNetworks.map((org: any) => (
				<a
					href="#networkID"
					className={s.modalLink}
					key={"a" + org._id}
					onClick={(e) => this.openModal(org, e)}
				>
					<NetworkListItem
						key={org._id}
						id={org._id}
						title={org.name}
						members={org.members}
						joined={false}
						open={org.isOpen}
						joinHandle={async () => {
							await this.joinNetwork(org._id);
							let { myNetworks, topNetworks } = this.state;
							topNetworks = topNetworks.filter((network) => {
								return myNetworks.find(
									(myNetwork) => myNetwork._id !== network._id
								);
							});
							this.setState({ topNetworks });
						}}
						requestHandle={this.requestNetwork}
						leaveHandle={this.leaveNetwork}
						games={this.state.topNetworksGames[i++]}
					/>
				</a>
			));
		} else {
			listOfJoins = null;
		}


		let modal = null;
		if (this.state.showModal) {
			modal = (
				<GroupDetails
					groupId={this.state.currentOrg ? this.state.currentOrg.id : null}
					closeGroup={this.closeModal}
				/>

			);
		}

		if (!this.props.isAuth) {
			return null

		} else if (this.state.showModal) {
			return modal;

		} else {

			return (
				<>

					<PageModalHeader
						title={"Groups"}
						handleClose={this.props.handleClose}
						preloader={this.state.isLoading}
					>
						<PageModalSearch
							searchDefaultValue={this.state.searchValue}
							searchPlaceholder={"Search Groups"}
							searchOnChange={this.searchTermUpdate}
							searchOnSubmit={this.searchIt}
						/>
						<PageModalPlusButton handleClick={() => { }} />

					</PageModalHeader>

					<PageModalContent>
						<div className={s.networksContainer}>

							{!this.state.isLoading && (
								<div className={s.networksList}>

									{this.state.searchValue !== '' &&
										<div className={s.networksListGroup}>
											<h3>Join a network</h3>
											{this.state.isSearching &&
												<Preloader />
											}
											{!this.state.isSearchError && !this.state.isSearching &&
												<div className={s.networksListContent}>{listOfJoins}</div>
											}
											{this.state.isSearchError &&
												<p className={s.warning}>No results</p>
											}
										</div>
									}

									{this.state.searchValue === '' &&
										<div className={s.networksListGroup}>
											<h3>
												My Groups <div className={s.createGroup} onClick={() => this.createGroup()}> Create Group </div>

											</h3>
											

											{listOfOrgs !== null && (
												<div className={s.networksListContent}>{listOfOrgs}</div>
											)}
											{listOfOrgs === null && (
												<p className={s.warning}>No groups yet</p>
											)}
										</div>
									}

								</div>
							)}
						</div>
					</PageModalContent>

				</>
			);
		}
	}
}

export default Networks;
