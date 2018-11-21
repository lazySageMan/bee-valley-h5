import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtNavBar } from 'taro-ui'

export default class BackBtn extends Component {
    constructor(props){
        super(props)
    }

    handleClick = () => {
        Taro.navigateBack({
            delta: 1
        })
    }

    render(){

        let {title} = this.props;
        return (
            <View className="backBtn">
                <AtNavBar
                    onClickRgIconSt={this.handleClick}
                    onClickLeftIcon={this.handleClick}
                    leftIconType="chevron-left"
                    color='#000'
                    title={title}
                    leftText='返回'
                />
            </View>
        )
    }
}