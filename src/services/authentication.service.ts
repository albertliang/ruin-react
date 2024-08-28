
import axios from 'axios';
import * as Constants from "../constants";
import moment from 'moment-timezone';

export const authenticationService = {
    login,
    logout,
    contactUs,
    verifyToken,
    updatePassword,
    isUniqueUsername,
    isUniqueEmail,
    sendLoginToken,
    isAuthenticated,
    getUsername,
    getUserId,
    getUserTimezone,
    getHeaderOptions
};

async function login(username: string, password: string) {
   
    try {
        const userData = await axios.post(Constants.APIURL + "/auth/signin", { username, password }, { headers: {'Content-Type': 'application/json'}});

        if (userData) {
            const token: string = 'JWT ' + userData.data.token;
            
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('userid', userData.data.user._id);
            localStorage.setItem('username', userData.data.user.username);
            localStorage.setItem('timezone', userData.data.user.timezone);
            localStorage.setItem('authtoken', token);
            axios.defaults.headers.common['Authorization'] = token;
    
            return true;
        }
    } catch {
        return false;
    }
}

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('userid');
    localStorage.removeItem('username');
    localStorage.removeItem('authtoken');
    localStorage.removeItem('timezone');
    axios.defaults.headers.common['Authorization'] = null;
}

async function verifyToken(token: string) {
   
    try {
        const userData = await axios.get(Constants.APIURL + "/auth/verification/" + token, { headers: {'Content-Type': 'application/json'}});

        if (userData) {
            const token: string = 'JWT ' + userData.data.token;
            
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('userid', userData.data.user._id);
            localStorage.setItem('username', userData.data.user.username);
            localStorage.setItem('timezone', userData.data.user.timezone);
            localStorage.setItem('authtoken', token);
            axios.defaults.headers.common['Authorization'] = token;
    
            return true;
        } 
    } catch {
        return false;
    }
}

async function sendLoginToken(email: string) {
    try {
        await axios.post(Constants.APIURL + "/auth/loginlink", {email}, { headers: {'Content-Type': 'application/json'}});
        return true;
    } catch {
        return false;
    }
}

async function updatePassword(newPassword: string, verifyPassword: string) {
    return await axios.post(Constants.APIURL + "/api/users/password", {newPassword, verifyPassword}, getHeaderOptions());
}

async function isUniqueUsername(username: string, userId: string) {
    const result: any = await axios.post(Constants.APIURL + "/anon/user/checkusername", {username, userId}, getHeaderOptions());
    return result && result.data && !result.data.isExists;
}

async function isUniqueEmail(email: string, userId: string) {
    const result: any = await axios.post(Constants.APIURL + "/anon/user/checkemail", {email, userId}, getHeaderOptions());
    return result && result.data && !result.data.isExists;
}

async function contactUs(message: string) {
    return await axios.post(Constants.APIURL + "/api/contactus", {message}, getHeaderOptions());
}

function isAuthenticated() {
    return !!localStorage.getItem('authtoken')
}

function getUsername() {
    return localStorage.getItem('username');
}

function getUserId() {
    return localStorage.getItem('userid');
}

function getUserTimezone() {
    return localStorage.getItem('timezone') || moment.tz.guess();
}

function getHeaderOptions() {
    return  { headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('authtoken') } };
}

