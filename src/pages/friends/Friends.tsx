import React, { useState, useEffect } from "react";
import s from "./Friends.module.css";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import "./Friends.module.css";
import Member from "../../components/member/Member";
import Preloader from "../../components/preloader/preloader";
import {
	PageModalContent,
	PageModalHeader,
	PageModalSearch,
} from "../../components/pageModal/PageModal";
import { isEmptyArray } from 'formik'
import delay from '../../assets/libs/delay'
import * as Constants from "../../constants";


function Friends(props: any) {

	if (!props.isAuth) {
		props.history.push("/login");
	}

	const [friendsList, setFriendsList] = useState([]);
	const [baseFriendsList, setBase] = useState([]);
	const [othersList, setOthersList] = useState([]);
	const [flag, setFlag] = useState(true);
	const [inputText, setInputText] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isSearching, setIsSearching] = useState(false);
	const [isSearchError, setIsSearchError] = useState(false);

	//this needs to have an additonal argument added to the end so that it doesn't run every update

	useEffect(() => {
		getData();
	}, [friendsList, flag]);

	async function getData() {
		const url = Constants.APIURL + "/api/gamer";
		const token = window.localStorage.getItem("authtoken");
		const response = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
		});
		const temp = await response.json();
		setBase(temp.friends);

		if (flag) {
			setFlag(false);
			setFriendsList(temp.friends);
		}
		setIsLoading(false);
	}

	async function removeFriend(e: any, friendId: string) {
		setIsLoading(true);
		const url = Constants.APIURL + "/api/gamer/friends/remove/";
		const token = window.localStorage.getItem("authtoken");
		await fetch(url + friendId, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
		});
		await getData();
		// const temp = await response.json()
		//console.log(temp)
	}

	async function addFriend(e: any, friendId: string) {
		setIsLoading(true);
		const url = Constants.APIURL + "/api/gamer/friends/add/";
		const token = window.localStorage.getItem("authtoken");
		await fetch(url + friendId, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
		});
		window.location.reload(false);
		//const temp = await response.json()
	}

	//meant to return a list of 2 lists for friends and not friends
	function checkFriends(searchList: any[]) {
		var res = [];
		var fr = [];
		var ot = [];

		for (const elem of searchList) {
			console.log(elem);
			var isFriend = false;
			for (const friend of baseFriendsList) {
				if (friend.username === elem.username) {
					isFriend = true;
				}
			}
			if (isFriend) {
				fr.push(elem);
			} else ot.push(elem);
		}

		res[0] = fr;
		res[1] = ot;
		return res;
	}

	const searchTermUpdate = (e: any) => {
		e.persist();
		setInputText(e.target.value);
		setIsSearching(true)
		setIsSearchError(false)
		delay(doSearch(e.target.value), 500)
	}

	async function doSearch(searchTerm: any) {
		setIsSearching(true)
		setIsSearchError(false)

		if (searchTerm) {
			const url = Constants.APIURL + "/api/gamers/search/";
			const token = window.localStorage.getItem("authtoken");
			const response = await fetch(url + searchTerm, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
			});
			const temp = await response.json();
			const res = checkFriends(temp);

			setFriendsList(res[0]);
			setOthersList(res[1]);

			if (isEmptyArray(res[1])) {
				setIsSearchError(true)
			}
			setIsSearching(false)
		} else {
			setFriendsList(baseFriendsList);
			setOthersList([]);
			setIsSearching(false)
		}
	}


	if (!props.isAuth)
		return null


	return (
		<>

			<PageModalHeader title={"Friends"} handleClose={props.handleClose} preloader={isLoading}>
				<PageModalSearch
					searchDefaultValue={inputText}
					searchPlaceholder={"Enter a username to search"}
					searchOnChange={searchTermUpdate}
					searchOnSubmit={doSearch}
				/>
			</PageModalHeader>

			<PageModalContent>
				<div className={s.friendsContainer}>

					{inputText !== "" && (
						<div className={s.searchList}>
							<h3>Search Results</h3>

							{isSearching &&
								<Preloader />
							}

							{isSearchError &&
								<p className={s.friendsWarning}>No results</p>
							}

							{!isSearching && othersList.map((item) => {
								return (
									<Member
										key={item._id}
										status={"inGame"}
										userId={item._id}
										userName={item.username}
										isFriend={friendsList.includes(item)}
										removeFriend={(e: any) => removeFriend(e, item._id)}
									/>
								);
							})}
						</div>
					)}

					{inputText === "" && (
						<div className={s.friendsList}>
							<h3>My Friends</h3>
							{baseFriendsList.map((item) => {
								return (
									<Member
										key={item._id}
										status={"inGame"}
										userId={item._id}
										userName={item.username}
										isFriend={true}
										removeFriend={(e: any) => removeFriend(e, item._id)}
									/>
								);
							})}
						</div>
					)}
				</div>
			</PageModalContent>
		</>
	);
}

export default Friends;
