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

  constructor(props){
    super(props)
  }

  componentDidMount(){
    this.phone = this.$router.params.phone;
    this.region = this.$router.params.region;
    this.apiToken = Taro.getStorageSync('apiToken');
  }

  onGetImgSrc = (imgSrc) => {

    faceLogin(this.apiToken, this.region, this.phone, imgSrc).then(res => {
      console.log(res);
      alert(res);
    }).catch(err => {
      console.log(err)
      alert(err)
    })
  }

  render(){
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
