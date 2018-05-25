/**
 * Copyright 2018 Andrew Thyng
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import LoginScreen from '../_components/Login/LoginScreen';
import HomeScreen from '../components/Home/HomeScreen';
import Header from '../components/Header/Header';

import {View, Text} from 'react-native';
import React from 'react';

import {createSwitchNavigator, createMaterialTopTabNavigator} from 'react-navigation';

const FakeScene = (title) => {
	return () => (
		<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
			<Text style={{color: '#363534', fontSize: 36, textAlign: 'center'}}>{title}</Text>
		</View>
	)
};

const HomeNavigator = createMaterialTopTabNavigator({
	Left: {
		screen: FakeScene("Left")
	},
	Home: {
		screen: HomeScreen
	},
	Right: {
		screen: FakeScene("Right")
	}
}, {
	initialRouteName: 'Home',
	tabBarComponent: null
});

const AuthenticationNavigator = createSwitchNavigator({
	Home: HomeNavigator,
	Login: {
		screen: LoginScreen,
		navigationOptions: {
			header: null
		}
	}
}, {initialRouteName: 'Login'});

module.exports = {
	Scenes: AuthenticationNavigator
};