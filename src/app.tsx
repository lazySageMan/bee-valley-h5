import Taro, { Component, Config } from '@tarojs/taro'
import PointTask from './pages/point_task'

import './app.scss'

class App extends Component {

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类�
   * 对于�navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声�navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类�
   */
  config: Config = {
    pages: [
      '/pages/login/login',
      '/pages/index/register',
      '/pages/index/index',
      '/pages/rect_task/index',
      '/pages/rect_review/index',
      '/pages/count_task/index',
      '/pages/count_review/index',
      '/pages/data_acquistion_task/index',
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black'
    }
  }

  componentDidMount () {}

  componentDidShow () {}

  componentDidHide () {}

  componentCatchError () {}

  render () {
    return (
      <PointTask />
    )
  }
}

Taro.render(<App />, document.getElementById('app'))
