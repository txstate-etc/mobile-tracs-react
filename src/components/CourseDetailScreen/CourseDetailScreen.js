import React, {PureComponent} from 'react'
import styled, {withTheme} from 'styled-components'
import ScreenHeader from '../ScreenHeader'
import CourseOptions from './CourseOptions'
import RecentGrades from './RecentGrades/RecentGrades'
import {connect} from 'react-redux'

const Container = styled.View`
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  background-color: ${props => props.theme.viewBackground};
`

const CourseDetailHeader = styled(ScreenHeader)`
  background-color: ${props => props.theme.gradeSummaryBackground};
`

const RecentGradesSection = styled.View`
  flex: 1;
  width: 100%;
  align-items: flex-start;
  padding: 16px;
`

const Title = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.darkText};
`

class CourseDetailScreen extends PureComponent {
  render () {
    const {course, grades} = this.props
    const {contactInfo: {email: facultyEmail}, name: title} = course

    return (
      <Container>
        <CourseDetailHeader
          navigation={this.props.navigation}
          title={title}
          email={facultyEmail}
        />
        <RecentGradesSection>
          <Title>RECENTLY POSTED GRADES</Title>
          <RecentGrades grades={grades} />
        </RecentGradesSection>
      </Container>
    )
  }
}

CourseDetailScreen.defaultProps = {
  course: {
    id: '',
    name: 'Course title not set',
    contactInfo: {
      name: 'Instructor name not found',
      email: 'tracs@txstate.edu'
    }
  }
}

CourseDetailScreen.navigationProps = {
  title: 'Course'
}

const byPostedDate = (a, b) => {
  const postedA = a.postedDate
  const postedB = b.postedDate

  if (postedA > postedB) return -1 // Later time stamps go to the top of the list
  if (postedA < postedB) return 1 // Earlier time stamps go to the bottom
  return 0 // Times are equal or undefined
}

const mapStateToProps = (state, props) => {
  const course = props.navigation && props.navigation.getParam('course', null)
  const siteId = course.id || null
  const grades = (state.grades[siteId] || {}).grades || []

  grades.sort(byPostedDate)

  return {
    course,
    grades
  }
}

export default connect(mapStateToProps, null)(withTheme(CourseDetailScreen))
