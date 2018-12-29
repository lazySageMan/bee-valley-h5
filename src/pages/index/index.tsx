import Taro from '@tarojs/taro'
import {
  AtTabs,
  AtTabsPane
} from 'taro-ui'
import {
  View
} from '@tarojs/components'
import TaskList from '../../components/taskList/index'
import {
  listAuthorizedWork,
  listAuthorizedReview,
  checkDveice
} from '../../utils/beevalley'

import './index.scss'

export default class Index extends Taro.Component {

  constructor() {
    super(...arguments)
    this.state = {
      current: 0,
      taskList: [],
      reviewList: []
    }
  }

  componentDidMount() {

    this.apiToken = Taro.getStorageSync('apiToken');

    let res = Taro.getSystemInfoSync()
    this.isMobile = checkDveice(res)

    listAuthorizedWork(this.apiToken).then((taskList) => {
      if (this.isMobile) {
        taskList = taskList.filter((item) => item.typeCode !== "count")
      }
      this.setState({
        taskList: taskList
      })
    })

    listAuthorizedReview(this.apiToken).then((reviewList) => {
      if (this.isMobile) {
        reviewList = reviewList.filter((item) => item.typeCode !== "count")
      }
      this.setState({
        reviewList: reviewList
      })
    })

  }

  navigateToTask = (item) => {
    Taro.navigateTo({
      url: `/pages/${item.typeCode}_task/index?packageId=${item.packageId}`
    })
  }

  navigateToReview = (item) => {
    Taro.navigateTo({
      url: `/pages/${item.typeCode}_review/index?packageId=${item.packageId}`
    })
  }

  handleClick(value) {
    this.setState({
      current: value
    })
  }

  render() {
    const tabList = [{
      title: '任务列表'
    }, {
      title: '审核列表'
    }]
    return (
      <View className='list-wrap'>
            <AtTabs current={this.state.current} tabList={tabList} onClick={this.handleClick.bind(this)}>
                <AtTabsPane current={this.state.current} index={0} >
                    <TaskList isMobile={this.isMobile} taskList={this.state.taskList} handleClick={this.navigateToTask} ></TaskList>
                </AtTabsPane>
                <AtTabsPane current={this.state.current} index={1}>
                    {/* 审核列表 */}
                    <TaskList taskList={this.state.reviewList} handleClick={this.navigateToReview} ></TaskList>
                </AtTabsPane>
            </AtTabs>
      </View>
    )
  }

}
