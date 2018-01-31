/**
 * Copyright 2017 Andrew Thyng
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import {AppRegistry, PermissionsAndroid} from 'react-native';
import React, {Component} from 'react';
import {connect, Provider} from 'react-redux';
import FCM, {FCMEvent} from 'react-native-fcm';
import {ActionConst, Actions, Router, Scene, Stack, Tabs} from 'react-native-router-flux';
import configureStore from './src/store/configureStore';
import LoginScreen from './src/components/Login/LoginScreen';
import SiteList from './src/components/SiteList/SiteList';
import NotificationView from './src/components/Notifications/NotificationView';
import Settings from './src/components/Settings/Settings';
import * as urls from './config/urls';
import * as scenes from './src/constants/scenes';
import env from './config/env.json';
import NotificationSettings from './src/components/NotificationSettings/NotificationSettings';
import TabIcon from './src/components/TabBar/TabIcon';
import SimpleWebView from './src/components/SimpleWebView/SimpleWebView';
import {getNotifications} from './src/actions/notifications';
import {setCurrentScene} from './src/actions/routes';
import TRACSWebView from './src/components/TRACSWebView/TRACSWebNative';
import {tabBar} from './src/constants/colors';
import AboutView from './src/components/About/AboutView';
import './src/utils/reactotron';
import Reactotron from 'reactotron-react-native';

const store = configureStore();
const RouterWithRedux = connect()(Router);

if (env.debug) {
	global.urls = urls.debug;
} else {
	global.urls = urls.release;
}

const tabIconSize = 24;
const tabIconColor = tabBar.inactive;

console.tron = Reactotron;

class App extends Component {
	handleNotification = (notification) => {
		FCM.presentLocalNotification({
			title: `${notification.fcm.title}`,
			body: `${notification.fcm.body}`,
			sound: "default",
			show_in_foreground: true,
			icon: "ic_notification"
		});
	};

	setTabBarColor(props) {
		return props.focused ? props.activeTintColor : props.inactiveTintColor;
	}

	constructor(props) {
		super(props);

		this.TabIcons = {
			announcements: (tabBarProps) => {
				return <TabIcon name="bullhorn" size={tabIconSize} color={this.setTabBarColor(tabBarProps)}/>;
			},
			sites: (tabBarProps) => {
				return <TabIcon name="list" size={tabIconSize} color={this.setTabBarColor(tabBarProps)}/>;
			},
			settings: (tabBarProps) => {
				return <TabIcon name="cog" size={tabIconSize} color={this.setTabBarColor(tabBarProps)}/>;
			}
		};

		this.requestStoragePermission = this.requestStoragePermission.bind(this);
		this.requestStoragePermission();

		this.Scenes = Actions.create(
			<Scene key="root">
				<Scene key={scenes.login}
							 component={LoginScreen}
							 title="TRACS Mobile Login"
							 initial={true}
							 hideNavBar={true}
							 type={ActionConst.RESET}/>
				<Tabs key={scenes.main}
							type={ActionConst.RESET}
							activeTintColor={tabBar.active}
							inactiveTintColor={tabBar.inactive}
							tabBarStyle={{backgroundColor: tabBar.backgroundColor}}
							hideNavBar
							swipeEnabled={false}
							backToInitial
							lazy={true}
							showLabel={true}
							tabBarPosition="bottom">

					<Stack key={scenes.announcementsTab}
								 icon={this.TabIcons.announcements}
								 onEnter={() => {
								 	store.dispatch(setCurrentScene(scenes.announcementsTab))
								 }}
								 navigationBarStyle={{backgroundColor: "#501214"}}
								 navBarButtonColor="#fff"
								 titleStyle={{color: "#fff"}}
								 tabBarLabel="Announcements">
						<Scene key={scenes.announcements}
									 icon={this.TabIcons.announcements}
									 initial
									 tabBarLabel="Announcements"
									 title="Announcements"
									 hideNavBar={false}
									 component={NotificationView}
									 onEnter={(props) => {
										 props.renderAnnouncements = true;
										 store.dispatch(setCurrentScene(scenes.announcements));
										 return props;
									 }}/>
						<Scene key={scenes.tracsAnnouncement}
									 component={TRACSWebView}
									 hideNavBar={true}
									 onEnter={() => {
										 store.dispatch(setCurrentScene(scenes.tracsAnnouncement));
									 }}
									/>
					</Stack>
					<Stack key={scenes.sitesTab}
								 icon={this.TabIcons.sites}
								 initial
								 navigationBarStyle={{backgroundColor: "#501214"}}
								 navBarButtonColor="#fff"
								 titleStyle={{color: "#fff"}}
								 tabBarLabel="Courses">
						<Scene key={scenes.sites}
									 title="TRACS"
									 component={SiteList}
									 initial
									 hideNavBar={false}
									 onEnter={() => {
										 store.dispatch(setCurrentScene(scenes.sitesTab));
									 }}/>
						<Scene key={scenes.dashboard}
									 title="Dashboard"
									 swipeEnabled={false}
									 component={NotificationView}
									 onEnter={() => {
										 store.dispatch(setCurrentScene(scenes.dashboard));
									 }}/>
						<Scene key={scenes.tracsDashboard}
									 component={TRACSWebView}
									 hideNavBar={true}
									 onEnter={() => {
										 store.dispatch(setCurrentScene(scenes.tracsDashboard));
									 }}
						/>
					</Stack>
					<Stack key={scenes.settingsTab}
								 icon={this.TabIcons.settings}
								 navigationBarStyle={{backgroundColor: "#501214"}}
								 navBarButtonColor="#fff"
								 titleStyle={{color: "#fff"}}
								 onEnter={() => {
									 store.dispatch(setCurrentScene(scenes.settingsTab));
								 }}
								 tabBarLabel="Settings">
						<Scene key={scenes.settings}
									 initial
									 title="Settings"
									 hideNavBar={false}
									 component={Settings}/>
						<Scene key={scenes.notificationSettings}
									 back
									 title="Notification Settings"
									 component={NotificationSettings}/>
						<Scene key={scenes.feedback}
									 back
									 title="Feedback"
									 component={SimpleWebView}
									 url={global.urls.feedback}/>
						<Scene key={scenes.support}
									 back
									 title="TRACS Support"
									 component={SimpleWebView}
									 url={global.urls.support}/>
					</Stack>
				</Tabs>
				<Scene key={scenes.about}
							 hideNavBar={true}
							 back
							 component={AboutView}/>
			</Scene>
		);
	}

	componentDidMount() {
		this.notificationListener = FCM.on(FCMEvent.Notification, (notification) => {
			if (notification.local_notification) {
				//Not used but I don't want to forget the option
			} else if (notification.opened_from_tray) {

			} else {
				console.log(notification);
				this.handleNotification(notification);
				store.dispatch(getNotifications());
			}
		});
	}

	componentWillUnmount() {
		this.notificationListener.remove();
	}

	async requestStoragePermission() {
		try {
			const granted = await PermissionsAndroid.request(
				PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
				{
					'title': "TRACS Storage Permission",
					'message': "TRACS needs access to store data on your phone."
				}
			);
			if (granted === PermissionsAndroid.RESULTS.GRANTED) {
				console.log("Cache Enabled");
			} else {
				console.log("Cache Disabled");
			}
		} catch(err) {
			console.log("Cache Disabled");
		}
	}

	render() {
		return (
			<Provider store={store}>
				<RouterWithRedux scenes={this.Scenes}/>
			</Provider>
		);
	}
}

AppRegistry.registerComponent('TRACSMobile', () => App);








