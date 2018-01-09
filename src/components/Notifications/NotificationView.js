import React, {Component} from 'react';
import {BackHandler, Dimensions, Platform, SectionList, ToastAndroid} from 'react-native';
import {connect} from 'react-redux';
import {batchUpdateNotification, getNotifications} from '../../actions/notifications';
import {Actions} from 'react-native-router-flux';
import Notification from './Notification';
import SectionHeader from './SectionHeader';
import SectionSeparator from './SectionSeparator';
import ItemSeparator from './ItemSeparator';
import ActivityIndicator from '../Helper/ActivityIndicator';
import {getSettings, saveSettings} from '../../actions/settings';
import Settings from '../../utils/settings';
import {types} from '../../constants/notifications';
import {announcements, dashboard} from '../../constants/scenes';
import DashboardHeader from './DashboardHeader'
import {Swipeout} from 'react-native-swipeout';

class NotificationView extends Component {
	renderSectionHeader = ({section}) => {
		switch (section.type) {
			case types.FORUM:
			case types.ANNOUNCEMENT:
				return (<SectionHeader title={section.title}
															 onToggle={section.onToggle}
															 isOn={section.isOn}
				/>);
			default:
				return null;
		}
	};

	getNotifications = (getSettings = false) => {
		if (!this.props.loadingNotifications) {
			this.setState({
				isRefreshing: true
			});
			let start = new Date();
			let promises = [
				this.props.getNotifications(),
				getSettings ? this.props.getSettings() : null
			];

			Promise.all(promises).then(result => {
				this.setState({
					isRefreshing: false
				});
				console.log(`Get Notifications: ${new Date() - start}`);
			});
		}
	};

	settingsChanged = (nextProps) => {
		const announceChange = nextProps.announcementSetting !== this.props.announcementSetting;
		const forumChange = nextProps.forumSetting !== this.props.forumSetting;

		return announceChange || forumChange;
	};

	filterNotifications = (props) => {
		if (props.siteData) {
			if (props.renderAnnouncements) {
				this.announcements = props.announcements.filter(announce => {
					return announce.other_keys.site_id === props.siteData.id;
				});
			}

			if (props.renderForums && props.forums) {
				this.forums = props.forums.filter(post => {
					return post.other_keys.site_id === props.siteData.id;
				});
			} else {
				this.forums = [];
			}
		} else {
			this.announcements = props.announcements;
		}
	};

	setupNotificationSections = (props) => {
		this.filterNotifications(props);
		let id = null;
		if (this.props.siteData) {
			id = this.props.siteData.id;
		}
		this.announcementSection = {
			data: props.announcementSetting ? this.announcements || [] : [],
			renderItem: this.renderAnnouncement,
			title: "Announcements",
			type: types.ANNOUNCEMENT,
			isOn: props.announcementSetting,
			onToggle: this.toggleSetting(types.ANNOUNCEMENT, id)
		};

		this.forumSection = {
			data: props.forumSetting ? this.forums || [] : [],
			renderItem: this.renderForum,
			title: "Forums",
			type: types.FORUM,
			isOn: props.forumSetting,
			onToggle: this.toggleSetting(types.FORUM, id)
		};
	};

	renderForum = ({item}) => {
		if (!item) return null;
		let author = item.tracs_data.authoredBy;
		author = author.split(' ');
		author.splice(author.length - 1, 1);
		let data = {
			deviceWidth: this.state.deviceWidth,
			topic: item.tracs_data.topic_title,
			thread: item.tracs_data.title,
			author: author.join(' '),
			read: item.read
		};
		return <Notification type={types.FORUM}
												 notification={item}
												 data={data}/>
	};

	renderAnnouncement = ({item}) => {
		if (!item) return null;
		let data = {
			deviceWidth: this.state.deviceWidth,
			title: item.tracs_data.title,
			author: item.tracs_data.createdByDisplayName,
			read: item.read,
			onPress: () => {
			}
		};
		return <Notification type={types.ANNOUNCEMENT}
												 notification={item}
												 data={data}/>
	};

	constructor(props) {
		super(props);
		this.state = {
			deviceWidth: Dimensions.get('window').width,
			isRefreshing: true,
			firstLoad: true
		};
		console.log(this.props.siteData);
		this.batchUpdateSeen = this.batchUpdateSeen.bind(this);
		this.handleBack = this.handleBack.bind(this);
	}

	toggleSetting(type, id=null) {
		return (value) => {
			let userSettings = new Settings({
				blacklist: this.props.blacklist,
				global_disable: this.props.global_disable
			});
			if (id !== null) {
				userSettings.setTypeAndSite(type, id, value);
			} else {
				userSettings.setType(type, value);
			}

			this.props.saveSettings(userSettings.getSettings(), this.props.token, false);
		};
	};

