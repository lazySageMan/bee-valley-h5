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

        const query = Taro.createSelectorQuery()
        query
            .select('.wrapList')
            .fields({
                size: true,   
            }, res => {
                
                this.screenWidth = Math.floor(res.width);
                this.screenHeight = Math.floor(res.height);
            })
            .exec();

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

        if(taskType && this.screenWidth < 500){
            taskType = taskType.map((item) => {
                return (
                    <View 
                        className="task_wrap" 
                        onClick={ () => this.navigateToTask(item.packageId, item.typeCode)}
                    >
                        <Text 
                            className="task_wrap_btn"
                        >{item.packageName}:{item.typeName}</Text>
                        <Text className="task_wrap_text">{item.priceRange}元/张</Text>
                    </View>
                )
            })
        }else{
            taskType = taskType.map((item) => {
                return (
                    <View 
                        className="task_wrap" 
                        onClick={ () => this.navigateToTask(item.packageId, item.typeCode)}
                    >
                        <Button 
                            type="primary"
                            className="task_wrap_btn"
                        >{item.packageName}:{item.typeName}</Button>
                        <Text className="task_wrap_text">{item.priceRange}元/张</Text>
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