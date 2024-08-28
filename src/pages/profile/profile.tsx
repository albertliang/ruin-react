import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import s from "./profile.module.css";
import Avatar from "react-avatar-edit";
import Axios from "axios";
import { authenticationService } from '../../services/authentication.service'
import userDefaultImage from "../../assets/img/UserIcon.svg";
import {
    PageModalButtons,
    PageModalContent,
    PageModalHeader,
} from "../../components/pageModal/PageModal";
import validateEmail from '../../assets/libs/validateEmail'
import * as Constants from "../../constants";
import { Button } from "reactstrap";

const moment = require("moment-timezone");

function Profile(props: any) {

    if (!props.isAuth) {
        props.history.push("/login");
    }


    const [profilePic, setProfilePic] = useState(null);
    const [newPic, setNewPic] = useState(null);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [timezone, setTimezone] = useState("");
    const [uid, setUID] = useState("");
    const [isLoading, setLoading] = useState(false);
    const [onSubmitError, setOnSubmitError] = useState('')
    const [onSubmitSuccess, setOnSubmitSuccess] = useState(false)

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        async function getData() {
            setLoading(true);
            const url = Constants.APIURL + "/api/users/me";
            const token = window.localStorage.getItem("authtoken");
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
            });
            const temp = await response.json();

            setEmail(temp.email);
            setTimezone(temp.timezone);
            setUsername(temp.username);
            setUID(temp._id);



            if (uid) {
                const url2 = Constants.APIURL + "/api/gamers/" + uid;
                const response2 = await fetch(url2, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                    },
                });
                const temp2 = await response2.json();
                setProfilePic(temp2.avatarIcon);

                setLoading(false);
            }
        }

        getData();
    }, [profilePic, uid]);

    async function updateAvatar(image: any) {
        try {
            const token = window.localStorage.getItem("authtoken");
            await Axios.post(
                Constants.APIURL + "/api/gamer/avatar",
                { avatar: image },
                { headers: { Authorization: token } }
            );
        } catch (err) {
            console.log(err);
        }
    }

    async function handleSubmit(event: React.FormEvent<any>) {

        setLoading(true);
        setOnSubmitError('');

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (username === '' || undefined) {
            setOnSubmitError('Username is empty')
        } else if (email === '' || undefined) {
            setOnSubmitError('Email is empty')
        } else if (timezone === '' || undefined) {
            setOnSubmitError('Timezone is empty')
        } else if (!validateEmail(email)) {
            setOnSubmitError('Email is not valid')
        } else {

            // var data = {
            //     username: currUname !== "" ? currUname : undefined,
            //     email: currEmail !== "" ? currEmail : undefined,
            //     timezone: currTimezone !== "" ? currTimezone : undefined,
            // };

            let data = {
                username,
                email,
                timezone
            }

            const url = Constants.APIURL + "/api/users";
            const token = window.localStorage.getItem("authtoken");
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify(data),
            });

            await response.json();

            if (response.status === 200) {
                setOnSubmitSuccess(true)
            } else {
                setOnSubmitSuccess(false)
                setOnSubmitError(response.statusText)
            }
        }
        setLoading(false);
    }

    function handleUsername(e: any) {
        setUsername(e.currentTarget.value);
    }

    function handleEmail(e: any) {
        setEmail(e.currentTarget.value);
    }

    function handleTimezone(e: any) {
        setTimezone(e.currentTarget.value);
    }


    function renderOptions() {
        var temp = moment.tz.names();
        return temp.map((item: string) => {
            if (item === timezone)
                return (
                    <option selected key={item}>
                        {item}
                    </option>
                );
            else return <option key={item}>{item}</option>;
        });
    }

    function onSave() {
        updateAvatar(newPic);
        setProfilePic(newPic);
        setNewPic(null);
        setIsEditing(false);
    }

    function onClose() {
        setNewPic(null);
        setIsEditing(false);
    }

    function onCrop(preview: any) {
        setNewPic(preview);
    }

    function getPictureSection() {
        if (isEditing) {
            return (
                <div className={s.avatarContainer}>
                    <Avatar
                        width={120}
                        height={120}
                        onCrop={onCrop}
                        onClose={onClose}
                        src={newPic}
                    />
                    <Button onClick={onSave} type="button" color="info">Save</Button>
                </div>
            );
        } else {
            return (
                <div className={s.avatarContainer}>
                    <img
                        src={profilePic || userDefaultImage}
                        alt="No Profile Pic Selected!"
                        onClick={() => setIsEditing(true)}
                    />
                </div>
            );
        }
    }

    useEffect(() => {
        const validateForm = () => {
            if (username === '' || undefined) {
                setOnSubmitError('Username is empty')
            } else if (email === '' || undefined) {
                setOnSubmitError('Email is empty')
            } else if (timezone === '' || undefined) {
                setOnSubmitError('Timezone is empty')
            } else if (!validateEmail(email)) {
                setOnSubmitError('Email is not valid')
            } else {
                setOnSubmitError('')
            }

        }
        validateForm()
    }, [username, timezone, email])



    if (!props.isAuth) {
        return null
    }

    return (
        <>

            <PageModalHeader title={"Profile"} handleClose={props.handleClose} preloader={isLoading}>
                <PageModalButtons
                    buttons={[
                        {
                            title: "Update",
                            type: "common",
                            handleClick: handleSubmit,
                            disable: onSubmitError !== ''
                        }
                    ]}
                />
            </PageModalHeader>

            <PageModalContent>

                <div className={s.profileContent}>

                    {getPictureSection()}

                    {onSubmitError !== '' && !isLoading &&
                        <div className={s.errorMessage}>{onSubmitError}</div>
                    }

                    {onSubmitSuccess === true &&
                        <div className={s.successMessage}>Updated!</div>
                    }

                    <Form onSubmit={handleSubmit}>
                        <div className={s.formContent}>
                            <div className={s.formGroup}>
                                <label htmlFor="uname">Username</label>
                                <input
                                    id={"uname"}
                                    name={"uname"}
                                    defaultValue={username}
                                    onChange={handleUsername}
                                />
                            </div>

                            <div className={s.formGroup}>
                                <label htmlFor="eml">Email</label>
                                <input
                                    type={"email"}
                                    id={"eml"}
                                    name={"eml"}
                                    defaultValue={email}
                                    onChange={handleEmail}
                                />
                            </div>

                            <div className={s.formGroup}>
                                <label htmlFor="tmz">Timezone</label>
                                <select
                                    id={"tmz"}
                                    name={"tmz"}
                                    defaultValue={timezone}
                                    onChange={handleTimezone}
                                >
                                    {renderOptions()}
                                </select>
                            </div>
                        </div>
                    </Form>
                </div>

            </PageModalContent>

        </>
    );
}

export default Profile;
