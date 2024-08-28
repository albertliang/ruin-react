import React, { Suspense, useState } from 'react';
import Dashboard from './pages/dashboard/Dashboard';
//If we need anything like query params or prompts, add them here
import {
	HashRouter,
	Switch,
	Route,
	useHistory,
	Redirect
} from "react-router-dom";

import PageModal from './components/pageModal/PageModal'
import FooterNav from './components/footerNav/FooterNav';
import { useStoreActions, useStoreState } from "./store/hooks";
import { authenticationService as auth } from "./services/authentication.service";
import axios from 'axios';
import _ from 'lodash';
import { TourPopup } from './Tour';
import { TourAnonPopup } from './TourAnon';
import VerifyEmail from './pages/login/verify';
import Forgot from './pages/login/forgot';
import Password from './pages/login/password';
import ContactUs from './pages/login/contactus';
import HttpsRedirect from "react-https-redirect";

const Login = React.lazy(() => import('./pages/login/login'));
const Signup = React.lazy(() => import('./pages/login/signup'));
const Availability = React.lazy(() => import('./pages/availability/Availability'));
const Games = React.lazy(() => import('./pages/games/Games'));
const Networks = React.lazy(() => import('./pages/networks/Networks'));
const Friends = React.lazy(() => import('./pages/friends/Friends'));
const Profile = React.lazy(() => import('./pages/profile/profile'));
 
export default function NavigationWithRouter() {
	return (
		<>
			<HttpsRedirect>
				<WwwRedirect>
					<HashRouter>
						<Navigation />
					</HashRouter>
				</WwwRedirect>
			</HttpsRedirect>
		</>
	)
}

function WwwRedirect(ref: any) {
	if (window.location && window.location.hostname.startsWith("www.")) {
		window.location.href = window.location.href.replace(/www\./, '');
		return null;
	}
 
	return ( 
		<>
		{ref.children}
		</>
	);
}

function Navigation() {

	const [isAuth, setIsAuth] = useState(!!auth.isAuthenticated())
	const history = useHistory();
	const setDeepLinkRoomId = useStoreActions(actions => actions.setDeepLinkRoomId);
	const setDeepLinkOccurrenceDate = useStoreActions(actions => actions.setDeepLinkOccurrenceDate);
	const setDisplayGroupId = useStoreActions(actions => actions.setDisplayGroupId);
	const skipTourTemp = useStoreActions(actions => actions.skipTourTemp);
	const hasAvail = useStoreState(state => state.hasAvail);
	const hasGames = useStoreState(state => state.hasGames);

	const handleClose = () => {
		history.push("/");
		window.location.reload();
	}

	// Response interceptors, redirect 401 unauthorized responses to login
	axios.interceptors.response.use(response => {
		return response;
	}, err => {
		if (_.get(err.response, 'status') === 401 &&
			!err.config.__isRetryRequest)
		{
			auth.logout();
			history.replace("/login");
		}
		return Promise.reject(err);
	});

	return (

		<div>
			<Switch>

				<Route path="/availability">
					<Suspense fallback={<div>Loading...</div>}>
						<PageModal handleClose={handleClose}>
							<Availability isAuth={isAuth} history={history} time={""} handleClose={handleClose} />
						</PageModal>
					</Suspense>
				</Route>

				<Route path="/games">
					<Suspense fallback={<div>Loading...</div>}>
						<PageModal handleClose={handleClose}>
							<Games isAuth={isAuth} history={history} handleClose={handleClose} />
						</PageModal>
					</Suspense>
				</Route>

				<Route path="/friends">
					<Suspense fallback={<div>Loading...</div>}>
						<PageModal handleClose={handleClose}>
							<Friends isAuth={isAuth} history={history} handleClose={handleClose} />
						</PageModal>
					</Suspense>
				</Route>

				<Route path="/groups">
					<Suspense fallback={<div>Loading...</div>}>
						<PageModal handleClose={handleClose}>
							<Networks isAuth={isAuth} history={history} handleClose={handleClose} />
						</PageModal>
					</Suspense>
				</Route>

				<Route path="/profile">
					<Suspense fallback={<div>Loading...</div>}>
						<PageModal handleClose={handleClose}>
							<Profile isAuth={isAuth} setIsAuth={setIsAuth} history={history} handleClose={handleClose} />
						</PageModal>
					</Suspense>
				</Route>

				<Route path="/signup">
					<Suspense fallback={<div>Loading...</div>}>
						<PageModal handleClose={handleClose} isTop={true}>
							<Signup isAuth={isAuth} setIsAuth={setIsAuth} history={history} handleClose={handleClose} />
						</PageModal>
					</Suspense>
				</Route>

				<Route path="/login">
					<Suspense fallback={<div>Loading...</div>}>
						<PageModal handleClose={handleClose} isTop={true}>
							<Login isAuth={isAuth} setIsAuth={setIsAuth} history={history} handleClose={handleClose} />
						</PageModal>
					</Suspense>
				</Route>

				<Route path="/forgot">
					<PageModal handleClose={handleClose} isTop={true}>
						<Forgot handleClose={handleClose} />
					</PageModal>
				</Route>

				<Route path="/password">
					<PageModal handleClose={handleClose} isTop={true}>
						<Password handleClose={handleClose} />
					</PageModal>
				</Route>

				<Route path="/verify/:token" render={(props) => {
					return (
						<PageModal handleClose={handleClose} isTop={true}>
							<VerifyEmail handleClose={handleClose} token={props.match.params.token}/>
						</PageModal>
					);
				}}/>

				<Route path="/contactus">
					<PageModal handleClose={handleClose} isTop={true}>
						<ContactUs handleClose={handleClose} />
					</PageModal>
				</Route>
					
			</Switch>

			<Switch>
				{/* route for deep link series */}
				<Route path="/rooms/:roomIdParam/series/:occurrenceDateParam" render={(props) => {
					setDeepLinkRoomId(props.match.params.roomIdParam);
					setDeepLinkOccurrenceDate(props.match.params.occurrenceDateParam);
					skipTourTemp();
					return ( <Redirect to="/" /> ); }} 
				/>
				{/* route for deep link */}
				<Route path="/rooms/:roomIdParam" render={(props) => {
					setDeepLinkRoomId(props.match.params.roomIdParam);
					skipTourTemp();
					return ( <Redirect to="/" /> ); }} 
				/>
				{/* route for group deep link */}
				<Route path="/groups/:groupIdParam" render={(props) => {
					setDisplayGroupId(props.match.params.groupIdParam);
					skipTourTemp();
					return ( <Redirect to="/" /> ); }} 
				/>
				
				{/* always load the dashboard*/}
				<Dashboard />

			</Switch>

			<FooterNav isAuth={isAuth} hasAvail={hasAvail} hasGames={hasGames} />
			
			{isAuth &&
			<TourPopup />
			}
			{!isAuth &&
			<TourAnonPopup />
			}
		</div>

	);
}

