import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import { listAuthorizedWorkType, checkDveice } from '../../utils/beevalley'
import './index.scss'

export default class TaskList extends Component {
    constructor(props) {
        super(props);

        this.apiToken = Taro.getStorageSync('apiToken');

        this.state = {
            taskType: []
        }
    }

    componentDidMount() {

        let res = Taro.getSystemInfoSync()
        this.screenWidth = res.windowWidth;
        this.screenHeight = Math.floor(res.windowHeight * 0.85);
        this.isMobile = checkDveice(res)

        listAuthorizedWorkType(this.apiToken).then((taskType) => {
            if(this.isMobile){
                taskType = taskType.filter((item) => item.typeCode !== "count")
            }
            this.setState({
                taskType: taskType
            })
        })
        
    }

    navigateToTask = (packageId, typeCode) => {
        Taro.navigateTo({
            url: `/pages/${typeCode}_task/index?packageId=${packageId}`
        })
    }
    

    render() {
        let { taskType } = this.state;

        if (taskType && this.isMobile) {
            taskType = taskType.map((item) => {
                return (
                    <View
                      key={item.packageId + '_' + item.typeCode}
                      className='task_wrap'
                      onClick={this.navigateToTask.bind(this, item.packageId, item.typeCode)}
                    >
                        <Text
                          className='task_wrap_btn'
                        >{item.packageName}:{item.typeName}</Text>
                        <Text className='task_wrap_text'>{item.priceRange}元/张</Text>
                    </View>
                )
            })
        } else {
            taskType = taskType.map((item) => {
                return (
                    <View
                      key={item.packageId + '_' + item.typeCode}
                      className='task_wrap'
                      onClick={this.navigateToTask.bind(this, item.packageId, item.typeCode)}
                    >
                    <Button
                      type='primary'
                      className='task_wrap_btn'
                    >{item.packageName}:{item.typeName}</Button>
                    <Text className='task_wrap_text'>{item.priceRange}元/张</Text>
                    </View>
                )
            })
        }

        return (
            <View className='wrapList'>
                {taskType}
            </View>
        )
    }
}