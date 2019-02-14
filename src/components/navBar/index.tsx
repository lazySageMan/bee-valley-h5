import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtNavBar } from 'taro-ui'

export default class NavBar extends Component {
    constructor(props){
        super(props)
    }

    handleNavBarClick = () => {
      let { verification } = this.props;
      if (!verification){
        Taro.showModal({
          title: '提示',
          content: '是否确定退出',
          success: (res) => {
            if (res.confirm) {
              Taro.navigateBack({
                delta: 1
              })
            }
          }
        })
      }else{
        Taro.navigateBack({
          delta: 1
        })
      }
    }

    render() {

        let { title } = this.props;
        return (
            <View className='backBtn'>
                <AtNavBar
                  onClickLeftIcon={this.handleNavBarClick}
                  leftIconType='chevron-left'
                  color='#000'
                  title={title}
                  leftText='返回'
                />
            </View>
        )
    }
}
