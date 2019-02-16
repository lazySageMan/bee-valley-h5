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
import i18next from '../../i18n'
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

  defaultErrorHandling = (error) => {
    Taro.hideLoading()
    if (error === 'forbidden') {
      Taro.navigateBack({
        delta: 1
      })
    } else {
      Taro.showToast({
        title: error,
        mask: true
      })
    }
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
          title: i18next.t('Tips'),
          content: i18next.t('notask'),
          showCancel: false,
          confirmText: i18next.t('Gotit'),
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
    }).catch(this.defaultErrorHandling)
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
      }).catch(this.defaultErrorHandling)
    }
  }

  submitWork = () => {
    Taro.showLoading({
      title: i18next.t('Submit'),
      mask: true
    })
    let {
      currentWork
    } = this.state;
    submitReview(this.apiToken, currentWork.id, true).then(() => {
      Taro.hideLoading();
      this.nextReview();
    }).catch(this.defaultErrorHandling)
  }

  cancelWork = () => {
    Taro.showLoading({
      title: i18next.t('Abandonmentin'),
      mask: true
    })
    let {
      currentWork
    } = this.state;
    cancelWork(this.apiToken, [currentWork.id]).then(() => {

      Taro.hideLoading();
      this.nextReview();

    }).catch(this.defaultErrorHandling)
  }

  rejectWork = () => {
    Taro.showLoading({
      title: i18next('dismissed'),
      mask: true
    })
    let {
      currentWork
    } = this.state;
    submitReview(this.apiToken, currentWork.id, false).then(() => {
      Taro.hideLoading();
      this.nextReview();
    }).catch(this.defaultErrorHandling)
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
      <View className='attribute_review'>
        <NavBar title={i18next.t('CalloutAudit')} />
                <View className='imgItem'>
                    {currentWork && currentWork.src && (
                        <Image src={currentWork.src} mode='widthFix' style={`width:${currentWork.meta.imageWidth}PX;height:${currentWork.meta.imageHeight}PX;`}></Image>
                    )
                    }
                    <View className='showAttr'>
                        {showAttr}
                    </View>
                </View>
                <View className='btnItem'>
          <Button type='primary' onClick={this.submitWork}>{i18next.t('pass')}</Button>
          <Button type='warn' onClick={this.rejectWork}>{i18next.t('dismissed')}</Button>
          <Button style='background: #FFCC00;' type='warn' onClick={this.cancelWork}>{i18next.t('Give')}</Button>
                </View>
            </View>
    )
  }
}
