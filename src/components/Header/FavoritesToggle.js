import React, {PureComponent} from 'react'
import {TouchableOpacity} from 'react-native'
import styled from 'styled-components'
import {toggleStatus} from '../../constants/sites'
import Icon from 'react-native-vector-icons/FontAwesome'

const {
  FAVORITES,
  ALL_SITES
} = toggleStatus

const BORDER_COLOR = '#00000060'

const Container = styled.View`
  width: 250px;
  height: 45px;
  background-color: #501214;
  border-radius: 2px;
  flex-direction: row;
  border: 2px solid ${BORDER_COLOR};
`

const Favorite = styled((props) => <TouchableOpacity {...props} activeOpacity={1} />)`
  height: 100%;
  flex-direction: row;
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.active ? 'transparent' : BORDER_COLOR};
`

const AllSites = styled(Favorite)`
  background-color: ${props => props.active ? 'transparent' : BORDER_COLOR};
`

const Label = styled.Text`
  margin-left: 6px;
  color: ${props => props.active ? 'white' : '#501214'};
  font-size: 14px;
`

const StyledIcon = styled(Icon)`
  font-size: 14px;
  color: ${props => props.active ? 'white' : '#501214'};
`

class FavoritesToggle extends PureComponent {
  state = {
    status: this.props.status
  }

  onPress = (status) => () => {
    this.setState({status})
    this.props.onValueChange(status)
  }

  render () {
    const favoritesActive = this.state.status === FAVORITES
    const allSitesActive = this.state.status === ALL_SITES

    return (
      <Container>
        <Favorite active={favoritesActive} onPress={this.onPress(FAVORITES)}>
          <StyledIcon name='star' active={favoritesActive} />
          <Label active={favoritesActive}>FAVORITES</Label>
        </Favorite>
        <AllSites active={allSitesActive} onPress={this.onPress(ALL_SITES)}>
          <StyledIcon name='th' active={allSitesActive} />
          <Label active={allSitesActive}>ALL SITES</Label>
        </AllSites>
      </Container>
    )
  }
}

export default FavoritesToggle