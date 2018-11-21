import { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './task_list.scss'

export default class TaskList extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        let { taskList } = this.props;

        taskList = taskList.map((item) => {
            return (
                <View
                  key={item.packageId + '_' + item.typeCode}
                  className='task_wrap'
                  onClick={this.props.handleClick.bind(this, item)}
                >
                    <Text
                      className='task_wrap_btn'
                    >{item.packageName}:{item.typeName}</Text>
                    <Text className='task_wrap_text'>{item.priceRange}元/张</Text>
                </View>
            )
        })

        let showImgData = this.props.isMobile ?  (
                <View className='task_wrap' onClick={this.props.handleClick.bind(this, "data_acquistion")}>
                    <Text className='task_wrap_btn'>测试:老人图像采集</Text>
                    <Text className='task_wrap_text'>10元/张</Text>
                </View>
            ) :  '';

        return (
            <View className='wrapList'>
                {taskList}
                {showImgData}
            </View>
        )
    }

}