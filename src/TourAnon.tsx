import Tour from 'reactour';
import React, { useState } from 'react';
import { localSettingsService, UserSettings } from './services/localSettings.service';
import { useStoreState } from './store/hooks';
import { Link } from 'react-router-dom';
import demoSuggest from './assets/img/demo_suggest.jpg';


export const TourAnonPopup = () => {
 
    //set tour
	const tempSkipTour = useStoreState(state => state.tempSkipTour);
	const [skipTour, setSkipTour] = useState(tempSkipTour || localSettingsService.getSetting('skipTourAnon') || false);

    const steps = [
        {
            // selector: ".tourLogin",
            content: () => (
                <span>
                    <b>Welcome to RUIn!</b><br/>
                    Our goal is to help gamers schedule and coordinate their gaming sessions with others. 
                    <br/><br/>
                    We'll also help you find other gamers who play the same games at the same times as you.
                    <br/><br/>
                    Just let us know:<br/>
                    • what times you play<br/>
                    • what games you play<br/>
                    <img src={demoSuggest} alt="Suggested Times"></img>
                    <br/>
                    You'll need to <Link to='/login'>login</Link> or <Link to='/signup'>sign up</Link> to fully use the site. Until then, feel free to poke around.
                </span>
            )
        }
    ];
  
    return (
    <Tour
        steps={steps}
        isOpen={!skipTour}
        onRequestClose={() => {
            setSkipTour(true);
            localSettingsService.setSetting(UserSettings.skipTourAnon, true);
        }} 
        rounded={10}
        disableFocusLock={true}
        className={"helper"}
    />
    //disableFocusLock was preventing input boxes from working
    );

}