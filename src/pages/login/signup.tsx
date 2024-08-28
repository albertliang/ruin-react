import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form} from 'react-bootstrap';
import { authenticationService } from '../../services/authentication.service'
import moment from 'moment-timezone';
import { Link } from 'react-router-dom';
import { useStoreActions } from "../../store/hooks";
import s from './signup.module.css'
import {PageModalContent, PageModalHeader} from '../../components/pageModal/PageModal'
import validateEmail from '../../assets/libs/validateEmail'
import * as Constants from "../../constants";

export default function Signup(props: any){

    const [show, setShow] = useState(true);
    const handleClose = () => setShow(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confPassword, setconfPassword] = useState("");
    const [email, setEmail] = useState("");
    const forceRefresh = useStoreActions(actions => actions.forceRefresh);
    const [isLoading, setLoading] = useState(false);
    const [isValidated, setIsValidated] = useState(false);
    const [onSubmitError, setOnSubmitError] = useState('')
    const [isSubmited, setIsSubmited] = useState(false)
    const [onSubmitSuccess, setOnSubmitSuccess] = useState(false)

    var timezones = moment.tz.names().map((tz: string) => {
        return {value: tz, label: tz };
    });
 
    const [timezone, setTimezone] = useState(timezones.find(tz => tz.value === moment.tz.guess()));
    const search = props && props.location ? props.location.search : null;
    const redirectToGroup = new URLSearchParams(search).get('redirectToGroup');

    useEffect(() => {
        setLoading(false)
    }, [])

    function renderOptions() {
        var temp = moment.tz.names();

        return temp.map((item: string) => {
            if (item === timezone.value)
                return (
                    <option selected key={item}>
                        {item}
                    </option>
                );
            else return <option key={item}>{item}</option>;
        });
    }

    const validateForm = async () => {
        if(username === '' || undefined){
            setOnSubmitError('Username is empty');
        }else if(email === '' || undefined){
            setOnSubmitError('Email is empty');
        }else if(password === '' || undefined){
            setOnSubmitError('Password is empty');
        }else if(confPassword === '' || undefined){
            setOnSubmitError('Confirm password is empty');
        }else if(password !== confPassword){
            setOnSubmitError('Password mismatch');
        }else if(!validateEmail(email)){
            setOnSubmitError('Email is not valid');
        }else{

            //check username and email
            const isEmailUnique = await authenticationService.isUniqueEmail(email, '');
            const isUsernameUnique = await authenticationService.isUniqueUsername(username, '');

            if (!isUsernameUnique) {
                setOnSubmitError('Username is already in use');
            } else if (!isEmailUnique) {
                setOnSubmitError('Email is already in use. Maybe send a forgot link?');
            } else {
                setOnSubmitError('');
                setIsValidated(true);
                return;
            }
            
        }
        setIsValidated(false);
    }

    useEffect(() => {
        validateForm();
    }, [username, confPassword, password, timezone, email])

	async function handleSubmit(e: any) {

        setLoading(true);
        setIsSubmited(true);

        if(e){
            e.preventDefault();
        }

        if(isValidated){

            try {
                const response = await axios.post(Constants.APIURL + "/auth/signup", {username, email, password, timezone: timezone.value},
                    { headers: { 'Content-Type': 'application/json' } }
                );

                if(response.status === 200){
                    setOnSubmitSuccess(true);
                    // login with provided creds
                    await authenticationService.login(username, password);

                    props.setIsAuth(true);

                    // redirect to dashboard
                    // forceRefresh();
                    if (redirectToGroup) {
                        props.history.push('/groups/' + redirectToGroup);
                    }
                    else {
                        props.history.push('/');
                    }
                    // handleClose();
                } else{
                    setOnSubmitSuccess(false);
                    props.setIsAuth(false);
                    setOnSubmitError(response.statusText);
                    setLoading(false);
                }

            } catch (err) {
                console.log(err);
                setOnSubmitError(err);
                setLoading(false);
                props.setIsAuth(false);
            }
        }

        setLoading(false);

    }

    return(
        <div>
            <PageModalHeader title={"Sign Up"} handleClose={props.handleClose}  preloader={isLoading} />

            <PageModalContent>
                <div className={s.signup}>

                    {onSubmitError !== '' && !isLoading && isSubmited &&
                    <div className={s.errorMessage}>{onSubmitError}</div>
                    }

                    {onSubmitSuccess === true && isSubmited &&
                    <div className={s.successMessage}>Updated!</div>
                    }

                    <Form onSubmit={async(e: any) => handleSubmit(e)}>
                        <Form.Group controlId="username">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                autoFocus
                                value={username}
                                onChange={(e: any) => setUsername(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                value={email}
                                onChange={(e: any) => setEmail(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                value={password}
                                onChange={(e: any) => setPassword(e.target.value)}
                                type="password"
                            />
                        </Form.Group>
                        <Form.Group controlId="confirmPassword">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                value={confPassword}
                                onChange={(e: any) => setconfPassword(e.target.value)}
                                type="password"
                            />
                        </Form.Group>

                        <Form.Group controlId="timezone">
                            <Form.Label>Timezone</Form.Label>
                            <select
                                id={"tmz"}
                                defaultValue={timezone.value}
                                name={"timezone"}
                                onChange={(value: any) => setTimezone(value) }
                            >
                                {renderOptions()}
                            </select>
                        </Form.Group>

                        <Button variant="primary" type="submit">
							Sign Up
						</Button>
    					<Link to="/login">Login to Existing Account</Link>
                    </Form>

                </div>
            </PageModalContent>
        </div>
    )
}