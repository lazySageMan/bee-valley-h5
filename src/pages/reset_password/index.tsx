import Taro, {
  Component
} from '@tarojs/taro'
import {
  View,
  Text,
  Input,
  Button
} from '@tarojs/components'
import {
  sendMobileCode,
  resetPasswords,
  selectRegion,
  closeList,
  openList
} from '../../utils/beevalley'
import NavBar from '../../components/navBar/index'
import PullDown from '../../components/pullDownLIst/index.tsx'
import i18next from '../../i18n'
import './index.scss'

export default class resetUserPassword extends Component{

  constructor(props){
    super(props);
    this.state = {
      userPhone: '',
      userPasswd: '',
      userRepasswd: '',
      userCode: '',
      isSendCode: true,
      sendCode: i18next.t('sendIdentifyCode'),
      userTime: 0,
      bgcolor: 'orangered',
      regionData: {
        selectIndex: 0,
        allRegion: [
          {
            name: '中国',
            region: 'CN'
          }
        ],
        isOpen: false
      }
    }
  }

  handleUsernameChange = (event) => {
    this.setState({
      userPhone: event.target.value
    });
  }

  handlePasswordChange = (event) => {
    this.setState({
      userPasswd: event.target.value
    });
  }

  handleuserRepasswdChange = (event) => {
    this.setState({
      userRepasswd: event.target.value
    });
  }

  changeCode = (event) => {
    this.setState({
      userCode: event.target.value
    });
  }

  toLogin = () => {
    Taro.navigateTo({
      url: '/pages/login/index'
    })
  }

  toRegister = () => {
    Taro.navigateTo({
      url: '/pages/signup/index'
    })
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
        sendMobileCode(userPhone, "reset_password", regionData.allRegion[regionData.selectIndex].region).then(() => {
          this.setState({
            userTime: 60,
            bgcolor: 'gray',
            isSendCode: false
          }, () => this.lessTime())
        }).catch(() => {
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

  resetPassword = () => {
    let {
      userPhone,
      userPasswd,
      userCode,
      userRepasswd,
      isSendCode,
      regionData
    } = this.state

    // console.log(userPhone, userPasswd, userCode, userTime)
    if (userPhone === '' || userPasswd === '' || userCode === '' || userRepasswd === '') {
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
      return;
    }

    if (userRepasswd !== userPasswd) {
      Taro.showToast({
        title: i18next.t('passwordDifferent'),
        mask: true
      })
      return;
    }
    if (userPasswd.length >= 6 && userCode.length !== 0) {
      resetPasswords(userPhone, userPasswd, userCode, regionData.allRegion[regionData.selectIndex].region).then((res) => {
        // Taro.setStorageSync('apiToken', res)
        // Taro.setStorageSync('login', true)

        // Taro.redirectTo({
        //   url: '/pages/index/index'
        // })
        // console.log(res)

        Taro.showModal({
          title: i18next.t('Tips'),
          content: i18next.t('passwordupdated'),
          confirmText: i18next.t('Gotit'),
          showCancel: false,
          success: function () {
            Taro.navigateTo({
              url: '/pages/login/index'
            })
          }
        })
      }).catch((error) => {
        if (error === 'user exists') {
          Taro.showToast({
            title: i18next.t('hasbeenregistered'),
            mask: true,
            duration: 2000
          })
        } else if (error === 'invalid code') {
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
        title: i18next.t('registrationinformation'),
        mask: true
      })
    }
  }

  render(){

    let {
      userPhone,
      userPasswd,
      userCode,
      userTime,
      userRepasswd,
      bgcolor,
      sendCode,
      isSendCode,
      regionData
    } = this.state

    return(
      <View className='resetPassword' onClick={() => closeList(this)}>
        <NavBar title={i18next.t('resetPassword')} verification />
        <View className='resetPassword-wrap'>
          <Text className='title'>{i18next.t('resetPassword')}</Text>
          {/* <Input className='inputText' type='text' value={userPhone} placeholder={i18next.t('phone')} onChange={this.handleUsernameChange} /> */}
          <View className='userInput'>
            <PullDown selectRegion={selectRegion} that={this} openList={openList} defaultSelect={regionData.allRegion[regionData.selectIndex].name} isOpen={regionData.isOpen} allRegion={regionData.allRegion}></PullDown>
            <Input className='userName' type='text' placeholder={i18next.t('account')} onChange={this.handleUsernameChange} />
          </View>
          <Input className='inputText' type='password' value={userPasswd} placeholder={i18next.t('newPassWord')} onChange={this.handlePasswordChange} />
          <Input className='inputText' type='password' value={userRepasswd} placeholder={i18next.t('repeatPassword')} onChange={this.handleuserRepasswdChange} />
          <View className='identCode'>
            <Input className='code' type='text' value={userCode} placeholder={i18next.t('identifyCode')} onChange={this.changeCode} />
            <Button className='codeBtn' style={`background:${bgcolor}`} onClick={this.sendCode}>{isSendCode ? sendCode : userTime}</Button>
          </View>
          <View className='viewText'>
            <Text><Text className='onLogin' onClick={this.toRegister}>{i18next.t('register')}</Text>？</Text>
            <Text>{i18next.t('existAccount')}？<Text className='onLogin' onClick={this.toLogin}>{i18next.t('login')}</Text></Text>
          </View>
          <Button className='register-btn' onClick={this.resetPassword}>{i18next.t('resetPassword')}</Button>
        </View>
      </View>
    )
  }
}
