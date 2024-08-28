import React from "react";
import s from "./NetworkListItem.module.css";
import gameDefaultImg from "../../../assets/img/game.png";
// import userDefaultImg from "../../../assets/img/UserIcon.svg";
import { IoMdAdd } from 'react-icons/io'

type memberType = {
	id: string;
	img: string;
};
type gameType = {
	id: string;
	img: string;
};

type NetworkListItemProps = {
	id: string;
	title: string;
	members: any;
	joined: boolean;
	open: boolean;
	joinHandle: any;
	requestHandle: any;
	leaveHandle: any;
	games: any;
};

const NetworkListItem: React.FC<NetworkListItemProps> = React.memo((props) => {
	const {
		title,
		members,
		joined,
		joinHandle,
		games,
	} = props;

	const membersCount = members.length;
	const gamesCount = games ? games.length : 0;
	const maxGamesToShow = 3;

	const gamesToShow = () => {
		let gamesToShowArray = [];
		for (let i = 0; i < maxGamesToShow && i < gamesCount; i++) {
			gamesToShowArray.push(games[i]);
		}
		return gamesToShowArray;
	};

	return (
		<div className={s.networkItemList}>
			<div className={s.leftGridPart}>
				<div className={s.title}>{title}</div>

				<div className={s.games}>
					<ul>
						{gamesToShow().map((game: any) => {
							return (
								<li>
									<img src={game.img || gameDefaultImg} alt="" />
								</li>
							);
						})}
					</ul>
				</div>
			</div>
			<div className={s.members}>
				<p className={s.otherMembers}>
					{membersCount} Members
          		</p>
			</div>

			{!joined && (
				<div className="addNetworkPlus networkItemButtons">
					<div className={s.button}>
						<IoMdAdd onClick={joinHandle} style={{ width: "20px", height: "20px" }} />
					</div>
				</div>
			)}
		</div>
	);
});

export default NetworkListItem;
