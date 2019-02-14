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
import i18next from '../../../src/i18n'

import './index.scss'

let allowedTask = ['rect', 'count', 'collect']
let allowedReview = ['rect', 'count', 'collect', 'attribute']

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
    //测试
    console.log(i18next.t("changeToEnglish"));



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
    if (allowedTask.includes(item.typeCode)) {
      Taro.navigateTo({
        url: `/pages/${item.typeCode}_task/index?packageId=${item.packageId}`
      })
    }
  }

  navigateToReview = (item) => {
    if (allowedReview.includes(item.typeCode)) {
      Taro.navigateTo({
        url: `/pages/${item.typeCode}_review/index?packageId=${item.packageId}`
      })
    }
  }

  handleTabClick(value) {
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
        <AtTabs current={this.state.current} tabList={tabList} onClick={this.handleTabClick.bind(this)}>
            <AtTabsPane current={this.state.current} index={0} >
                <TaskList isMobile={this.isMobile} taskList={this.state.taskList} onClick={this.navigateToTask} ></TaskList>
            </AtTabsPane>
            <AtTabsPane current={this.state.current} index={1}>
                {/* 审核列表 */}
                <TaskList taskList={this.state.reviewList} onClick={this.navigateToReview} ></TaskList>
            </AtTabsPane>
        </AtTabs>
      </View>
    )
  }

}
