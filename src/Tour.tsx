import Tour from 'reactour';
import React, { useState } from 'react';
import { localSettingsService, UserSettings } from './services/localSettings.service';
import { Link, useHistory } from 'react-router-dom';
import { useStoreState, useStoreActions } from './store/hooks';
import { authenticationService as auth } from './services/authentication.service';
import moment from 'moment';

export const TourPopup = () => {
 
    //set tour
	const tempSkipTour = useStoreState(state => state.tempSkipTour);
	const [skipTour, setSkipTour] = useState(tempSkipTour || localSettingsService.getSetting('skipTour') || false);
    const history = useHistory();
	const openRoom = useStoreActions(actions => actions.openRoom);
    const closeRoom = useStoreActions(actions => actions.closeRoom);
	const openGroup = useStoreActions(actions => actions.setDisplayGroupId);
	const closeGroup = useStoreActions(actions => actions.closeGroup);
    
	const userid = auth.getUserId();
	const username = auth.getUsername();

    const openFakeRoom = () => {
        let startTime = moment().minutes(0).add(1, 'hours');
        if (moment().diff(startTime, 'minutes') < 60)
            startTime = startTime.add(1, 'hours');
        const hostPlayer = {
            gamer: userid,
            isCommitted: true,
            username: username
        };
        const comments = [
            {comment: "I love comments!", ts: startTime.toDate(), username},
            {comment: "Me too!", ts: startTime.add(5, 'minutes').toDate(), username: "SomeOtherGuy"},
        ];
            
        const roomInfo: any = {
            _id: "ThisIsASampleRoom",
            game: "11137",
            platformId: "steam",
            host: userid,
            description: "Totally not a real room",
            hostUsername: "Dakhath",
            hostTimezone: auth.getUserTimezone(),
            comments: comments,
            privacyLevel: 5,
            startTime: startTime.toDate(),
            maxPlayers: 4,
            gameMode: "Let's Play!",
            isRepeat: false,
            roomCategory: "user",
            players: [hostPlayer]
        }
        openRoom(roomInfo);
    }

    const steps = [
        {
            content: () => (
                <span>
                    <b>Welcome to RUIn!</b><br/>
                    Our goal is to match you with gamers who play the same games at the same times as you. 
                    <br/><br/>
                    Let's get started!
                </span>
            )
        },
        {
            selector: '.tourAvailability',
            content: () => (
                <div>
                    <b>When are you usually free?</b><br/>
                    We'll only show you as available if you let us know when you usually game. 
                    <br/><br/>
                    Click-and-drag to select which times you're usually available to play.
                </div>
            ),
            action: () => {
                if (history.location.pathname !== "/availability")
                {
                    history.push("/availability");
                }
            },
            mutationObservables: ['.tourAvailability'],
            style: {
                border: 0
            }
        },
        {
            selector: '.tourGames',
            content: () => (
                <div>
                    <b>What games do you want to play?</b><br/>
                    By adding games you're interested in, we can match you with others based on which games you have in common.
                    <br/><br/>
                    You can also "favorite" up to 5 games; We'll suggest times and players who are available based on that.
                </div>
            ),
            action: () => {
                if (history.location.pathname !== "/games")
                {
                    history.push("/games");
                }
            },
            mutationObservables: ['.tourGames'],
        },
        {
            content: () => (
                <div>
                    <b>Plan to Play</b><br/>
                    Rooms are your gathering place for playing a specific game at a specific time.
                    <br/><br/>
                    Here, you can see who else owns this game and their availability.
                </div>
            ),
            action: () => {
                if (history.location.pathname !== "/")
                {
                    history.push("/");
                } else {
                    openFakeRoom();
                }
            }
        },
        {
            selector: '.tourDeepLink',
            content: () => (
                <div>
                    <b>Invite friends and group members to your room</b><br/>
                    People don't always magically show up by themselves, so don't be shy about asking others to join.
                    <br/><br/>
                    Anyone can access this room using this link. Post or email where others can see it and they'll be able to join.
                </div>
            ),
            action: () => {
                closeGroup();
            }
        },
        {
            selector: '.tourGroupDemo',
            content: () => (
                <div>
                    <b>Create a Group</b><br/>
                    Create groups and invite people to join them to make coordination easier. You'll be able to see how many people are available for each game the group plays.
                    <br/><br/>
                    From there, you can create a room for that game and time.
                </div>
            ),
            action: () => {
                closeRoom();

                if (history.location.pathname !== "/groups")
                {
                    openGroup("60b6fa04b17b9d5e4ca39049");
                    history.push("/groups");
                } 
            },
            mutationObservables: ['.tourGroupDemo'],
        },
        {
            content: () => (
                <div>
                    <b>And... we're done!</b><br/>
                    We hope you'll find RUIn to be a handy tool to help organize how you play games.
                    <br/><br/>
                    If you have any feedback or questions, please <Link to='/contactus'>Contact Us</Link> and let us know!
                    <br/><br/>
                    Thanks!
                </div> 
            ),
            action: () => {
                closeRoom();
                closeGroup();
                if (history.location.pathname !== "/")
                {
                    history.push("/");
                }
            }
        }
        
    ];
  
    return (
    <Tour
        steps={steps}
        isOpen={!skipTour}
        onRequestClose={() => {
            closeRoom();
            setSkipTour(true);
            localSettingsService.setSetting(UserSettings.skipTour, true);
        }} 
        rounded={10}
        disableFocusLock={true}
    />
    //disableFocusLock was preventing input boxes from working
    );

}