import Taro, { Component } from '@tarojs/taro'
import { View, Text, Button, Input, Image } from '@tarojs/components'
import {save, fetch} from '../../utils/localIfo'
import { phoneLogin, wechatLogin } from '../../utils/beevalley'
import './index.scss'
import wechat from '../../image/wechat.png'

export default class Login extends Component {

    constructor(props) {
        super(props)
    }

    login = () => {
        
        phoneLogin(this.refs.phone.value, this.refs.passWd.value).then((res) => {
            if(!res) {
                Taro.showToast({
                    title: '登陆失败',
                    mask: true,
                    success: () => {
                        this.refs.phone.value = '';
                        this.refs.passWd.value = '';
                    }
                })
            }else{
                Taro.showToast({
                    title: '登陆成功',
                    mask: true,
                    success: () => {
                        save('apiToken', res);
                        save('login', true);
                        Taro.navigateTo({
                            url: 'pages/task_list/index'
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
            var redirect_uri = encodeURIComponent('http://bee-valley.todview.com');
            var state = Math.ceil(Math.random()*1000);
            window.location = 'https://open.weixin.qq.com/connect/qrconnect?appid=wx325f7c60ccdd70ed&redirect_uri='+redirect_uri+'&response_type=code&scope=snsapi_login&state='+state+'#wechat_redirect';
        }
    }

    componentDidMount(){
        let login = fetch('login');
        var url = new URL(window.location.href);
        this.code = url.searchParams.get('code');
        if(login === true) {
            Taro.navigateTo({
                url: 'pages/task_list/index'
            })
        }
        if(!this.code) return;
        
        wechatLogin(this.code).then((res) => {
            if(!res){
                Taro.showToast({
                    title: '登陆失败',
                    mask: true
                })
            }else{
                Taro.showToast({
                    title: '登陆成功',
                    mask: true,
                    success: () => {
                        save('apiToken', res);
                        save('login', true);
                        Taro.navigateTo({
                            url: 'pages/task_list/index'
                        })
                    }
                })
            }
        })
    }

    render() {

        return (
            <View className='wrap'>
                <Text className='title'>用户登录</Text>
                <Input className='inputText' type="text" placeholder='手机号/邮箱/用户名' ref='phone' />
                <Input className='inputText' type='password' placeholder='密码' ref='passWd' />
                <Button style="background:orangered;margin-top:3vh;" type="warn" onClick={this.login}>登录</Button>
                <View className='viewText'>
                    <Text>忘记密码？</Text>
                    <Text>还没有账号？立即注册</Text>
                </View>
                <View className='iconMenu'>
                    <View className='iconTitle'>其他方式登录</View>
                </View>
                <View className='icon' onClick={this.wechatLogin}>
                    <Image style='width:50px;height:50px;' src={wechat}></Image>
                </View>
            </View>
        )
    }
}