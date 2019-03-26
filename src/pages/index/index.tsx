import Taro from '@tarojs/taro'
import {
  AtTabs,
  AtTabsPane
} from 'taro-ui'
import {
  View,
  Button
} from '@tarojs/components'
import TaskList from '../../components/taskList/index'
import {
  listAuthorizedWork,
  listAuthorizedReview,
  checkDveice
} from '../../utils/beevalley'
import i18next from '../../i18n'

import './index.scss'

let allowedTask = ['rect', 'count', 'collect', 'attribute']
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
    this.apiToken = Taro.getStorageSync('apiToken');

    this.isShowReview = Taro.getStorageSync('taskonly') ? Taro.getStorageSync('taskonly') : false;

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

  logout = () => {

    Taro.showModal({
      title: i18next.t('Tips'),
      content: i18next.t('sureLogout'),
      confirmText: i18next.t('sure'),
      cancelText: i18next.t('cancel'),
      success: (res) => {
        if (res.confirm) {
          Taro.removeStorageSync('login')
          Taro.removeStorageSync('apiToken')
          Taro.redirectTo({
            url: '/'
          })
        }
      }
    })
  }

  uploadImg = () => {
    Taro.navigateTo({
      url: '/pages/upload_faceImg/index'
    })
  }

  render() {
    console.log(this.isShowReview)
    const tabList = !this.isShowReview ?
      [{
        title: i18next.t('TaskList')
        }, {
        title: i18next.t('Auditlist')
      }] :
      [{
        title: i18next.t('TaskList')
      }];
    return (
      <View className='indexwrap'>
        <Button className='logout' type='secondary' onClick={this.logout}>{i18next.t('logout')}</Button>
        <Button className='uploadImgs' type='secondary' onClick={this.uploadImg}>{i18next.t('Uploadface')}</Button>
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
      </View>
    )
  }

}
