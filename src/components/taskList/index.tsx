import { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './index.scss'

export default class TaskList extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        let { taskList } = this.props;

        // let newTaskList = this.props.isMobile ? taskList.concat([{packageId: 'data_acquistion', typeCode: 'data_acquistion', packageName: '测试', typeName: '老人图像采集', priceRange: '10'}]) : taskList

        let taskItems = taskList.map((item) => {
            return (
                <View
                  key={item.packageId + '_' + item.typeCode}
                  className='task_wrap'
                  onClick={this.props.onClick.bind(this, item)}
                >
                    <Text
                      className='task_wrap_btn'
                    >{item.packageName}:{item.typeName}</Text>
                    <Text className='task_wrap_text'>{item.priceRange}元/张</Text>
                </View>
            )
        })

        return (
            <View className='wrapList'>
                {taskItems}
            </View>
        )
    }

}
