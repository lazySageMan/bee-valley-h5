import Taro, { Component } from '@tarojs/taro'
import { View, Text, Button, Input, Image } from '@tarojs/components'
import { sendMobileCode, register } from '../../utils/beevalley'
import './register.scss'

export default class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userPhone: '',
            userPasswd: '',
            userCode: '',
            userTime: '发送验证码',
            bgcolor: 'orangered'
        }
    }

    handleUsernameChange = (event) => {
        this.setState({userPhone: event.target.value});
    }

    handlePasswordChange = (event) => {
        this.setState({userPasswd: event.target.value});
    }

    changeCode = (event) => {
        this.setState({userCode: event.target.value});
    }

    toLogin = () => {
        Taro.redirectTo({
            url: '/pages/index/login'
        })
    }

    lessTime = () => {
        let { userTime } = this.state
        let time = Number(userTime);
        
        let timer = setInterval(() => {
            if(time === 0 ){
                clearInterval(timer)
                this.setState({
                    userTime: "重新发送",
                    bgcolor: "orangered"
                })
            }else{
                time -= 1;
                this.setState({
                    userTime: time
                })
            }  
        },1000)
        
    }

    sendCode = () => {
        let { userPhone, userTime } = this.state
        if(userPhone.length === 11 && userPhone.charAt(0) === '1'){
            if (userTime === "发送验证码" || userTime === "重新发送"){
                sendMobileCode(userPhone)
                this.setState({
                    userTime: 60,
                    bgcolor: 'gray'
                }, () => this.lessTime())
            }else{
                Taro.showToast({
                    title: '验证码已发送，请注意查看',
                    mask: true
                })
            }
        }else {
            Taro.showToast({
                title: '正确填写手机号码',
                mask: true
            })
        }
        
    }

    register = () =>{
        let { userPhone, userPasswd, userCode, userTime } = this.state

        console.log(userPhone, userPasswd, userCode, userTime)
        if(userTime === "发送验证码" || userTime === "重新发送"){
            Taro.showToast({
                title: '验证码已近过期，重新获取验证码',
                mask: true
            })
        }else{
            if(userPhone.length === 11 && userPhone.charAt(0) === '1' && userPasswd.length >= 6 && userCode.length !==0){
                register(userPhone, userPasswd, userCode).then((res) => {
                    if(res.statusCode === 403){
                        if(res.data.error.code === "13" ){
                            Taro.showToast({
                                title: '该手机号注册过了',
                                mask: true,
                                duration:2000    
                            })
                        }
                        else if (res.data.error.code === "14" ){
                            Taro.showToast({
                                title: '验证码有误',
                                mask: true,
                                duration:2000    
                            })
                        }
                        return ;
                    }else{
                        Taro.showToast({
                            title: '注册成功',
                            mask: true,
                            duration:2000,
                            success: () => {
                                Taro.setStorageSync('apiToken', res.data)
                                Taro.setStorageSync('login', true)
    
                                Taro.redirectTo({
                                    url: '/pages/index/index'
                                })
                            }
                        })
                    }
                        
                })
            
            }else{
                Taro.showToast({
                    title: '正确填写注册信息',
                    mask: true
                })
            }
        }
    }



    render() {

        let { userPhone, userPasswd, userCode, userTime, bgcolor } = this.state

        return (
            <View className="register-wrap">
                <Text className="title">用户注册</Text>
                <Input className='inputText' type='text' value={userPhone} placeholder='手机号' onChange={this.handleUsernameChange} />
                <Input className='inputText' type='password' value={userPasswd} placeholder='密码' onChange={this.handlePasswordChange} />
                <View className="identCode">
                    <Input className='code' type='text' value={userCode} placeholder='验证码' onChange={this.changeCode} />
                    <Button className="codeBtn" style={`background:${bgcolor}`} onClick={this.sendCode}>{userTime}</Button>
                </View>
                <View className='viewText'>
                    <Text>忘记密码？</Text>
                    <Text>已有账号？<Text className='onLogin' onClick={this.toLogin}>立即登录</Text></Text>
                </View>
                <Button className="register-btn" onClick={this.register}>立即注册</Button>
            </View>
        )
    }
}