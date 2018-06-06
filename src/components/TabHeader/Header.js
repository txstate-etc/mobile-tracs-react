/**
 * Copyright 2018 Andrew Thyng
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React, {Component} from 'react';
import {Animated} from 'react-native';
import styled from 'styled-components';
import {connect} from 'react-redux';
import CalendarIcon from '../CircleHeader/CalendarIcon';
import Profile from '../CircleHeader/Profile';

const Container = styled(Animated.View)`
	height: ${65}px;
	background-color: #224575;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding-left: 16px;
	padding-right: 16px;
	padding-top: 24px;
	${props => props.home ? '' : 	
	`shadow-offset: 0px 2px;
	shadow-color: #b0b0b0;
	shadow-radius: 2px;
	shadow-opacity: 0.5;`}
`;

class Header extends Component {
	constructor(props) {
		super(props);
	}

	goToCalendar = () => {
		this.props.navigation.navigate('Calendar', {
			transition: 'cardFromTop'
		})
	};

	render() {
		return (
			<Container home>
				<CalendarIcon
					diameter={60}
					size={28}
					onPress={this.goToCalendar}
				/>
				<Profile
					diameter={100}
				/>
			</Container>
		)
	}
}

const mapStateToProps = (state) => {
	return {
		animationRange: state.header.scrollY
	}
};

export default connect(mapStateToProps, null)(Header);
