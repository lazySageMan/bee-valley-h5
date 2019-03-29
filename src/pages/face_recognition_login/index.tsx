import Taro, {
  Component
} from '@tarojs/taro';
import {
  View
} from '@tarojs/components';
import {
  faceLogin
} from '../../utils/beevalley'
import NavBar from '../../components/navBar/index'
import FaceRecognition from '../../components/faceRecognition/index'
import i18next from '../../i18n';
import './index.scss'

export default class faceRecognitionLogin extends Component {

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.phone = this.$router.params.phone;
    this.region = this.$router.params.region;
    this.apiToken = Taro.getStorageSync('apiToken');
  }

  onGetImgSrc = (imgSrc) => {

    Taro.showLoading({
      title: `${i18next.t('Loadingin')}...`
    })

    // console.log(imgSrc)

    return faceLogin(this.region, this.phone, imgSrc).then(res => {
      Taro.hideLoading()
      if (res.statusCode === 200) {
        Taro.setStorageSync('apiToken', res.data)
        Taro.setStorageSync('login', true)
        Taro.redirectTo({
          url: '/pages/index/index'
        })
        return true
      } else {
        console.log(res.data)
        // let error = JSON.parse(res.data);
        // Taro.hideLoading();
        // let message = error.error.message ? error.error.message : error.error;
        // Taro.showModal({
        //   title: i18next.t('Tips'),
        //   content: message,
        //   confirmText: i18next.t('Gotit'),
        //   showCancel:false,
        //   success: () => {
        //     if (error.error.message){
        //       window.location.reload();
        //     }else{
        //       Taro.navigateBack({
        //         delta: 1
        //       })
        //     }
        //   }
        // })
        return false
      }
    })
  }

  render() {
    return (
      <View className='faceLogin'>
        <NavBar title={i18next.t('faceRecognitionLogin')}></NavBar>
        <View id='imgItem'>
          <FaceRecognition onGetImgSrc={this.onGetImgSrc}></FaceRecognition>
        </View>
      </View>
    )
  }
}
