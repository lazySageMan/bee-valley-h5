import Taro, {
  Component
} from '@tarojs/taro'
import {
  View,
  Text,
  Button,
  Input,
  Image
} from '@tarojs/components'
import {
  phoneLogin,
  wechatLogin,
  checkDveice
} from '../../utils/beevalley'
import i18next from '../../i18n'
import './index.scss'
import wechat from '../../image/weixin.png'
import phone from '../../image/message.png'

export default class Login extends Component {

  constructor(props) {
    super(props)
    this.state = {
      language: 'chinese'
    }
  }

  login = () => {
    let {
      username,
      password
    } = this.state;
    if (!username || !password) {
      Taro.showToast({
        title: i18next.t('empty'),
        mask: true
      })
    } else {
      phoneLogin(this.state.username, this.state.password).then((token) => {

          Taro.setStorageSync('apiToken', token)
          Taro.setStorageSync('login', true)

          Taro.redirectTo({
            url: '/pages/index/index'
          })
      }).catch(this.defaultErrorHandling)
    }
  }

  defaultErrorHandling = (error) => {

    Taro.showToast({
      title: i18next.t('Loginfailed'),
      mask: true
    })

  }

  wechatLogin = () => {
    Taro.navigateTo({
      url: '/pages/wechat_login/index'
    })
  }

  componentDidMount() {
    const login = Taro.getStorageSync('login')

    let res = Taro.getSystemInfoSync()
    let isMobile = checkDveice(res)
    this.setState({
      isMobile: isMobile
    })

    if (login === true) {
      Taro.redirectTo({
        url: '/pages/index/index'
      })
    }
    var url = new URL(window.location.href);
    this.code = url.searchParams.get('code');
    if (this.code) {
      wechatLogin(this.code).then((token) => {
          Taro.setStorageSync('apiToken', token)
          Taro.setStorageSync('login', true)

          Taro.redirectTo({
            url: '/pages/index/index'
          })
      }).catch(this.defaultErrorHandling)
    }

  }

  handleUsernameChange = (event) => {
    this.setState({
      username: event.target.value
    });
  }

  handlePasswordChange = (event) => {
    this.setState({
      password: event.target.value
    });
  }

  toRegister = () => {
    Taro.navigateTo({
      url: '/pages/signup/index'
    })
  }

  phoneLogin = () => {
    Taro.navigateTo({
      url: '/pages/phone_login/index'
    })
  }

  changeLanGe = (language) => {
    if(language === 'chinese'){
      i18next.changeLanguage('cn');
    }else{
      i18next.changeLanguage('en');
    }
    this.setState({
      language: language
    })
  }

  render() {
    let {
      isMobile,
      language
    } = this.state;

    return (
      <View className='loginWrap'>
        <View className='changeLanguage'>
          <Text className={language === 'english' ? 'select' : ''} onClick={this.changeLanGe.bind(this, 'english')}>English</Text>|<Text className={language === 'chinese' ? 'select' : ''} onClick={this.changeLanGe.bind(this, 'chinese')} >中文</Text>
        </View>
        <View className='wrap'>
          <Text className='title'>{i18next.t("userLogin")}</Text>
          <Input className='inputText' type='text' placeholder={i18next.t('account')} onChange={this.handleUsernameChange} />
          <Input className='inputText' type='password' placeholder={i18next.t('passWord')} onChange={this.handlePasswordChange} />
          <Button className='btn' onClick={this.login}>{i18next.t('login')}</Button>
          <View className='viewText'>
            <Text>{i18next.t('forgetPassWord')}？</Text>
            <Text>{i18next.t('noAccount')}？<Text className='onResiges' onClick={this.toRegister}>{i18next.t('register')}</Text></Text>
          </View>
          <View className='iconMenu'>
            <View className='iconTitle'>{i18next.t('otherLogin')}</View>
          </View>
          <View className='otherLogin'>
            {!isMobile &&
              <View className='icon' onClick={this.wechatLogin}>
                <Image className='img' src={wechat}></Image>
              </View>
            }
            <View className='icon' onClick={this.phoneLogin}>
              <Image className='img' src={phone}></Image>
            </View>
          </View>
        </View>
      </View>
    )
  }
}
