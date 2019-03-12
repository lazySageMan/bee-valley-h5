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
  checkDveice,
  selectRegion,
  closeList,
  openList
} from '../../utils/beevalley'
import i18next from '../../i18n'
import PullDown from '../../components/pullDownLIst/index.tsx'
import allRegion from '../../utils/allRegion'
import './index.scss'
import wechat from '../../image/weixin.png'
import phone from '../../image/message.png'
// import QQ from '../../image/qqlogin.png'

export default class Login extends Component {

  constructor(props) {
    super(props)
    this.state = {
      language: 'cn',
      regionData: {
        selectIndex: 0,
        allRegion: allRegion,
        isOpen: false
      }
    }
  }

  login = () => {
    let {
      username,
      password,
      regionData
    } = this.state;
    if (!username || !password) {
      Taro.showToast({
        title: i18next.t('empty'),
        mask: true
      })
    } else {
      phoneLogin(this.state.username, this.state.password, regionData.allRegion[regionData.selectIndex].region).then((token) => {

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
    if (i18next.language.toString() === 'en-US'){
      this.setState({
        language: 'en'
      })
    }else{
      this.setState({
        language: i18next.language.toString()
      })
    }
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

  // qqLogin = () => {
  //   Taro.navigateTo({
  //     url: '/pages/qq_login/index'
  //   })
  //   console.log('qqLogin')
  // }

  changeLanGe = (language) => {
    i18next.changeLanguage(language)
    this.setState({
      language: language
    })
  }

  resetPassword = () => {
    Taro.navigateTo({
      url: '/pages/reset_password/index'
    })
  }

  render() {
    let {
      isMobile,
      language,
      regionData
    } = this.state;

    return (
      <View className='loginWrap' onClick={() => closeList(this)}>
        <View className='changeLanguage'>
          <Text className={language === 'en' ? 'select' : ''} onClick={this.changeLanGe.bind(this, 'en')}>English</Text>|<Text className={language === 'cn' ? 'select' : ''} onClick={this.changeLanGe.bind(this, 'cn')} >中文</Text>
        </View>
        <View className='wrap'>
          <Text className='title'>{i18next.t("userLogin")}</Text>
          <View className='userInput'>
            <PullDown selectRegion={selectRegion} that={this} openList={openList} defaultSelect={regionData.allRegion[regionData.selectIndex].name} isOpen={regionData.isOpen} allRegion={regionData.allRegion}></PullDown>
            <Input className='userName' type='text' placeholder={i18next.t('account')} onChange={this.handleUsernameChange} />
          </View>
          <Input className='inputText' type='password' placeholder={i18next.t('passWord')} onChange={this.handlePasswordChange} />
          <Button className='btn' onClick={this.login}>{i18next.t('login')}</Button>
          <View className='viewText'>
            <Text><Text className='onResiges' onClick={this.resetPassword}>{i18next.t('forgetPassWord')}</Text>？</Text>
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
{/*            <View className='icon' onClick={this.qqLogin}>
              <Image className='img' src={QQ}></Image>
            </View>*/}
          </View>
        </View>
      </View>
    )
  }
}
