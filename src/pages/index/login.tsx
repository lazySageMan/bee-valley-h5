import Taro, { Component } from '@tarojs/taro'
import { View, Text, Button, Input, Image } from '@tarojs/components'
import { phoneLogin, wechatLogin } from '../../utils/beevalley'
import { checkDveice } from '../../utils/beevalley'
import './login.scss'
import wechat from '../../image/wechat.png'

export default class Login extends Component {

    constructor(props) {
        super(props)
    }

    login = () => {
        
        phoneLogin(this.state.username, this.state.password).then((token) => {
            // console.log(JSON.parse(token.data).code === 1)
            if(!token) {
                Taro.showToast({
                    title: '登陆失败',
                    mask: true
                })
            }else{
                Taro.showToast({
                    title: '登陆成功',
                    mask: true,
                    success: () => {

                        Taro.setStorageSync('apiToken', token)
                        Taro.setStorageSync('login', true)

                        Taro.navigateTo({
                            url: 'pages/index/index'
                        })
                    }
                })
            }
        })
    }

    wechatLogin = () => {
        var url = new URL(window.location.href);
        let code = url.searchParams.get('code');

        if(!code){
            var redirect_uri = encodeURIComponent('http://bee-valley.todview.com/v2/index.html');
            var state = Math.ceil(Math.random()*1000);
            window.location = 'https://open.weixin.qq.com/connect/qrconnect?appid=wx325f7c60ccdd70ed&redirect_uri='+redirect_uri+'&response_type=code&scope=snsapi_login&state='+state+'#wechat_redirect';
        }
    }

    componentDidMount(){
        const login = Taro.getStorageSync('login')
        
            let res = Taro.getSystemInfoSync()
            let isMobile = checkDveice(res)
            this.setState({
                isMobile: isMobile
            })
            //console.log(this.isMobile)
    
        if(login === true) {
            Taro.navigateTo({
                url: '/pages/index/index'
            })
        }
        var url = new URL(window.location.href);
        this.code = url.searchParams.get('code');
        if(this.code) {
            wechatLogin(this.code).then((token) => {
                if(!token){
                    Taro.showToast({
                        title: '登陆失败',
                        mask: true
                    })
                }else{
                    Taro.showToast({
                        title: '登陆成功',
                        mask: true,
                        success: () => {
                            Taro.setStorageSync('apiToken', token)
                            Taro.setStorageSync('login', true)

                            Taro.redirectTo({
                                url: '/pages/index/index'
                            })
                        }
                    })
                }
            })
        }        

    }

    handleUsernameChange = (event) => {
        this.setState({username: event.target.value});
    }

    handlePasswordChange = (event) => {
        this.setState({password: event.target.value});
    }

    render() {
        let {isMobile} = this.state;
        return (
            <View className='wrap'>
                <Text className='title'>用户登录</Text>
                <Input className='inputText' type='text' placeholder='手机号/邮箱/用户名' onChange={this.handleUsernameChange} />
                <Input className='inputText' type='password' placeholder='密码' onChange={this.handlePasswordChange} />
                <Button style='background:orangered;margin-top:3vh;' type='warn' onClick={this.login}>登录</Button>
                <View className='viewText'>
                    <Text>忘记密码？</Text>
                    <Text>还没有账号？<Text className='onResiges'>立即注册</Text></Text>
                </View>
                <View className='iconMenu'>
                    <View className='iconTitle'>其他方式登录</View>
                </View>
                { !isMobile &&
                    <View className='icon' onClick={this.wechatLogin}>
                        <Image style='width:50px;height:50px;' src={wechat}></Image>
                    </View>
                }
               
            </View>
        )
    }
}