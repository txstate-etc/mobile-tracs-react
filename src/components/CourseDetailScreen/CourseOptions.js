import React, {Component} from 'react'
import styled from 'styled-components'
import CourseOption from './CourseOption'
import RoundedButton from './RoundedButton'
import {NavigationActions, withNavigation} from 'react-navigation'
import {connect} from 'react-redux'

const Container = styled.View`
  align-self: center;
  align-items: center;
  justify-content: center;
  padding-bottom: 16px;
`

const ButtonContainer = styled.View`
  max-width: 500px;
  align-self: stretch;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: flex-end;
  padding: 16px 0;
`

const CourseSiteButton = styled(RoundedButton)`
  width: 290px;
  border-radius: 24px;
`

class CourseOptions extends Component {
  goToWeb = () => {
    const {course: {id: siteId}, navigation} = this.props

    const url = `${global.urls.baseUrl}${global.urls.webUrl}/${siteId}`
    const mainSite = `${global.urls.baseUrl}${global.urls.portal}`
    const openWebView = NavigationActions.navigate({
      routeName: 'TRACSWeb',
      params: {baseUrl: siteId ? url : mainSite, transition: 'cardFromRight'}
    })
    navigation.dispatch(openWebView)
  }

  goToForums = () => {
    const {course, navigation} = this.props

    const openForums = NavigationActions.navigate({
      routeName: 'Forums',
      params: {course, transition: 'cardFromRight'}
    })
    navigation.dispatch(openForums)
  }

  goToAttendance = () => {
    const {course, navigation} = this.props

    const siteId = course.id
    const pageId = (course.tools['sakai.attendance'] || {}).pageId
    const mainSite = `${global.urls.baseUrl}${global.urls.portal}`
    const url = `${global.urls.baseUrl}${global.urls.webUrl}/${siteId}/page/${pageId}`

    const openAttendance = NavigationActions.navigate({
      routeName: 'TRACSWeb',
      transition: 'cardFromRight',
      params: {
        baseUrl: pageId ? url : mainSite,
        transition: 'cardFromRight'
      }
    })

    navigation && navigation.dispatch(openAttendance)
  }

  goToAnnouncements = () => {
    const {course, navigation: {navigate}} = this.props
    navigate('Announcements', {
      transition: 'cardFromRight',
      course
    })
  }

  render () {
    const {hasAnnouncements, hasForums} = this.props
    return (
      <Container>
        <ButtonContainer style={{transform: [{scale: 0.94}]}}>
          <CourseOption label='Forum Posts' name='comments' onClick={this.goToForums} newContent={hasForums} />
          <CourseOption label='Announcements' name='bullhorn' onClick={this.goToAnnouncements} newContent={hasAnnouncements} />
          <CourseOption label='Attendance' name='check-square' onClick={this.goToAttendance} />
        </ButtonContainer>
        <CourseSiteButton title='Course Site' onPress={this.goToWeb} />
      </Container>
    )
  }
}

const mapStateToProps = (state, props) => ({
  hasAnnouncements: (state.notifications.badgeCounts[props.course.id] || {}).announceCount > 0,
  hasForums: (state.notifications.badgeCounts[props.course.id] || {}).forumCount > 0
})

export default connect(mapStateToProps, null)(withNavigation(CourseOptions))
