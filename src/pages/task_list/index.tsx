import Taro, { Component } from '@tarojs/taro'
import { View, Button } from '@tarojs/components'
import './index.scss'

export default class TaskList extends Component {
    constructor(props){
        super(props);
    }

    toPointTask = () => {
        Taro.navigateTo({
            url: '/pages/point_task/index'
        })
    }

    toPointReview = () => {
        Taro.navigateTo({
            url: '/pages/point_review/index'
        })
    }

    toRectTask = () => {
        Taro.navigateTo({
            url: '/pages/rect_task/index'
        })
    }

    toRectReview = () => {
        Taro.navigateTo({
            url: '/pages/rect_review/index'
        })
    }

    render(){
        return (
            <View className='wrapList'>
                <Button type='primary' onClick={this.toPointTask}>点标注</Button>
                <Button type='primary' onClick={this.toPointReview}>点审核</Button>
                <Button type='primary' onClick={this.toRectTask}>框标注</Button>
                <Button type='primary' onClick={this.toRectReview}>框审核</Button>
            </View>
        )
    }
}