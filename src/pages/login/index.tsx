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

import './index.scss'
import wechat from '../../image/weixin.png'
import phone from '../../image/message.png'

export default class Login extends Component {

  constructor(props) {
    super(props)
  }

  login = () => {
    let {
      username,
      password
    } = this.state;
    if (!username || !password) {
      Taro.showToast({
        title: '账号或密码为空',
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
      title: '登陆失败',
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

  render() {
    let {
      isMobile
    } = this.state;
    return (
      <View className='wrap'>
                <Text className='title'>用户登录</Text>
                <Input className='inputText' type='text' placeholder='手机号/邮箱/用户名' onChange={this.handleUsernameChange} />
                <Input className='inputText' type='password' placeholder='密码' onChange={this.handlePasswordChange} />
                <Button className='btn' onClick={this.login}>立即登录</Button>
                <View className='viewText'>
                    <Text>忘记密码？</Text>
                    <Text>还没有账号？<Text className='onResiges' onClick={this.toRegister}>立即注册</Text></Text>
                </View>
                <View className='iconMenu'>
                    <View className='iconTitle'>其他方式登录</View>
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
    )
  }
}
