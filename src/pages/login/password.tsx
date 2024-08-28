import React, {useEffect, useState} from 'react';
import { Button, Form} from 'react-bootstrap';
import { authenticationService } from '../../services/authentication.service';
import s from './login.module.css';
import {
	PageModalContent,
	PageModalHeader,
} from '../../components/pageModal/PageModal';
import toast from 'toasted-notes';

export default function Password(props: any){

    const [isSubmitted, setIsSubmitted] = useState(false);
	const [newPassword, setNewPassword] = useState("");
    const [verifyPassword, setVerifyPassword] = useState("");
    const [onSubmitError, setOnSubmitError] = useState('')
    const [isLoading, setLoading] = useState(false);

	const validateForm = () => {

		if (newPassword.length <= 6) {
            setOnSubmitError('Password must be at least 7 character long');
            return false;
		}
        else if(verifyPassword === '' || undefined){
            setOnSubmitError('Confirm password is empty');
            return false;
        }else if(newPassword !== verifyPassword){
            setOnSubmitError('Password mismatch');
            return false;
        }else{
            setOnSubmitError('');
            return true;
        }
    }

	async function handleSubmit(e: any) {

        setLoading(true);
        setIsSubmitted(true);

        if(validateForm()){

            try {
                if(e){
                    e.preventDefault();
                }

				const response = await authenticationService.updatePassword(newPassword, verifyPassword);

                if(response.status !== 200){
                    setOnSubmitError(response.statusText);
                } else {
					toast.notify('Password Updated!', {duration: 2000});
					setTimeout(function() {
						props.handleClose();
					}, 2000);
				}

            } catch (err) {
                console.log(err);
                setOnSubmitError(err);
            }
        }
		setLoading(false);
    }

    useEffect(() => {
        validateForm();
    }, [verifyPassword, newPassword])

    return (
		<>
			<PageModalHeader title={"Change Password"} handleClose={props.handleClose} preloader={isLoading} />

			<PageModalContent>
				
				<div className={s.login}>

					{onSubmitError !== '' && isSubmitted &&
                    <div className={s.errorMessage}>{onSubmitError}</div>
                    }
					<Form onSubmit={async(e: any) => handleSubmit(e)}>
						<Form.Group controlId="password">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                                value={newPassword}
                                onChange={(e: any) => setNewPassword(e.target.value)}
                                type="password"
                            />
                        </Form.Group>
                        <Form.Group controlId="confirmPassword">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                value={verifyPassword}
                                onChange={(e: any) => setVerifyPassword(e.target.value)}
                                type="password"
                            />
                        </Form.Group>
						
						<Button variant="primary" type="submit">
							Update Password
						</Button>
					</Form>
				</div>
			</PageModalContent>
		</>
    )
}