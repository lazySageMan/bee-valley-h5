import Taro, {
  Component
} from '@tarojs/taro';
import {
  View
} from '@tarojs/components';
import {
  wxLogin
} from '../../utils/beevalley'
import './index.scss'


export default class wechatLogin extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    wxLogin({
      id: "login_container",
      appid: "wx325f7c60ccdd70ed",
      scope: "snsapi_login",
      redirect_uri: encodeURIComponent("http://bee-valley.todview.com"),
      state: Math.ceil(Math.random() * 1000),
      style: "black",
      href: ""
    }, document);

  }

  render() {
    return (
      <View id='login_container'>

      </View>
    )
  }
}
