import Taro, {
  Component
} from '@tarojs/taro'
import {
  View,
  Button,
  Image
} from '@tarojs/components'
import {
  fetchReview,
  downloadReviewFile,
  submitReview,
  cancelWork
} from '../../utils/beevalley'
import NavBar from '../../components/navBar/index'

import './index.scss'

export default class PointTask extends Component {
  constructor() {
    super(...arguments);

    this.state = {
      currentWork: {}
    }
    this.apiToken = Taro.getStorageSync('apiToken');
    this.work = [];
  }

  componentDidMount = () => {
    this.packageId = this.$router.params.packageId;

    this.nextReview();
  }

  componentWillUnmount() {
    if (this.work) {
      let toCancel = this.work.map(w => w.id)
      if (this.state.currentWork && this.state.currentWork.id) {
        toCancel.push(this.state.currentWork.id)
      }
      if (toCancel.length > 0) {
        cancelWork(this.apiToken, toCancel)
      }
    }

  }

  defaultErrorHandling = () => {
    Taro.hideLoading()
    Taro.navigateBack({
      delta: 1
    })
  }

  nextReview = () => {
    Taro.showLoading({
      title: 'loading',
      mask: true
    })
    if (this.work.length === 0) {
      this.fetchReview();
    } else {
      let nowWork = this.work.pop();

      this.downLoadImg(nowWork);
    }
  }

  fetchReview = () => {
    fetchReview(this.apiToken, 'attribute', 3, this.packageId).then((res) => {
      if (res.length === 0) {
        Taro.hideLoading();
        Taro.showModal({
          title: '提示',
          content: '当前没有任务了',
          showCancel: false,
          confirmText: '知道了',
          success: function () {
            Taro.navigateBack({
              delta: 1
            })
          }
        })

      } else {
        this.work = res;
        this.nextReview();
      }
    })
  }

  downLoadImg = (work) => {
    if (work.id) {
      downloadReviewFile(this.apiToken, work.id, false).then((res) => {
        let imgBase64 = 'data:image/jpeg;base64,' + Taro.arrayBufferToBase64(new Uint8Array(res));
        work.src = imgBase64;
        this.setState({
          currentWork: work
        })
        Taro.hideLoading()
      })
    }
  }

  submitWork = () => {
    Taro.showLoading({
      title: '提交中',
      mask: true
    })
    let {
      currentWork
    } = this.state;
    submitReview(this.apiToken, currentWork.id, true).then(() => {
      Taro.hideLoading();
      this.nextReview();
    }).catch(() => {
      this.defaultErrorHandling()
    })
  }

  cancelWork = () => {
    Taro.showLoading({
      title: '放弃中',
      mask: true
    })
    let {
      currentWork
    } = this.state;
    cancelWork(this.apiToken, [currentWork.id]).then(() => {

      Taro.hideLoading();
      this.nextReview();

    }).catch(() => {
      this.defaultErrorHandling()
    })
  }

  rejectWork = () => {
    Taro.showLoading({
      title: '驳回中',
      mask: true
    })
    let {
      currentWork
    } = this.state;
    submitReview(this.apiToken, currentWork.id, false).then(() => {
      Taro.hideLoading();
      this.nextReview();
    }).catch(() => {
      this.defaultErrorHandling()
    })
  }

  render() {

    let {
      currentWork
    } = this.state;
    let showAttr = null;
    if (currentWork.src) {

      showAttr = currentWork.work.result.map((v, index) => {
        return (
          <View key={index}  className='itemAttribute'>
                        {`${v.attr}: ${v.value}`}
                    </View>
        )
      })

    }
    return (
      <View className='count'>
                <NavBar title='属性标注审核' />
                <View className='imgItem1'>
                    {currentWork && currentWork.src && (
                        <Image src={currentWork.src} mode='widthFix' style={`width:${currentWork.meta.imageWidth}PX;height:${currentWork.meta.imageHeight}PX;`}></Image>
                    )
                    }
                    <View className='showAttr'>
                        {showAttr}
                    </View>
                </View>
                <View className='btnItem'>
                    <Button type='primary' onClick={this.submitWork}>通过</Button>
                    <Button type='warn' onClick={this.rejectWork}>驳回</Button>
                    <Button style='background: #FFCC00;' type='warn' onClick={this.cancelWork}>放弃</Button>
                </View>
            </View>
    )
  }
}