	componentWillMount() {
		Dimensions.addEventListener('change', (dimensions) => {
			this.setState({
				deviceWidth: dimensions.window.width
			});
		});
		BackHandler.addEventListener('hardwareBackPress', this.handleBack);
		this.getNotifications(true);
		this.setupNotificationSections(this.props);
	}

	componentWillUpdate(nextProps, nextState) {
		if (nextProps.notificationsLoaded && this.state.firstLoad) {
			this.setState({
				firstLoad: false
			});
		}

		if (nextProps.notificationsLoaded && this.settingsChanged(nextProps)) {
			this.getNotifications(true);
		}

		if (nextProps.errorMessage) {
			if (Platform.OS === 'android') {
				ToastAndroid.show(nextProps.errorMessage, ToastAndroid.LONG);
			}
		}
		this.setupNotificationSections(nextProps);
	}

	componentWillUnmount() {
		Dimensions.removeEventListener('change', (result) => {
		});
		BackHandler.removeEventListener('hardwareBackPress', this.handleBack);
	}

	handleBack() {
		Actions.pop();
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (nextProps.route === dashboard && this.props.renderDashboard) {
			return true;
		}

		return nextProps.route === announcements && !this.props.renderDashboard
	}

	render() {
		this.start = new Date();
		let sections = [];
		if (this.props.renderAnnouncements && this.announcementSection) {
			sections.push(this.announcementSection);
		}
		if (this.props.renderForums && this.forumSection) {
			sections.push(this.forumSection);
		}

		if (!this.props.notificationsLoaded && this.state.firstLoad) {
			return (
				<ActivityIndicator/>
			);
		} else {
			let dashboard = null;
			if (this.props.renderDashboard === true) {
				dashboard = <DashboardHeader siteName={this.props.siteData.name}
																		 contactName={this.props.siteData.contactInfo.name}
																		 contactEmail={this.props.siteData.contactInfo.email}/>
			}
			return (
				<SectionList
					sections={sections}
					keyExtractor={(item, index) => {
						return item.id
					}}
					onRefresh={this.getNotifications}
					refreshing={false}
					renderSectionHeader={this.renderSectionHeader}
					ListHeaderComponent={dashboard}
					renderSectionFooter={() => <SectionSeparator/>}
					ItemSeparatorComponent={ItemSeparator}
				/>
			);
		}

	}

	componentDidMount() {
		this.batchUpdateSeen();
	}

	componentDidUpdate() {
		this.batchUpdateSeen();
	}

	async batchUpdateSeen() {
		const status = {
			seen: true
		};

		const ids = [
			...this.announcementSection.data.filter(item => !item.seen).map(item => item.id),
			...this.forumSection.data.filter(item => !item.seen).map(item => item.id)
		];

		let token = this.props.dispatchToken || await FCM.getFCMToken().then(token => token);

		if (!this.props.isBatchUpdating && !this.props.errorMessage && ids.length > 0) {
			this.props.batchUpdate(ids, status, token);
		}
		console.log("Total IDS: ", ids.length);
	}
}

const mapStateToProps = (state, ownProps) => {
	let announcementSetting = true;
	let forumSetting = true;

	state.settings.userSettings.blacklist.forEach(setting => {
		if (setting.hasOwnProperty("other_keys") && setting.other_keys.site_id === (ownProps.siteData || {}).id) {
			if (setting.hasOwnProperty("keys")) {
				if (setting.keys.object_type === "discussion") {
					forumSetting = false;
				}

				if (setting.keys.object_type === "announcement") {
					announcementSetting = false;
				}
			}
		}
	});

	return {
		notificationsLoaded: state.notifications.isLoaded,
		dispatchToken: state.registrar.deviceToken,
		isBatchUpdating: state.notifications.isBatchUpdating,
		loadingNotifications: state.notifications.isLoading,
		errorMessage: state.notifications.errorMessage,
		announcements: state.notifications.announcements || [],
		forums: state.notifications.forums || [],
		blacklist: state.settings.userSettings.blacklist,
		global_disable: state.settings.userSettings.global_disable,
		route: state.routes.scene,
		announcementSetting,
		forumSetting,
	}
};

const mapDispatchToProps = (dispatch) => {
	return {
		getNotifications: () => dispatch(getNotifications()),
		getSettings: () => dispatch(getSettings()),
		saveSettings: (settings, token, local) => dispatch(saveSettings(settings, token, local)),
		batchUpdate: (ids, status, token) => dispatch(batchUpdateNotification(ids, status, token))
	}
};

NotificationView.defaultProps = {
	renderAnnouncements: true,
	renderForums: false,
	renderDashboard: false
};

export default connect(mapStateToProps, mapDispatchToProps)(NotificationView);