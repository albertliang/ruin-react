import React, {useEffect, useState} from 'react'
import { Button, Form} from 'react-bootstrap';
import { authenticationService } from '../../services/authentication.service'
import { Link } from 'react-router-dom';
import s from './login.module.css'
import { useStoreActions } from "../../store/hooks";
import {
	PageModalContent,
	PageModalHeader,
} from '../../components/pageModal/PageModal'

export default function Login(props: any){
	
    const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const [isLoading, setisLoading] = useState(true);
	const forceRefresh = useStoreActions(actions => actions.forceRefresh);
	
	function validateForm() {
		return username.length > 0 && password.length > 0;
	}

	async function handleSubmit(e: any) {
		try {
			if(e){
				e.preventDefault();
			}

			const isAuthenticated = await authenticationService.login(username, password);

			if (isAuthenticated) {
				// redirect to dashboard
				setMessage(null);
				forceRefresh();
				props.setIsAuth(true)
				props.history.push('/');

			} else {
				setMessage('Username and password do not match');
				props.setIsAuth(false)
			}
			
		} catch (err) {
			console.log(err);
			props.setIsAuth(false)
		}
    }

    useEffect(() => {
		validateForm();
		setisLoading(false);
	},[username, password, validateForm] )

    return(
		<>
			<PageModalHeader title={"Login"} handleClose={props.handleClose} preloader={isLoading} />

			<PageModalContent>
				<div className={s.login}>
					{message &&
						<div className={s.errorMessage}>{message}</div>
					}
					<Form onSubmit={async(e: any) => handleSubmit(e)}>
						<Form.Group controlId="email">
							<Form.Label>Username</Form.Label>
							<Form.Control
								autoFocus
								value={username}
								onChange={(e: any) => setUsername(e.target.value)}
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
						<Button variant="primary" type="submit">
							Login
						</Button>
					</Form>
					<br/>
					<Link className={s.left} to="/signup"> Create New Account</Link><Link className={s.right} to="/forgot"> Forgot Password</Link>
				</div>
			</PageModalContent>
		</>
    )
}