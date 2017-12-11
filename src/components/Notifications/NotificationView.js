import React, {Component} from 'react';
import {Dimensions, Platform, SectionList, ToastAndroid} from 'react-native';
import {connect} from 'react-redux';
import {getNotifications} from '../../actions/notifications';
import Notification from './Notification';
import SectionHeader from './SectionHeader';
import SectionSeparator from './SectionSeparator';
import ItemSeparator from './ItemSeparator';
import ActivityIndicator from '../Helper/ActivityIndicator';
import {getSettings, saveSettings} from '../../actions/settings';
import Settings from '../../utils/settings';
import {types} from '../../constants/notifications';
import DashboardHeader from './DashboardHeader'
import {Swipeout} from 'react-native-swipeout';

class NotificationView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			deviceWidth: Dimensions.get('window').width,
			isRefreshing: true,
			firstLoad: true
		};
	}

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
			let promises = [
				this.props.getNotifications(),
				getSettings ? this.props.getSettings() : null
			];

			Promise.all(promises).then(result => {
				this.setState({
					isRefreshing: false
				});
			});
		}
	};
	settingsChanged = (nextProps) => {
		const announceChange = nextProps.announcementSetting !== this.props.announcementSetting;
		const forumChange = nextProps.forumSetting !== this.props.forumSetting;

		return announceChange || forumChange;
	};

	filterNotifications = () => {
		if (this.props.siteData) {
			this.announcements = this.props.announcements.filter(announce => {
				return announce.other_keys.site_id === this.props.siteData.id;
			});
			this.forums = this.props.forums.filter(post => {
				return post.other_keys.site_id === this.props.siteData.id;
			});
		}
	};

	componentWillMount() {
		Dimensions.addEventListener('change', (dimensions) => {
			this.setState({
				deviceWidth: dimensions.window.width
			});
		});
	}

	componentDidMount() {
		this.getNotifications(true);
	}

	componentWillUpdate(nextProps, nextState) {
		if (nextProps.notificationsLoaded && this.state.firstLoad) {
			this.setState({
				firstLoad: false,
			});
		}

		if (this.props.notificationsLoaded && this.settingsChanged(nextProps)) {
			this.getNotifications(true);
		}

		if (nextProps.errorMessage) {
			if (Platform.OS === 'android') {
				ToastAndroid.show(nextProps.errorMessage, ToastAndroid.LONG);
			}
		}
	}

	componentWillUnmount() {
		Dimensions.removeEventListener('change', (result) => {
			console.log(result);
		});
	}

	render() {
		this.filterNotifications();
		let announcementSection = {
			data: this.props.announcementSetting ? (this.announcements || this.props.announcements) : [],
			renderItem: ({item}) => {
				let data = {
					deviceWidth: this.state.deviceWidth,
					title: item.tracs_data.title,
					author: item.tracs_data.createdByDisplayName,
					read: item.read,
					onPress: () => {
						console.log(`${item.id} pressed`)
					}
				};
				return <Notification type={types.ANNOUNCEMENT}
														 notification={item}
														 data={data}/>
			},
			title: "Announcements",
			type: types.ANNOUNCEMENT,
			isOn: this.props.announcementSetting,
			onToggle: (value) => {
				let userSettings = new Settings({
					blacklist: this.props.blacklist,
					global_disable: this.props.global_disable
				});
				userSettings.setType(types.ANNOUNCEMENT, value);
				this.props.saveSettings(userSettings.getSettings(), this.props.token, false);
			}
		};

		let forumSection = {
			data: this.props.forumSetting ? this.forums || [] : [],
			renderItem: ({item}) => {
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
			},
			title: "Forums",
			type: types.FORUM,
			isOn: this.props.forumSetting,
			onToggle: (value) => {
				let userSettings = new Settings({
					blacklist: this.props.blacklist,
					global_disable: this.props.global_disable
				});
				userSettings.setType(types.FORUM, value);
				this.props.saveSettings(userSettings.getSettings(), this.props.token, false);
			}
		};

		let sections = [];
		if (this.props.renderAnnouncements) {
			sections.push(announcementSection);
		}
		if (this.props.renderForums) {
			sections.push(forumSection);
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
					refreshing={this.state.isRefreshing}
					renderSectionHeader={this.renderSectionHeader}
					ListHeaderComponent={dashboard}
					renderSectionFooter={() => <SectionSeparator/>}
					ItemSeparatorComponent={ItemSeparator}
				/>
			);
		}

	}
}

const mapStateToProps = (state, ownProps) => {
	let announcementSetting = true;
	let forumSetting = true;

	state.settings.userSettings.blacklist.forEach(setting => {
		if (setting.keys.object_type === "discussion" && forumSetting) {
			forumSetting = false;
		} else if (setting.keys.object_type === "announcement" && announcementSetting) {
			announcementSetting = false;
		}
	});
	return {
		notificationsLoaded: state.notifications.isLoaded,
		errorMessage: state.notifications.errorMessage,
		announcements: state.notifications.announcements || [],
		forums: state.notifications.forums || [],
		blacklist: state.settings.userSettings.blacklist,
		global_disable: state.settings.userSettings.global_disable,
		announcementSetting,
		forumSetting,
	}
};

const mapDispatchToProps = (dispatch) => {
	return {
		getNotifications: () => dispatch(getNotifications()),
		getSettings: () => dispatch(getSettings()),
		saveSettings: (settings, token, local) => dispatch(saveSettings(settings, token, local))
	}
};

NotificationView.defaultProps = {
	renderAnnouncements: true,
	renderForums: false,
	renderDashboard: false
};

export default connect(mapStateToProps, mapDispatchToProps)(NotificationView);