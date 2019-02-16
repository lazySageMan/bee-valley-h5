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
  loginSms
} from '../../utils/beevalley'
import NavBar from '../../components/navBar/index'
import i18next from '../../i18n';
import './index.scss'

export default class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userPhone: '',
      userCode: '',
      userTime: i18next.t('sendIdentifyCode'),
      bgcolor: 'orangered'
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
      userTime
    } = this.state
    let time = Number(userTime);

    let timer = setInterval(() => {
      if (time === 0) {
        clearInterval(timer)
        this.setState({
          userTime: i18next.t('resend'),
          bgcolor: "orangered"
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
      userTime
    } = this.state
    if (userPhone.length === 11 && userPhone.charAt(0) === '1') {
      if (userTime === "发送验证码" || userTime === "重新发送" || userTime === 'send verification code' || userTime === 'resend') {
        sendMobileCode(userPhone, "login").then(() => {
           this.setState({
              userTime: 60,
              bgcolor: 'gray'
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
      userTime
    } = this.state

    // console.log(userPhone, userPasswd, userCode, userTime)
    if (userPhone === '' || userCode === '') {
      Taro.showToast({
        title: i18next.t('empty'),
        mask: true
      })
      return;
    }

    if (userTime === "发送验证码" || userTime === "重新发送" || userTime === 'send verification code' || userTime === 'resend') {
      Taro.showToast({
        title: i18next.t('verificationexpired'),
        mask: true
      })
    } else {
      if (userPhone.length === 11 && userPhone.charAt(0) === '1'  && userCode.length !== 0) {
        loginSms(userPhone, userCode).then((res) => {
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
      bgcolor
    } = this.state

    return (
      <View className='phoneLoginWrap'>
        <NavBar title={i18next.t('CodeLogin')} verification />
        <View className='phone-wrap'>
          <Text className='title'>{i18next.t('smsCodeLogin')}</Text>
          <Input className='inputText' type='text' value={userPhone} placeholder={i18next.t('phone')} onChange={this.handleUsernameChange} />
          <View className='identCode'>
            <Input className='code' type='text' value={userCode} placeholder={i18next.t('identifyCode')} onChange={this.changeCode} />
            <Button className='codeBtn' style={`background:${bgcolor}`} onClick={this.sendCode}>{userTime}</Button>
          </View>
          <Button className='register-btn' onClick={this.loginSms}>{i18next.t('login')}</Button>
        </View>
      </View>
    )
  }
}
