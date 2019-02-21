import Taro, {
  Component
} from '@tarojs/taro';
import {
  View
} from '@tarojs/components';
import NavBar from '../../components/navBar/index'
import i18next from '../../i18n';
import './index.scss'
import {
  homepage
} from '../../config'
// import Qc from '../../utils/js_sdk'

export default class qqLogin extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // wxLogin({
    //   id: "login_container",
    //   appid: "wx325f7c60ccdd70ed",
    //   scope: "snsapi_login",
    //   redirect_uri: encodeURIComponent(homepage),
    //   state: Math.ceil(Math.random() * 1000),
    //   style: "black",
    //   href: ""
    // }, document);
    // console.log(Qc);

    // window.open("oauth/index.php", "TencentLogin", "width=450,height=320,menubar=0,scrollbars=1,resizable = 1, status = 1, titlebar = 0, toolbar = 0, location = 1");
    // QC.Login.showPopup({
    //   appId: "222222",
    //   redirectURI: "http://yousite.com/qc_back.html"
    // })
  }

  render() {
    return (
      <View className='qqLogin'>
        <NavBar title={i18next.t('qqLogin')} verification />
        <View id='login_container'>

        </View>
      </View>
    )
  }
}
