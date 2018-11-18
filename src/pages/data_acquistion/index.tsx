import Taro from '@tarojs/taro'
import { View, Image, Text} from '@tarojs/components'
import { AtButton, AtIcon } from 'taro-ui'
import './index.scss'
import testImg from '../../image/1.jpeg'

export default class DataAcquistion extends Taro.Component {
    constructor(){
        super(...arguments)
    }

    render(){
        return (
            <View className="data-wrap">
                <View className="main-content">
                    <View className="task_demand">
                        <View className="panel__title">第1步</View>
                        <View className="title">任务要求</View>
                        <View className="content-list">
                            <View className="list-item">1：车辆必须是图片中的主题物</View>
                            <View className="list-item">2：拍摄地点为大街上，马路上，不可以是停车场的车</View>
                            <View className="list-item">3：图片中有一辆车辆，不可有多辆</View>
                            <View className="list-item">4：拍摄车辆可以从多个角度，一两车不可重复拍摄</View>
                            <View className="list-item">5：拍紫色车辆，等拍够了5张也可以一起上传，必须是手机拍摄，横排，横排，横排</View>
                        </View>
                        <View className="content-img">
                            <Image src={testImg} className="img"></Image>
                        </View>
                    </View>
                </View>
                <View className="user-photo">
                    <View className="user-photo-wrap">
                        <View className="title">
                            <AtIcon size="30" value="image" color="orange"></AtIcon>
                            <Text className="font">拍摄第一张照片</Text>
                        </View>
                        <View className="take-photo">
                            <View className="eg img-item">
                                <View className="eg-item">示例</View>
                                <Image src={testImg} className="img"></Image>
                            </View>
                            <View className="img-item">
                                <AtIcon size="60" value="camera" color="orange"></AtIcon>
                                添加图片
                            </View>
                        </View>
                        <View className="info">请拍摄紫色车辆</View>
                    </View>
                </View>
                <View className="top-info">0/1 已添加</View>
                <View className="bottom-btn">
                    <AtButton type="primary" circle className="btn">提交审核</AtButton>
                </View>
            </View>
        )
    }
}