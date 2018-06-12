import React, {Component} from 'react';
import {FlatList, Text} from 'react-native';

import {Calendar} from 'react-native-calendars';
import styled from 'styled-components';
import Header from './CircleHeader/Header';
import ItemSeparator from '../_components/Notifications/ItemSeparator';
import Ripple from 'react-native-material-ripple';

const ContainerView = styled.View`
	alignItems: center;
	justify-content: flex-start;
	flex: 1;
	background-color: white;
`;

const CalendarView = styled(Calendar)`
	background-color: white;
	width: 100%;
	flex: 1;
`;

const HeaderSpacer = styled.View`
	height: ${Header.MIN_HEIGHT - 20}px;
`;

const DueDatesList = styled(FlatList)`
	flex: 1;
	width: 100%;
`;

const DueDateItem = styled(Ripple)`
	width: 100%;
	height: 50px;
	background-color: transparent;
	align-items: center;
	justify-content: space-between;
	padding-left: 16px;
	padding-right: 16px;
	flex-direction: row;
`;

const PullHandle = styled.View`
	width: 100%;
	height: 5px;
	background-color: #363534;
`;

const SideColor = styled.View`
	position: absolute;
	left: 0;
	width: 8px;
	height: 50px;
	background-color: ${props => props.color};
`;

const ViewAllGrades = styled(Ripple)`
	height: 40px;
	background-color: white;
	align-items: center;
	justify-content: center;
	position: absolute;
	border-top-color: #8b898680;
	border-top-width: 2px;
	left: 0;
	right: 0;
	bottom: 0;
`

const ViewAllGradesText = styled.Text`
	color: #363534;
	font-size: 20px;
`

const colors = [
	'#fe4880',
	'#c6427b',
	'#8e3c77',
	'#563672',
	'#1e306e',
];

const getRandomColor = () => {
	return colors[Math.floor(Math.random() * 100) % colors.length];
};

class CalendarScreen extends Component {
	constructor(props) {
		super(props);
		this.data = [
			{key: '0', name: 'Assignment 1'},
			{key: '1', name: 'Assignment 2'},
			{key: '2', name: 'Assignment 3'},
			{key: '3', name: 'Assignment 4'},
			{key: '4', name: 'Assignment 5'},
			{key: '5', name: 'Assignment 6'},
			{key: '6', name: 'Assignment 7'},
			{key: '7', name: 'Assignment 8'},
			{key: '8', name: 'Assignment 9'},
		];
	}

	goToGradebook = () => {
		this.props.navigation.navigate('Gradebook');
	}

	render() {
		return (
			<ContainerView>
				<HeaderSpacer />
				<CalendarView
					current={new Date()}
					minDate={'2018-05-01'}
					monthFormat={'MMMM yyyy'}
				/>
				<PullHandle />
				<DueDatesList
					data={this.data}
					ItemSeparatorComponent={() => (<ItemSeparator/>)}
					renderItem={({item}) => (
						<DueDateItem key={item.key}>
							<SideColor color={getRandomColor()} />
							<Text>{new Date().toDateString()}</Text>
							<Text>{item.name}</Text>
						</DueDateItem>
					)}
				/>
				<ViewAllGrades onPress={this.goToGradebook}>
					<ViewAllGradesText>View All Grades</ViewAllGradesText>
				</ViewAllGrades>
			</ContainerView>
		);
	}
}

export default CalendarScreen;