import Taro from '@tarojs/taro'
import {
  View,
  Image,
  Text
} from '@tarojs/components'
import {
  AtButton,
  AtIcon
} from 'taro-ui'
import NavBar from '../../components/navBar/index'
import {
  fetchWork,
  submitWork,
  uploadWorkFile,
  downloadWorkFiles,
  cancelWork
} from '../../utils/beevalley'

import './index.scss'

export default class DataAcquistion extends Taro.Component {

  constructor() {
    super(...arguments)
    this.state = {
      currentWork: [],
      details: []
    }
    this.apiToken = Taro.getStorageSync('apiToken');
  }

  componentDidMount() {
    this.packageId = this.$router.params.packageId
    this.nextWork();
  }

  componentWillUnmount() {
    if (this.workId) {
      cancelWork(this.apiToken, [this.workId]);
    }
  }

  getDiff = (arr1, arr2) => {
    return arr1.filter(i => arr2.indexOf(i) < 0)
  }

  nextWork = () => {
    Taro.showLoading({
      title: '加载中...'
    })
    this.countIndex = 0;
    fetchWork(this.apiToken, 'collect', 1, this.packageId).then(res => {
      if (res.length > 0) {
        let work = res[0];
        // TODO fix potential bug here
        this.workId = work.id
        let workData = work.meta.samples.map( v => {
          return {
            samplesSrc: v,
            shouldUpload: true,
            photoSrc: null,
            fileId: null
          }
        })

        if (work.previousWork){
          let successImg = this.getDiff(work.previousWork.result, work.meta.rejectedReason);
          Taro.showLoading({
            title: '加载中...'
          })
          successImg.forEach(f => {
            let index = work.previousWork.result.indexOf(f)
            workData[index].shouldUpload = false
            workData[index].fileId = f

            downloadWorkFiles(this.apiToken, work.id, f).then( res => {
              workData[index].photoSrc = 'data:image/jpeg;base64,' + Taro.arrayBufferToBase64(new Uint8Array(res));
              this.setState({
                currentWork: workData
              })
            })
          })
        }
        this.setState({
          details: work.details,
          currentWork: workData
        })
        Taro.hideLoading();
      } else {
        Taro.hideLoading();
        Taro.showModal({
          title: '提示',
          content: '当前没有任务了！',
          confirmText: '知道了',
          showCancel: false,
          success: function(){
            this.workId = null;
            Taro.navigateBack({
              delta: 1
            })
          }
        })
      }
    })
  }

  getImg = (index) => {
    Taro.chooseImage({
      count: 1
    }).then((res) => {
      this.setState(prevState => {
        let currentWork = prevState.currentWork;
        currentWork[index].photoSrc = res.tempFilePaths[0];
        return {
          currentWork: currentWork
        }
      })
    })
  }

  delete = (index) => {
    this.setState(prevState => {
      let currentWork = prevState.currentWork;
      currentWork[index].photoSrc = null
      return {
        currentWork: currentWork
      }
    })
  }

  uploadImg = () => {
    let { currentWork } = this.state;
    if (this.countIndex === currentWork.length) {
      let uploadImgId = currentWork.map(v => v.fileId).filter(f => f);
      submitWork(this.apiToken, this.workId, uploadImgId).then(res => {
        Taro.hideLoading();
        Taro.showModal({
          title: '提示',
          content: '上传成功',
          confirmText: '知道了',
          showCancel: false,
          success: function () {
            Taro.navigateBack({
              delta: 1
            })
          }
        })


      })
    } else {
      let ele = currentWork[this.countIndex];
      if (!ele.shouldUpload) {
        this.countIndex++;
        this.uploadImg();
      } else {
        uploadWorkFile(this.apiToken, this.workId, ele.photoSrc).then(res => {
          // console.log(res)
          this.countIndex++;
          ele.fileId = res;
          this.uploadImg();
        })
      }
    }
  }

  submitWork = () => {
    let { currentWork } = this.state;

    if (currentWork.findIndex(img => !img.photoSrc) === -1) {
      Taro.showLoading({
        title: '上传中...'
      })
      this.uploadImg();

    }else{
      Taro.showModal({
        title: '提示',
        content: '请上传对应图片',
        confirmText: '知道了',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            // console.log(1)
          }
        }
      })
    }
  }

  cancelWork = () => {
    Taro.showModal({
      title: '放弃任务',
      content: '确定放弃当前任务',
      confirmText: "知道了",
      success: function (res) {
        if (res.confirm) {
          Taro.navigateBack({
            delta: 1
          })
        }
      }
    })
  }

  render() {

    let {
       currentWork,
       details
    } = this.state;
    let sampleImageView
    if (currentWork) {
      sampleImageView = currentWork.map((item, index) => {
        return (
          <View key={index} className='show-item'>
            <View className='eg img-item'>
              <View className='eg-item'>示例</View>
              <Image src={item.samplesSrc} className='img' mode='aspectFit'></Image>
            </View>
            <View className='img-item'>
              {
                item.photoSrc ?
                  (
                    <View className='showImg'>
                      {
                        !item.shouldUpload ?
                        (
                            <View>该图片上传成功</View>
                        )
                        :
                        (
                            <AtIcon size='20' value='close-circle' color='red' onClick={this.delete.bind(this, index)}></AtIcon>
                        )
                      }
                      <Image src={item.photoSrc} className='img' mode='aspectFit'></Image>
                    </View>
                  )
                  :
                  (
                    <View className='showIcon' onClick={this.getImg.bind(this, index)}>
                      <AtIcon size='60' value='camera' color='orange'></AtIcon>
                      添加图片
                                              </View>
                  )
              }
            </View>
          </View>

        )
      })
    }

    return (
      <View className='data-wrap-task'>
        <View className='main-content'>
          <View className='task_demand'>
            <View className='title'>任务要求</View>
            <View className='content-list'>
              {details.map((v, i) => {
                return (
                  <View className='list-item' key={i}>{i + 1}{v}</View>
                )
              })}
            </View>

          </View>
        </View>
        <View className='user-photo'>
          <View className='user-photo-wrap'>
            <View className='title'>
              <AtIcon size='30' value='image' color='orange'></AtIcon>
              <Text className='font'>拍摄第一张照片</Text>
            </View>
            <View className='take-photo'>
              {sampleImageView}
            </View>
            <View className='info'>请拍摄{currentWork.length}组照片</View>
            <View className='cenggao'></View>
          </View>
        </View>
        <View className='cengHeight'></View>
        <View className='top'>
          <NavBar title='采集任务'></NavBar>
        </View>

        <View className='bottom-btn'>
          <AtButton type='primary' circle className='btn' onClick={this.submitWork}>提交</AtButton>
          <AtButton type='primary' circle className='btn' onClick={this.cancelWork}>放弃</AtButton>
        </View>
      </View>
    )
  }
}
