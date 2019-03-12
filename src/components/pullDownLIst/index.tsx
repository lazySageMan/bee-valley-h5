import Taro, { Component } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import './index.scss'
import caretLeft from '../../image/caret-left.png'
import caretDown from '../../image/caret-down.png'
import i18next from '../../i18n'

export default class pullDown extends Component {
  constructor(props){
    super(props);
    this.state = {
      select: ''
    }
  }

  selectItem = (index, name) => {
    let { selectRegion, that } = this.props;
    let { select } = this.state;
    this.setState({
      select: name
    })
    selectRegion(that, index);
  }

  openList = (e) => {
    let { openList, that } = this.props;
    e.stopPropagation();
    openList(that);
  }

  render(){
    let { allRegion, isOpen, defaultSelect } = this.props;
    let listItem = allRegion.length !== 0 ? allRegion.map((item, index) => {
      return (
        <View className='item' key={index} onClick={this.selectItem.bind(this, index, item.name)}>{i18next.t(item.name)}</View>
      )
    }) : null;

    let chooseIcon = isOpen ? (<Image  className='iconImg' src={caretDown}></Image>) :
      (<Image  className='iconImg' src={caretLeft}></Image>);

    return (
      <View className='pull_wrap'>
        <View className='title' onClick={this.openList}>
          <View className='text'>{i18next.t(defaultSelect)}</View>
          <View className='icon'>
            {chooseIcon}
          </View>
        </View>
        {isOpen && (
          <View className='lists'>
            {listItem}
          </View>
        )}

      </View>
    )
  }
}
