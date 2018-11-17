import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtTabs, AtTabsPane } from 'taro-ui'
import TaskList from '../task_list/index'

export default class CountTabs extends Taro.Component {constructor () {
    super(...arguments)
    this.state = {
      current: 0,
    }
  }
  handleClick (value) {
    this.setState({
      current: value
    })
  }
  render () {
    const tabList = [{ title: '任务列表' }, { title: '审核列表' }]
    return (
      <AtTabs current={this.state.current} tabList={tabList} onClick={this.handleClick.bind(this)}>
        <AtTabsPane current={this.state.current} index={0} >
            <TaskList></TaskList>
        </AtTabsPane>
        <AtTabsPane current={this.state.current} index={1}>
            {/* 审核列表 */}
            <TaskList></TaskList>
        </AtTabsPane>
      </AtTabs>
    )
  }

}