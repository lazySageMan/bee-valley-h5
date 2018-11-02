import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, Input, Button, Image } from '@tarojs/components'
import {save, fetch} from '../../utils/localIfo'
import { phoneLogin } from '../../utils/beevalley'
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
                save('apiToken', res);
                Taro.showToast({
                    title: '登陆成功',
                    mask: true,
                    success: () => {
                        Taro.navigateTo({
                            url: 'pages/point_task/index'
                        })
                    }
                })
            }
        })
    }

    componentWillMount(){
        fetch('apiToken')
    }

    render() {

        return (
            <View className='wrap'>
                <Text className='title'>用户登录</Text>
                <input className='inputText' type="text" placeholder='手机号/邮箱/用户名' ref='phone' />
                <input className='inputText' type='password' placeholder='密码' ref='passWd' />
                <Button style="background:orangered;margin-top:3vh;" type="warn" onClick={this.login}>登录</Button>
                <View className='viewText'>
                    <Text>忘记密码？</Text>
                    <Text>还没有账号？立即注册</Text>
                </View>
                <View className='iconMenu'>
                    <View className='iconTitle'>其他方式登录</View>
                </View>
                <View className='icon'>
                    <Image style='width:50px;height:50px;' src={wechat}></Image>
                </View>
            </View>
        )
    }
}