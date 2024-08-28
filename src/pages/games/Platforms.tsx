import React, { useState, useEffect, useReducer } from "react";
import PageModal, {
    PageModalContent,
    PageModalHeader,
    PageModalButtons,
} from "../../components/pageModal/PageModal";
import * as Constants from "../../constants";
import { authenticationService as auth } from "../../services/authentication.service";
import axios from "axios";
import steamImg from '../../assets/img/platforms/steam.png';
import xblImg from '../../assets/img/platforms/xbl.png';
import psnImg from '../../assets/img/platforms/psn.png';
import nintendoImg from '../../assets/img/platforms/nintendo.png';
import epicImg from '../../assets/img/platforms/epic.png';
import originImg from '../../assets/img/platforms/origin.png';
import uplayImg from '../../assets/img/platforms/uplay.png';
import bnetImg from '../../assets/img/platforms/bnet.png';
import gogImg from '../../assets/img/platforms/gog.png';
import { FormGroup, Input, Label } from "reactstrap";
import { useHistory } from "react-router-dom";
import s from './Platforms.module.css';
import toast from 'toasted-notes';

interface IDispatchAction {
    field: string;
    value: any;
}

interface IPlatformProps {
    handleClose: () => void;
}

function reducer(state: Record<string, string>, action: IDispatchAction) {
    if (action.field == 'ALL') {
        return action.value;
    }
    return { ...state, [action.field]: action.value };
}

function Platforms(props: IPlatformProps) {

	const history = useHistory();

    if (!auth.isAuthenticated()) {
        history.push("/login");
    }

    const [platformState, dispatch] = useReducer(reducer, null);

    const headerOptions = auth.getHeaderOptions();
    const platformNames = ["xbl", "psn", "nintendo", "steam", "epic", "uplay", "origin", "gog", "bnet" ];

    //this needs to have an additonal argument added to the end so that it doesn't run every update

    useEffect(() => {
        getPlatformData();
    }, []);

    async function getPlatformData() {
        const url = Constants.APIURL + "/api/gamer/platforms";
        const response = await axios.get(url, headerOptions);
        const result: any = response.data;
        if (result) {
            dispatch({field: 'ALL', value: result});
            // platformNames.forEach(p => dispatch({field: p, value: result[p]}));
        }
    }

    async function savePlatformData() {
        const url = Constants.APIURL + "/api/gamer/platforms/";
        await axios.put(url, platformState, headerOptions);
        toast.notify('Saved!', {duration: 2000});
    }

    const onChange = (e: any) => {
        dispatch({ field: e.target.name, value: e.target.value });
    }

    function getPlatformImage(platform: string) {
        switch (platform) {
            case "steam":
                return steamImg;
            case "epic":
                return epicImg;
            case "origin":
                return originImg;
            case "uplay":
                return uplayImg;
            case "bnet":
                return bnetImg;
            case "gog":
                return gogImg;
            case "xbl":
                return xblImg;
            case "psn":
                return psnImg;
            case "nintendo":
                return nintendoImg;
        }
    }

    return (
        <PageModal handleClose={props.handleClose}>

            <PageModalHeader title={"Platforms"} handleClose={props.handleClose} >
                <PageModalButtons
                    buttons={[
                        {
                            title: "Update",
                            type: "common",
                            handleClick: savePlatformData,
                        }
                    ]}
                />
            </PageModalHeader>
            <PageModalContent>
                <div>

                    <div>
                        {platformState && platformNames.map((item) => {
                            return (
                            <FormGroup className={s.platform}>
                                <img src={getPlatformImage(item)} className={s.platformIcon} />
                                <Label className={s.platformLabel}>{item}</Label>
                                <Input
                                    type="text"
                                    name={item}
                                    className={s.platformInput}
                                    defaultValue={platformState[item]}
                                    onChange={onChange}
                                />
                            </FormGroup>
                            );
                        })}
                    </div>
                </div>
            </PageModalContent>
        </PageModal>

    );
}

export default Platforms;
