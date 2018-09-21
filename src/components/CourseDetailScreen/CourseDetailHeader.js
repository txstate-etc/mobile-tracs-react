import React, { PureComponent } from 'react'
import styled, { withTheme } from 'styled-components'
import { TouchableWithoutFeedback, Linking } from 'react-native'
import Star from './Star'

const HeaderContainer = styled.View`
  padding: 12px 16px;
  align-self: stretch;
  align-items: center;
  justify-content: space-between;
  background-color: ${props => props.theme.courseDetailHeaderBackground};
  border-bottom-color: #80808080;
  border-bottom-width: 1px;
  flex-direction: row;
`

const TitleContainer = styled.View`
  align-items: flex-start;
  justify-content: center;
`

const Title = styled.Text`
  color: ${props => props.theme.darkText};
  font-size: 21px;
  font-weight: 600;
  padding: 0 4px 0 0;
`

const Subtitle = styled.Text`
  color: ${props => props.theme.darkText};
  font-size: 14px;
  font-weight: 400;
  padding: 2px 0 0 0;
`

const Email = styled.Text`
  color: #0645AD;
  font-size: 14px;
  font-weight: 300;
  text-decoration: underline;
  text-decoration-color: #0645AD;
`

class CourseDetailHeader extends PureComponent {
  openEmail = () => {
    const { email, title } = this.props
    if (email) {
      Linking
        .openURL(`mailto:?to=${email}&subject=${title}`)
        .catch(() => null)
    }
  }

  render () {
    const { title, email, isFavorite, updateFavorites } = this.props

    return (
      <HeaderContainer>
        <TitleContainer>
          <Title>{title}</Title>
          <Subtitle>
            Faculty: {'\t'}
            <TouchableWithoutFeedback onPress={this.openEmail}>
              <Email>{email}</Email>
            </TouchableWithoutFeedback>
          </Subtitle>
        </TitleContainer>
        <Star active={isFavorite} onPress={updateFavorites} />
      </HeaderContainer>
    )
  }
}

CourseDetailHeader.defaultProps = {
  title: 'Course Name Not Found',
  email: 'tracs@txstate.edu'
}

export default withTheme(CourseDetailHeader)
