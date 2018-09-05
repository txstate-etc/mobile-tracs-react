import React, {Component} from 'react'
import {Animated, View, Dimensions} from 'react-native'
import styled, {withTheme} from 'styled-components'
import Comments from './Comments'
import dayjs from 'dayjs'
import Grade from './Grade'
import GradeInfo from './GradeInfo'

const Container = styled(Animated.View)`
  height: 80px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
`

function getHue (grade, points) {
  const failingThreshold = 0.6
  const failingPoints = failingThreshold * points
  const remainder = (1 - failingThreshold) * points

  const gradePercent = (points - (grade < failingPoints ? failingPoints : grade)) / remainder

  const normalizedGrade = 1 - gradePercent
  return normalizedGrade * 120
}

class RecentGrade extends Component {
  constructor (props) {
    super(props)
    const {grade, points} = props

    this.driver = new Animated.Value(0)
    this.hue = getHue(parseInt(grade, 10), points)
  }

  showComment = () => {
    this.animateComment(true)
  }

  hideComment = () => {
    this.animateComment(false)
  }

  animateComment = (showComment = true) => {
    Animated.timing(this.driver, {
      toValue: showComment ? 1 : 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      if (showComment) {
        this.comments.flashScrollIndicators()
      }
    })
  }

  render () {
    const {grade, name, points, theme, comment, postedDate} = this.props
    const {width} = Dimensions.get('window')

    const translateX = this.driver.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -width]
    })

    const opacity = this.driver.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1]
    })

    const translateCommentX = this.driver.interpolate({
      inputRange: [0, 1],
      outputRange: [width, 0]
    })

    const commentOpacity = this.driver.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1]
    })

    return (
      <View style={{overflow: 'hidden'}}>
        <Container style={{transform: [{translateX: translateX}], opacity}}>
          <Grade earned={grade} total={points} />
          <GradeInfo
            posted={postedDate}
            comment={comment}
            name={name}
            onShowComment={this.showComment}
          />
        </Container>
        <Comments
          theme={theme}
          ref={c => this.comments = c}
          onPress={this.hideComment}
          comment={comment}
          style={{
            transform: [{translateX: translateCommentX}],
            opacity: commentOpacity,
            position: 'absolute'
          }}
        />
      </View>
    )
  }
}

RecentGrade.defaultProps = {
  name: 'Gradebook Name Not Found',
  grade: Math.ceil(Math.random() * 100),
  dateGraded: dayjs().format('MMM DD HH:mm a')
}

export default withTheme(RecentGrade)