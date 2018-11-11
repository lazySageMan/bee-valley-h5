import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import {listAuthorizedWorkType} '../../utils/beevalley'
import { fetch } from '../../utils/localIfo'
import './index.scss'

export default class TaskList extends Component {
    constructor(props){
        super(props);

        this.apiToken = fetch("apiToken");

        this.state = {
            taskType : []
        }
    }

    componentDidMount (){
        listAuthorizedWorkType(this.apiToken).then((res) => {
            this.setState({
                taskType: res
            })
        })
    }

    navigateToTask = (packageId, typeCode) => {
        Taro.navigateTo({
            url: `/pages/${typeCode}_task/index?packageId=${packageId}`
        })
    }

    render(){
        let {taskType} = this.state;

        if(taskType.length > 0){
            taskType = taskType.map((item) => {
                return (
                    <View className="task_wrap">
                        <Button 
                            type='primary' 
                            className="task_wrap_btn"
                            onClick={ () => this.navigateToTask(item.packageId, item.typeCode) }
                        >{item.packageName}:{item.typeName}</Button>
                        <Text className="task_wrap_text">{item.priceRange}</Text>
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