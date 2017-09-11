import {AppRegistry,} from 'react-native';
import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {ActionConst, Router, Scene} from 'react-native-router-flux';
import configureStore from './store/configureStore';
import LoginScreen from './components/Login/LoginScreen';
import CourseList from './components/SiteList/SiteList';
import PushNotification from 'react-native-push-notification';
import {token} from './utils/storage';

const store = configureStore();
const handleNotification = (notification) => {
	console.log("NOTIFICATION: ", notification);
};

class App extends Component {
	constructor(props) {
		super(props);
		PushNotification.configure({
			onRegister: function (deviceToken) {
				token.store(deviceToken.token).then(() => {
					console.log("TOKEN: ", deviceToken);
				});
			},
			onNotification: handleNotification,
			permissions: {
				alert: true,
				badge: true,
				sound: true,
			},
			popInitialNotification: true,
			requestPermissions: true,
		});
	}

	render() {

		return (
			<Provider store={store}>
				<Router>
					<Scene key="root">
						<Scene key="login"
									 component={LoginScreen}
									 title="TRACS Mobile Login"
									 initial
						/>
						<Scene key="sites"
									 init={true}
									 component={CourseList}
									 type={ActionConst.RESET}
									 title="Sites"
						/>
					</Scene>
				</Router>
			</Provider>
		);
	}
}

export default App;
AppRegistry.registerComponent('TRACSMobile', () => App);