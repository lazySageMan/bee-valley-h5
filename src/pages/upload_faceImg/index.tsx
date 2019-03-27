import Taro from '@tarojs/taro'
import {
  AtIcon,
  AtButton
} from 'taro-ui'
import {
  View,
  Image
} from '@tarojs/components'
import {
  uploadImg
} from '../../utils/beevalley'
import i18next from '../../i18n'
import NavBar from '../../components/navBar/index'

import './index.scss'

export default class UploadFaceImg extends Taro.Component {
  constructor(props){
    super(props);
    this.state = {
      photoSrc: null
    }
    this.apiToken = Taro.getStorageSync('apiToken');
  }

  getImg = () => {
    Taro.chooseImage({
      count: 1
    }).then((res) => {
      let photoSrc = res.tempFilePaths[0];;
      this.setState({
        photoSrc: photoSrc
      })
    })
  }

  delete = () => {
    this.setState({
      photoSrc: null
    })
  }

  submitWork = () => {
    let {photoSrc} = this.state;
    if (!photoSrc) {
      Taro.showToast({
        title: `${i18next.t('correspondingpicture')}`
      })
      return ;
    }else {
      Taro.showLoading({
        title: `${i18next.t('Loadingin')}...`
      })

      uploadImg(this.apiToken, photoSrc).then(() => {
        Taro.hideLoading();
        Taro.showToast({
          title: i18next.t('Uploadsucceeded'),
          success: () => {
            Taro.navigateBack({
              delta: 1
            })
          }
        })
      }).catch((err) => {
        Taro.showToast({
          title: err
        })
      })
    }
  }

  render(){

    let { photoSrc } = this.state;

    return (
      <View className='uploadImgWrap'>
        <NavBar title='上传照片'></NavBar>
        <View className='uploadImg'>
          <View className='show-item'>
            <View className='img-item'>
              {
                photoSrc ?
                (
                  <View className='showImg'>
                    <AtIcon size='20' value='close-circle' color='red' onClick={this.delete}></AtIcon>
                    <Image src={photoSrc} className='img' mode='aspectFit'></Image>
                  </View>
                )
                :
                (
                  <View className='showIcon' onClick={this.getImg}>
                    <AtIcon size='60' value='camera' color='orange'></AtIcon>
                    {i18next.t('addpicture')}
                  </View>
                )
              }
              <View className='info'>请提交正面肖像照片</View>
            </View>
          </View>
        </View>
        <View className='bottom-btn'>
          <AtButton type='primary' circle className='btn' onClick={this.submitWork}>{i18next.t('Submit')}</AtButton>
        </View>
      </View>
    )
  }
}
