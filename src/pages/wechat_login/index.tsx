import Taro, {
  Component
} from '@tarojs/taro';
import {
  View
} from '@tarojs/components';
import {
  wxLogin
} from '../../utils/beevalley'
import NavBar from '../../components/navBar/index'
import i18next from '../../i18n';
import './index.scss'
import {
  homepage
} from '../../config'

export default class wechatLogin extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    wxLogin({
      id: "login_container",
      appid: "wx325f7c60ccdd70ed",
      scope: "snsapi_login",
      redirect_uri: encodeURIComponent(homepage),
      state: Math.ceil(Math.random() * 1000),
      style: "black",
      href: ""
    }, document);

  }

  render() {
    return (
      <View className='wechatLogin'>
        <NavBar title={i18next.t('WeChatLogin')} verification />
        <View id='login_container'>

        </View>
      </View>
    )
  }
}
