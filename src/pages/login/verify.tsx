import React, {useEffect, useState} from 'react'
import { authenticationService } from '../../services/authentication.service'
import s from './login.module.css'
import {
	PageModalContent,
	PageModalHeader,
} from '../../components/pageModal/PageModal'

export default function VerifyEmail(props: any){

    const [isVerified, setIsVerified] = useState(false);
	const [isLoading, setisLoading] = useState(true);

	async function verifyEmail(token: string) {
		const result = await authenticationService.verifyToken(token);
		setIsVerified(result);
	}

	useEffect(() => {
		verifyEmail(props.token); 
		setisLoading(false);
	},[])

    return (
		<>
			<PageModalHeader title={"Verifying Email Token"} handleClose={props.handleClose} preloader={isLoading} />

			<PageModalContent>
				{isVerified &&
				<div className={s.login}>
					Success! Email token verified! You're now logged in.
				</div>
				}
				{!isVerified &&
				<div className={s.errorMessage}>
					Verification token expired or couldn't be found! 
					<p/>
					Try resending a token or creating a new user.
				</div>
				}
			</PageModalContent>
		</>
    )
}