import Taro, { Component } from '@tarojs/taro'
import { View, Input } from '@tarojs/components'
import './index.scss'
import i18next from '../../i18n'

export default class attributeSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectData: [],
      selectWord: ''
    }
  }

  onFocus = () => {
    let { selectdata, changeShow, itemIndex } = this.props;

    if (selectdata.dataArray.length !== 0) {
      this.setState({
        selectdata: selectdata.dataArray
      })
      changeShow(itemIndex);
    } else {
      Taro.showModal({
        title: i18next.t('Tips'),
        content: i18next.t('correspondingattribute'),
        showCancel: false,
        confirmText: i18next.t('Gotit')
      })
    }
  }

  selectList = (item) => {
    let { selectdata, dealSelect, itemIndex } = this.props;
    let { selectWord } = this.state;
    let dependency = selectdata.dependency ? selectdata.dependency : false;
    selectdata.dataArray.forEach((items, index) => {
      if (items.value === item.value) {
        // this.setState({
        //   selectWord: item.value
        // })
        dealSelect(index, item.value, item.id, selectdata.attr, dependency, itemIndex);
      }
    })
  }

  changeValue = (e) => {
    this.filterWord(e.detail.value)
    let { selectWord } = this.state;
    this.setState({
      selectWord: e.target.value
    })
  }

  filterWord = (keyWord) => {
    let { selectdata } = this.props;

    this.setState({
      selectdata: selectdata.dataArray.filter(v => v.value.indexOf(keyWord) !== -1)
    })
  }

  render() {
    let { selectdata, selectWord } = this.state;
    let list = selectdata ? selectdata.map((item, index) => {
      return (
        <View key={index}
          className='listItem'
          onClick={this.selectList.bind(this, item)}
        >{item.value}</View>
      )
    }) : null;


    return (
      <View className='attributeSelect'>
        <View className='prompt'>
          <View className='title'>{this.props.selectdata.displayName}:</View>
          <Input
            type='text'
            className='Input'
            placeholder={i18next.t('correspondingattribute')}
            onFocus={this.onFocus}

            value={this.props.selectdata.value}
          ></Input>
        </View>
        {this.props.selectdata.isShowList && (
          <View className='list'>
            {list}
          </View>
        )}
      </View>
    )
  }
}
