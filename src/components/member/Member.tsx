import React from "react";
import s from "./Member.module.css";
import cn from "classnames";
import userDefaultImg from "../../assets/img/UserIcon.svg";
import isLeaderImg from "../../assets/img/crown.svg";
import {IoMdAdd, IoMdClose} from 'react-icons/io'
import * as Constants from "../../constants";

type MemberPropsType = {
  status: "online" | "inGame" | "offline";
  userId: number;
  userName: string;
  userImage?: string;
  isFriend: boolean;
  isLeader?: boolean;
  removeFriend?: any;
};

const Member: React.FC<MemberPropsType> = ({
  status,
  userId,
  userName,
  userImage,
  isFriend,
  removeFriend,
  isLeader = false,
}) => {
  const defineStatusCssClass = () => {
    let addClass;
    if (status === "online") {
      addClass = s.isOnline;
    } else if (status === "inGame") {
      addClass = s.isInGame;
    } else {
      addClass = s.isOffline;
    }
    return addClass;
  };

  const addFriend = async (userId: number) => {
    const url = Constants.APIURL + "/api/gamer/friends/add/";
    const token = window.localStorage.getItem("authtoken");
    await fetch(url + userId, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });
    window.location.reload(false);
  };

  return (
    <div className={cn(s.member, defineStatusCssClass())}>
      <div className={s.avatar}>
        <img src={userImage || userDefaultImg} alt={userName} />
      </div>
      <div className={s.info}>
        <strong className={s.name}>{userName}</strong>
        {/* <div className={s.onlineInfo}>Online: Steam</div> */}
      </div>
      <div className={s.buttons}>
        {isLeader && (
          <div
            onClick={() => addFriend(userId)}
            className={cn(s.button, s.isLeaderImage)}
          >
            <img src={isLeaderImg} alt="Group Admin" />
          </div>
        )}
        {!isFriend && (
          <div
            className={cn(s.button, s.add)}
            onClick={() => addFriend(userId)}
          >
            <IoMdAdd style={{ width: "20px", height: "20px" }} />
          </div>
        )}
        {isFriend && (
          <div
            className={cn(s.button, s.delete)}
            onClick={removeFriend}
          >
            <IoMdClose style={{ width: "20px", height: "20px" }} />

          </div>
        )}
      </div>
    </div>
  );
};

export default Member;
