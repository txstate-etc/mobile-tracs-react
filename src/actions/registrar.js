/**
 * Copyright 2017 Andrew Thyng
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import {Platform} from 'react-native';
import {auth, login, loginHasFailed, loginIsGuestAccount} from './login';
import FCM from 'react-native-fcm';
import base64 from 'base-64';
import {registrarActions} from '../constants/actions';
import axios from 'axios';

const {
	REQUEST_REGISTRATION,
	REGISTRATION_SUCCESS,
	REGISTRATION_FAILURE,
	REQUEST_UNREGISTER,
	UNREGISTER_SUCCESS,
	UNREGISTER_FAILURE,
} = registrarActions;

const requestRegistration = () => {
	return {
		type: REQUEST_REGISTRATION,
		isRegistering: true,
		isRegistered: false
	}
};

const registrationSuccess = (deviceToken, netid) => {
	return {
		type: REGISTRATION_SUCCESS,
		isRegistering: false,
		isRegistered: true,
		deviceToken,
		netid
	}
};

const registrationFailure = (errorMessage) => {
	return {
		type: REGISTRATION_FAILURE,
		isRegistering: false,
		isRegistered: false,
		errorMessage
	}
};

const postRegistration = async (payload, dispatch) => {
	let {
		netid,
		password,
		jwt,
		deviceToken
	} = payload;
	if (!deviceToken) {
		await FCM.getFCMToken().then((token) => {
			deviceToken = token;
		});
	}
	let registration = {
		platform: Platform.OS,
		app_id: 'edu.txstate.mobile.tracs',
		user_id: netid,
		token: deviceToken,
		settings: {
			global_disable: false,
			blacklist: []
		}
	};
	const dispatchUrl = global.urls.dispatchUrl;
	const registrationUrl = `${dispatchUrl}${global.urls.registration(jwt)}`;
	const getRegistrationUrl = `${dispatchUrl}${global.urls.getRegistration(deviceToken)}`;

	const getOptions = {
		method: 'get',
		headers: {'Content-Type': 'application/json'}
	};

	const postOptions = {
		method: 'post',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(registration)
	};
	return fetch(getRegistrationUrl, getOptions).then(res => {
		if (res.ok) {
			return res.json();
		}
	}).then(res => {
		if (res && res.hasOwnProperty("token") && res.token === deviceToken) {
			console.log("Stored Token: ", deviceToken);
			console.log("Server Token: ", res.token);
			dispatch(login(netid, password));
			dispatch(registrationSuccess(res.token, netid));
		} else {
			return fetch(registrationUrl, postOptions).then(res => {
				dispatch(login(netid, password));
				if (res.ok) {
					dispatch(registrationSuccess(deviceToken, netid));
				} else {
					const errorMessage = `${res.statusCode} error: Could not register device for push notifications`;
					console.log(errorMessage);
					dispatch(registrationFailure(errorMessage));
				}
			});
		}
	});
};

const requestUnregister = () => {
	return {
		type: REQUEST_UNREGISTER,
	}
};

const unregisterSuccess = () => {
	return {
		type: UNREGISTER_SUCCESS
	}
};

const unregisterFailure = (errorMessage) => {
	console.log(errorMessage);
	return {
		type: UNREGISTER_FAILURE,
		errorMessage
	}
};

export const register = (netid = '', password) => {
	return (dispatch) => {
		dispatch(requestRegistration());
		if (netid.length === 0) {
			debugger;
			dispatch(registrationFailure("A Net ID is required to register device"));
			return;
		}
		const dispatchUrl = global.urls.dispatchUrl;
		let auth64 = `${netid}:${password}`;
		let headers = {
			'Authorization': 'Basic ' + base64.encode(auth64),
		};
		return axios(`${dispatchUrl}${global.urls.jwt}`, {
			method: 'get',
			headers: headers
		}).then(res => {
			if (res.data) {
				FCM.getFCMToken().then(deviceToken => {
					const payload = {
						netid,
						password,
						jwt: res.data,
						deviceToken
					};
					postRegistration(payload, dispatch);
				});
			}
		}).catch(err => {
			dispatch(login(netid, password));
			dispatch(registrationFailure("Could not register device to receive push notifications"));
			console.log(err.message);
		});
	}
};

export const unregister = (token) => {
	return async (dispatch) => {
		dispatch(requestUnregister());
		if (!token) {
			await FCM.getFCMToken().then(deviceToken => {
				token = deviceToken;
			});
		}
		const dispatchURL = global.urls.dispatchUrl;
		const deleteRegistrationURL = `${dispatchURL}${global.urls.registrationBase}`;
		const form = new FormData();
		form.append('token', token);
		const options = {
			method: 'delete',
			body: form,
			headers: {'Content-Type': 'multipart/form-data'}
		};

		fetch(deleteRegistrationURL, options).then(res => {
			if (res.ok) {
				dispatch(unregisterSuccess());
			} else {
				const errorMessage = "Could not unregister device for push notifications";
				dispatch(unregisterFailure(errorMessage));
			}
		}).catch(err => {
			dispatch(unregisterFailure(err.message));
		})
	};
};