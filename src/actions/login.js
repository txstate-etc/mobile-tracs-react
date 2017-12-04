/**
 * Copyright 2017 Andrew Thyng
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {user} from './registrar';
import {authActions} from '../constants/actions';
import {credentials} from '../utils/storage';

const {
	REQUEST_LOGIN,
	LOGIN_SUCCESS,
	LOGIN_FAILURE,
	REQUEST_LOGOUT,
	LOGOUT_SUCCESS,
	LOGOUT_FAILURE,
	SET_CREDENTIALS
} = authActions;

const requestLogin = () => {
	return {
		type: REQUEST_LOGIN,
	}
};

const loginSuccess = (netid, password) => {
	return {
		type: LOGIN_SUCCESS,
		netid,
		password,
	}
};

const loginFailure = (errorMessage) => {
	return {
		type: LOGIN_FAILURE,
		errorMessage
	}
};

const requestLogout = () => {
	return {
		type: REQUEST_LOGOUT
	}
};

const logoutSuccess = () => {
	return {
		type: LOGOUT_SUCCESS
	}
};

const logoutFailure = (errorMessage) => {
	return {
		type: LOGOUT_FAILURE,
		errorMessage
	}
};

export const setCredentials = (creds) => {
	return {
		type: SET_CREDENTIALS,
		creds
	}
};

export function login(netid = '', password) {
	return async (dispatch) => {
		if (netid.length === 0) {
			dispatch(requestLogin());
			credentials.get().then(credentials => {
				if (!credentials) {
					dispatch(loginFailure("Net ID must be filled out"));
				} else {
					netid = credentials.username;
					password = credentials.password;
					dispatch(login(netid, password));
				}
			}).catch(err => {
				console.log("Storage Error: ", err.message);
				dispatch(loginFailure("Cannot get credentials from storage"));
			});
			return;
		}

		dispatch(requestLogin());

		const loginUrl = `${global.urls.baseUrl}${global.urls.login(netid, encodeURI(password))}`;
		const sessionUrl = `${global.urls.baseUrl}${global.urls.session}`;

		return fetch(loginUrl, {method: 'post'})
			.then(res => {
				if (res.ok) {
					let creds = {
						netid,
						password
					};
					return fetch(sessionUrl, {method: 'get'})
						.then(res => {
							if (res.ok) {
								return res.json();
							} else {
								throw new Error("Could not verify session with TRACS");
							}
						}).then(session => {
							if (session.userEid === creds.netid) {
								credentials.store(creds.netid, creds.password).then(() => {
									dispatch(loginSuccess(session.userEid, creds.password));
								});
							} else {
								//Maybe this should update the session by logging into TRACS?
								//Only cause should be if the user wasn't actually logged in during the previous fetch reques
								loginFailure("Session does not match provided credentials");
							}
						}).catch(err => {
							dispatch(loginFailure(err.message));
						});
				} else {
					throw new Error("Could not login to TRACS");
				}
			})
			.catch(err => {
				dispatch(loginFailure(err.message));
			});
	};
}

export function logout() {
	return (dispatch) => {
		dispatch(requestLogout());
		const logoutUrl = `${global.urls.baseUrl}${global.urls.logout}`;

		return fetch(logoutUrl, {
			method: 'get'
		}).then(res => {
			if (res.ok) {
				dispatch(logoutSuccess());
			} else {
				throw new Error("Could not logout of TRACS");
			}
		}).catch(err => {
			dispatch(logoutFailure(err.message));
		});
	};
}