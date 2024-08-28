import React, {useEffect, useState} from 'react'
import { Button, Form} from 'react-bootstrap';
import { authenticationService } from '../../services/authentication.service'
import s from './login.module.css'
import {
	PageModalContent,
	PageModalHeader,
} from '../../components/pageModal/PageModal'

export default function Forgot(props: any){

    const [isSubmitted, setIsSubmitted] = useState(false);
	const [email, setEmail] = useState("");
	const [isLoading, setisLoading] = useState(true);

	async function handleSubmit(e: any) {
		try {
			if(e){ e.preventDefault(); }
			setIsSubmitted(true);
			await authenticationService.sendLoginToken(email);
			
		} catch (err) {
			console.log(err);
		}
    }

	useEffect(() => {
		setisLoading(false);
	},[])

    return (
		<>
			<PageModalHeader title={"Forgot Password"} handleClose={props.handleClose} preloader={isLoading} />

			<PageModalContent>
				{isSubmitted &&
				<div className={s.login}>
					Login token send to the specified email! Please check your email.
				</div>
				}
				{!isSubmitted &&
				<div className={s.login}>
					<Form onSubmit={async(e: any) => handleSubmit(e)}>
						<Form.Group controlId="email">
							<Form.Label>Email</Form.Label>
							<Form.Control
								autoFocus
								value={email}
								onChange={(e: any) => setEmail(e.target.value)}
							/>
						</Form.Group>
						
						<Button variant="primary" type="submit">
							Send Login Link
						</Button>
					</Form>
				</div>
				}
			</PageModalContent>
		</>
    )
}