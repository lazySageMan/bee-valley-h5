import Taro, {
  Component
} from '@tarojs/taro';
import {
  View
} from '@tarojs/components';
import NavBar from '../../components/navBar/index'
import FaceRecognition from '../../components/faceRecognition/index'
import i18next from '../../i18n';
import './index.scss'

export default class faceRecognitionLogin extends Component {

  constructor(props){
    super(props)
  }

  getImgSrc = (imgSrc) => {
    console.log(imgSrc);
  }

  render(){
    return (
      <View className='faceLogin'>
        <NavBar title={i18next.t('faceRecognitionLogin')}></NavBar>
        <View id='imgItem'>
          <FaceRecognition getImgSrc={this.getImgSrc}></FaceRecognition>
        </View>
      </View>
    )
  }
}
