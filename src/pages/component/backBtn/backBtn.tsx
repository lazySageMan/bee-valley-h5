import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtNavBar } from 'taro-ui'

export default class BackBtn extends Component {
    constructor(props) {
        super(props)
    }

    handleClick = () => {
        Taro.showModal({
            title: '提示',
            content: '任务正在进行中，是否确定退出',
            success: (res) => {
                if (res.confirm) {
                    Taro.navigateBack({
                        delta: 1
                    })
                }
            }
        })
    }

    render() {

        let { title } = this.props;
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