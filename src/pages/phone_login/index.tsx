import Taro, {
  Component
} from '@tarojs/taro'
import {
  View,
  Text,
  Button,
  Input
} from '@tarojs/components'
import {
  sendMobileCode,
  loginSms,
  selectRegion,
  closeList,
  openList
} from '../../utils/beevalley'
import NavBar from '../../components/navBar/index'
import PullDown from '../../components/pullDownLIst/index.tsx'
import i18next from '../../i18n';
import allRegion from '../../utils/allRegion'
import './index.scss'

export default class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userPhone: '',
      userCode: '',
      isSendCode: true,
      sendCode: i18next.t('sendIdentifyCode'),
      userTime: 0,
      bgcolor: 'orangered',
      regionData: {
        selectIndex: 0,
        allRegion: allRegion,
        isOpen: false
      }
    }
  }

  handleUsernameChange = (event) => {
    this.setState({
      userPhone: event.target.value
    });
  }

  changeCode = (event) => {
    this.setState({
      userCode: event.target.value
    });
  }

  toLogin = () => {
    Taro.redirectTo({
      url: '/pages/login/index'
    })
  }

  lessTime = () => {
    let {
      userTime,
      sendCode,
      isSendCode
    } = this.state
    let time = Number(userTime);

    let timer = setInterval(() => {
      if (time === 0) {
        clearInterval(timer)
        this.setState({
          sendCode: i18next.t('resend'),
          bgcolor: "orangered",
          isSendCode: true
        })
      } else {
        time -= 1;
        this.setState({
          userTime: time
        })
      }
    }, 1000)

  }

  sendCode = () => {
    let {
      userPhone,
      userTime,
      isSendCode,
      regionData
    } = this.state
    if (userPhone.length === 11 && userPhone.charAt(0) === '1') {
      if (isSendCode) {
        sendMobileCode(userPhone, "login", regionData.allRegion[regionData.selectIndex].region).then(() => {
           this.setState({
              userTime: 60,
              bgcolor: 'gray',
             isSendCode: false
           }, () => this.lessTime())
        }).catch((err) => {
          // console.log(err)
          Taro.showToast({
            title: i18next.t('networkError'),
            mask: true
          })
        })
      } else {
        Taro.showToast({
          title: i18next.t('Verificationcodehasbeen'),
          mask: true
        })
      }
    } else {
      Taro.showToast({
        title: i18next.t('Fillmobilenumber'),
        mask: true
      })
    }

  }

  loginSms = () => {
    let {
      userPhone,
      userCode,
      isSendCode,
      regionData
    } = this.state

    // console.log(userPhone, userPasswd, userCode, userTime)
    if (userPhone === '' || userCode === '') {
      Taro.showToast({
        title: i18next.t('empty'),
        mask: true
      })
      return;
    }

    if (isSendCode) {
      Taro.showToast({
        title: i18next.t('verificationexpired'),
        mask: true
      })
    } else {
      if (userPhone.length === 11 && userPhone.charAt(0) === '1'  && userCode.length !== 0) {
        loginSms(userPhone, userCode, regionData.allRegion[regionData.selectIndex].region).then((res) => {
          Taro.setStorageSync('apiToken', res)
          Taro.setStorageSync('login', true)
          Taro.redirectTo({
            url: '/pages/index/index'
          })
        }).catch((error) => {
          if (error === 'invalid code') {
            Taro.showToast({
              title: i18next.t('Verificationinvalid'),
              mask: true,
              duration: 2000
            })
          } else {
            Taro.showToast({
              title: i18next.t('verificationincorrect'),
              mask: true
            })
          }
        })

      } else {
        Taro.showToast({
          title: i18next.t('empty'),
          mask: true
        })
      }
    }
  }



  render() {

    let {
      userPhone,
      userCode,
      userTime,
      bgcolor,
      isSendCode,
      sendCode,
      regionData
    } = this.state

    return (
      <View className='phoneLoginWrap' onClick={() => closeList(this)}>
        <NavBar title={i18next.t('CodeLogin')} verification />
        <View className='phone-wrap'>
          <Text className='title'>{i18next.t('smsCodeLogin')}</Text>
          <View className='userInput'>
            <PullDown selectRegion={selectRegion} that={this} openList={openList} defaultSelect={regionData.allRegion[regionData.selectIndex].name} isOpen={regionData.isOpen} allRegion={regionData.allRegion}></PullDown>
            <Input className='userName' type='text' placeholder={i18next.t('account')} onChange={this.handleUsernameChange} />
          </View>
          {/* <Input className='inputText' type='text' value={userPhone} placeholder={i18next.t('phone')} onChange={this.handleUsernameChange} /> */}
          <View className='identCode'>
            <Input className='code' type='text' value={userCode} placeholder={i18next.t('identifyCode')} onChange={this.changeCode} />
            <Button className='codeBtn' style={`background:${bgcolor}`} onClick={this.sendCode}>{isSendCode ? sendCode : userTime}</Button>
          </View>
          <Button className='register-btn' onClick={this.loginSms}>{i18next.t('login')}</Button>
        </View>
      </View>
    )
  }
}
