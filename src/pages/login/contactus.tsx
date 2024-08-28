import React, {useState} from 'react'
import { authenticationService } from '../../services/authentication.service'
import {
	PageModalContent,
	PageModalHeader,
} from '../../components/pageModal/PageModal'
import { FormGroup } from 'react-bootstrap';
import { Button, Form, Input } from 'reactstrap';
import toast from 'toasted-notes';
import s from './login.module.css'

export default function ContactUs(props: any){

    const [message, setMessage] = useState('');

	async function handleSubmit(e: any) {
		try {
			if(e){
				e.preventDefault();
			}

			await authenticationService.contactUs(message);
			toast.notify('Feedback Sent!', {duration: 2000});
			setTimeout(function() {
				props.handleClose();
			}, 2000);

		} catch (err) {
			console.log(err);
		}
    }

    return (
		<>
			<PageModalHeader title={"Contact Us"} handleClose={props.handleClose} preloader={false} />

			<PageModalContent>
				<Form onSubmit={async(e: any) => handleSubmit(e)}>
					<FormGroup>
						<Input
							type="textarea"
							name="message"
							placeholder="What's up?"
							className="border-input"
							onChange={(e: any) => setMessage(e.target.value)}
						/>
					</FormGroup>
					<Button variant="primary" type="submit">
						Send
					</Button>
				</Form>
			</PageModalContent>
		</>
    ) 
}