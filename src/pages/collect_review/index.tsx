import Taro from '@tarojs/taro'
import {
  View,
  Image,
  Text
} from '@tarojs/components'
import {
  AtButton,
  AtIcon,
  AtCheckbox
} from 'taro-ui'
import NavBar from '../../components/navBar/index'
import {
  fetchReview,
  downloadReviewFiles,
  submitReview,
  cancelWork
} from '../../utils/beevalley'

import './index.scss'

export default class reviewData extends Taro.Component {
  constructor() {
    super(...arguments)

    this.state = {
      images: [],
      details: [],
      showModeImg: {
        src: '',
        width: '',
        height: '',
        isOpened: false
      }
    }

    this.checkboxOption = [{
      value: 'checked',
      label: '不合格',
    }]

    this.apiToken = Taro.getStorageSync('apiToken');

  }

  handleChange(index, value) {
    this.setState(prevState => {
      let updated = prevState.images
      updated[index].checked = value
      return {
        images: updated
      }
    })
  }

  componentDidMount() {
    this.packageId = this.$router.params.packageId
    Taro.showLoading({
      title: 'loading',
      mask: true
    })
    this.nextWork()
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

  componentWillUnmount() {
    if (this.reviewId) {
      cancelWork(this.apiToken, [this.reviewId]);
    }
  }

  nextWork = () => {

    this.setState({
      images: []
    })
    this.reviewId = null
    fetchReview(this.apiToken, 'collect', 1, this.packageId).then(res => {
      // console.log(res)
      if (res.length > 0) {
        let review = res[0],
          sampleImages = review.meta.samples,
          imageFiles = review.work.result
        this.reviewId = review.id
        imageFiles.forEach((item, index) => {
          downloadReviewFiles(this.apiToken, review.id, item).then(fileRes => {
            // TODO
            let imgBase64 = 'data:image/jpeg;base64,' + Taro.arrayBufferToBase64(new Uint8Array(fileRes));
            this.setState(prevState => {
              let updated = prevState.images
              updated[index].candidate = imgBase64
              updated[index].id = item
              return {
                images: updated
              }
            })
          })
          // TODO handle error properly

        })
        let images = sampleImages.map((item) => {
          return {
            sample: item,
            checked: []
          }
        })
        this.setState({
          images: images,
          details: review.work.details
        })
        Taro.hideLoading()
      } else {
        Taro.hideLoading()
        Taro.showModal({
          title: '提示',
          content: '当前没有任务了！',
          confirmText: '知道了',
          showCancel: false,
          success: function () {
            Taro.navigateBack({
              delta: 1
            })
          }
        })
      }
    }).catch(this.defaultErrorHandling)

  }

  submitWork = () => {
    let rejected = this.state.images.filter(item => item.checked.length > 0).map(item => item.id)
    if (!this.reviewId || rejected.length > 0) return;
    Taro.showLoading({
      title: 'loading',
      mask: true
    })
    submitReview(this.apiToken, this.reviewId, true)
      .then(() => this.nextWork())
      .catch(this.defaultErrorHandling)
  }

  rejectWork = () => {
    let rejected = this.state.images.filter(item => item.checked.length > 0).map(item => item.id)
    if (!this.reviewId || rejected.length === 0) return;
    Taro.showLoading({
      title: 'loading',
      mask: true
    })
    submitReview(this.apiToken, this.reviewId, false, rejected)
      .then(() => this.nextWork())
      .catch(this.defaultErrorHandling)
  }

  onClose = () => {
    let {
      showModeImg
    } = this.state;
    showModeImg.isOpened = false
    document.body.style.overflow = ""
    this.setState({
      showModeImg: showModeImg
    })
  }

  showImg = (item) => {
    let {
      showModeImg
    } = this.state;
    showModeImg.src = item.candidate;
    showModeImg.width = item.width;
    showModeImg.height = item.height;
    showModeImg.isOpened = true;
    document.body.style.overflow = "hidden"
    this.setState({
      showModeImg: showModeImg
    })
  }

  imgLoad = (index, ev) => {

    let {
      images
    } = this.state;

    if (ev.currentTarget.naturalHeight > 1080 || ev.currentTarget.naturalWidth > 1920) {
      let ratio = ev.currentTarget.naturalWidth / ev.currentTarget.naturalHeight;

      images[index].width = 450;
      images[index].height = 450 / ratio;
    } else {
      images[index].width = ev.currentTarget.naturalWidth;
      images[index].height = ev.currentTarget.naturalHeight;
    }

    this.setState({
      images: images
    })

  }

  render() {

    // let getMessage = (details) => {
    //   return details.map((item, index) => {
    //     return (
    //       <View key={index} className='content-list'>
    //                     <View className='list-item'>{index + 1} {item}；</View>
    //                 </View>
    //     )
    //   })

    // }

    let {
      images,
      details,
      showModeImg
    } = this.state;
    let showImg = images.map((item, index) => {
      return (
        <View key={index} className='show-item'>
                    <View className='eg img-item'>
                        <View className='eg-item'>示例</View>
                        <Image src={item.sample} className='img' mode='aspectFit'></Image>
                    </View>
                    <View className='img-item'>
                        <View className='showImg'>
                            <AtCheckbox
                              options={this.checkboxOption}
                              selectedList={item.checked}
                              onChange={this.handleChange.bind(this, index)}
                            />
                            <Image
                              src={item.candidate}
                              className='img'
                              mode='aspectFit'
                              onLoad={this.imgLoad.bind(this, index)}
                              onClick={this.showImg.bind(this, item)}
                            ></Image>
                        </View>
                    </View>
                </View>
      )
    })
    return (
      <View className='data-wrap-review'>
                {showModeImg.isOpened && (
                    <View className='hide-wrap' onClick={this.onClose}>
                        <View className='img-wrap' style={`width:${showModeImg.width}PX;height:${showModeImg.height}PX;margin:auto;`}>
                            <Image src={showModeImg.src} style={`width:${showModeImg.width}PX;height:${showModeImg.height}PX`}></Image>
                        </View>
                    </View>
                )}
                <View className='main-content'>
                    <View className='task_demand'>
                        <View className='panel__title'>第1步</View>
                        <View className='title'>审核要求</View>
                        {
                          details.map((item, index) => {
                                  return (
                                    <View key={index} className='content-list'>
                                                  <View className='list-item'>{index + 1} {item}；</View>
                                              </View>
                                  )
                                }
                        }
                    </View>
                </View>
                <View className='user-photo'>
                    <View className='user-photo-wrap'>
                        <View className='title'>
                            <AtIcon size='30' value='image' color='orange'></AtIcon>
                            <Text className='font'>审核下列图片</Text>
                        </View>
                        <View className='take-photo'>
                            {showImg}
                        </View>
                        <View className='info'>将不合格的图片勾选，并驳回</View>
                        <View className='cenggao'></View>
                    </View>
                </View>
                <View className='cengHeight'></View>
                <View className='top'>
                    <NavBar title='采集审核'></NavBar>

                </View>

                <View className='bottom-btn'>
                    <AtButton type='primary' circle className='btn1' onClick={this.submitWork}>通过</AtButton>
                    <AtButton type='primary' circle className='btn1' onClick={this.rejectWork}>驳回</AtButton>
                </View>
            </View>
    )
  }
}
