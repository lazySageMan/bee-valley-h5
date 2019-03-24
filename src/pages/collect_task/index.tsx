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
import i18next from '../../i18n';

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

  getDiff = (arr1, arr2) => {
    return arr1.filter(i => arr2.indexOf(i) < 0)
  }

  nextWork = () => {
    Taro.showLoading({
      title: `${i18next.t('Loadingin')}...`
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
            title: `${i18next.t('Loadingin')}...`
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
          title: i18next.t('Tips'),
          content: i18next.t('notask'),
          confirmText: i18next.t('Gotit'),
          showCancel: false,
          success: function(){
            Taro.navigateBack({
              delta: 1
            })
          }
        })
      }
    }).catch(this.defaultErrorHandling)
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
          title: i18next.t('Tips'),
          content: i18next.t('Uploadsucceeded'),
          confirmText: i18next.t('Gotit'),
          showCancel: false,
          success:  () => {
            this.workId = null;
            Taro.navigateBack({
              delta: 1
            })
          }
        })
      }).catch(this.defaultErrorHandling)
    } else {
      let ele = currentWork[this.countIndex];
      if (!ele.shouldUpload) {
        this.countIndex++;
        this.uploadImg();
      } else {
        uploadWorkFile(this.apiToken, this.workId, ele.photoSrc).then(res => {
          this.countIndex++;
          ele.fileId = res[0];
          this.uploadImg();
        })
      }
    }
  }

  submitWork = () => {
    let { currentWork } = this.state;

    if (currentWork.findIndex(img => !img.photoSrc) === -1) {
      Taro.showLoading({
        title: `${i18next.t('Uploadin')}...`
      })
      this.uploadImg();

    }else{
      Taro.showModal({
        title: i18next.t('Tips'),
        content: i18next.t('correspondingpicture'),
        confirmText: i18next.t('Gotit'),
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
      title: i18next.t('Abandonment'),
      content: i18next.t('currenttask'),
      confirmText: i18next.t('Gotit'),
      cancelText: i18next.t('cancel'),
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
              <View className='eg-item'>{i18next.t('Example')}</View>
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
                            <View>{i18next.t('imagesuccessfully')}</View>
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
                      {i18next.t('addpicture')}
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
            <View className='title'>{i18next.t('Taskrequirements')}</View>
            <View className='content-list'>
              {details.map((v, i) => {
                return (
                  <View className='list-item' key={i}>{(i + 1) + '. '}{v}</View>
                )
              })}
            </View>

          </View>
        </View>
        <View className='user-photo'>
          <View className='user-photo-wrap'>
            <View className='title'>
              <AtIcon size='30' value='image' color='orange'></AtIcon>
              <Text className='font'>{i18next.t('Takephoto')}</Text>
            </View>
            <View className='take-photo'>
              {sampleImageView}
            </View>
            <View className='info'>{i18next.t('shoot')} {currentWork.length} {i18next.t('Groupphotos')}</View>
            <View className='cenggao'></View>
          </View>
        </View>
        <View className='cengHeight'></View>
        <View className='top'>
          <NavBar title={i18next.t('CaptureTasks')}></NavBar>
        </View>

        <View className='bottom-btn'>
          <AtButton type='primary' circle className='btn' onClick={this.submitWork}>{i18next.t('Submit')}</AtButton>
          <AtButton type='primary' circle className='btn' onClick={this.cancelWork}>{i18next.t('Give')}</AtButton>
        </View>
      </View>
    )
  }
}
