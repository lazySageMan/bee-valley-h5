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

import './index.scss'

export default class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userPhone: '',
      userCode: '',
      userTime: '发送验证码',
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
          userTime: "重新发送",
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
      if (userTime === "发送验证码" || userTime === "重新发送") {
        sendMobileCode(userPhone, "login").then(() => {
           this.setState({
              userTime: 60,
              bgcolor: 'gray'
           }, () => this.lessTime())
        }).catch((err) => {
          // console.log(err)
          Taro.showToast({
            title: '网络错误，请重新获取验证码',
            mask: true
          })
        })
      } else {
        Taro.showToast({
          title: '验证码已发送，请注意查看',
          mask: true
        })
      }
    } else {
      Taro.showToast({
        title: '正确填写手机号码',
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
        title: '手机号，或者验证码为空',
        mask: true
      })
      return;
    }

    if (userTime === "发送验证码" || userTime === "重新发送") {
      Taro.showToast({
        title: '验证码已近过期，重新获取验证码',
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
              title: '验证码无效',
              mask: true,
              duration: 2000
            })
          } else {
            Taro.showToast({
              title: '验证码错误，请重新输入',
              mask: true
            })
          }
        })

      } else {
        Taro.showToast({
          title: '正确填写注册信息',
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
        <NavBar title='手机验证码登录' verification />
        <View className='phone-wrap'>
          <Text className='title'>短信验证码登录</Text>
          <Input className='inputText' type='text' value={userPhone} placeholder='账号手机号' onChange={this.handleUsernameChange} />
          <View className='identCode'>
            <Input className='code' type='text' value={userCode} placeholder='验证码' onChange={this.changeCode} />
            <Button className='codeBtn' style={`background:${bgcolor}`} onClick={this.sendCode}>{userTime}</Button>
          </View>
          <Button className='register-btn' onClick={this.loginSms}>立即登录</Button>
        </View>
      </View>
    )
  }
}
