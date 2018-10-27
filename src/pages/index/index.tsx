import Taro, { Component, Config } from '@tarojs/taro'
import { View, Button, Image } from '@tarojs/components'
import { fetchWork, downloadWorkFile } from '../../utils/beevalley'
import '@tarojs/async-await'
import './index.scss'

export default class Index extends Component {
  //小程序json配置
  config: Config = {
    navigationBarTitleText: '首页'
  }

  constructor(props) {
    super(props);

    this.state = {
      currentWork: {}
    }
    this.apiToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1YmM0M2RiMmYxNzdjOTAwMDEzZTZkZTUiLCJyb2xlcyI6WyJXT1JLRVIiLCJSRVZJRVdFUiJdLCJpYXQiOjE1NDA2MjkzNjgsImV4cCI6MTU0MDcxNTc2OH0.vN2mXU5WeWOtck3QZ9U7duWdOnA5vbnLH5UL9Iem03c';
  }

  componentWillMount() {
  }

  getWork = async () => {
    let { apiToken } = this;
    let work = await fetchWork(apiToken, 'count', 4);
    this.work = work;

    if (this.work.length > 0) {
      work.forEach(item => this.getImgFile(item.id));
      this.nextWork()
    }
  }

  nextWork = () => {
    let nowWork = this.work.pop()
    if (this.screenWidth < 500) {
      let { imageWidth, imageHeight } = nowWork.meta;
      let ratio = imageWidth / imageHeight;
      let newHeight = this.screenWidth / ratio;

      nowWork.meta = {
        imageWidth: this.screenWidth,
        imageHeight: newHeight
      }
    }
    this.setState({
      currentWork: nowWork
    })
  }

  getImgFile = async (imgId) => {
    let { apiToken } = this;
    let imgArrBuffer = await downloadWorkFile(apiToken, imgId);
    let imgBase64 = 'data:image/png;base64,' + Taro.arrayBufferToBase64(new Uint8Array(imgArrBuffer));
    if (imgId === this.state.currentWork.id) {
      let current = Object.assign({}, this.state.currentWork, { src: imgBase64 });

      this.setState({
        currentWork: current
      })
    } else {
      let foundIndex = this.work.findIndex(item => item.id === imgId);

      if (foundIndex >= 0) {
        this.work[foundIndex].src = imgBase64;
      }
    }

  }

  async componentDidMount() {

    this.getWork();
    if (process.env.TARO_ENV === 'weapp') {
      // 这里 this.refs.input 访问的时候通过 `wx.createSeletorQuery` 取到的小程序原生组件
      console.log('weapp')
    } else if (process.env.TARO_ENV === 'h5') {
      // 这里 this.refs.input 访问到的是 `@tarojs/components` 的 `Input` 组件实例
      const query = Taro.createSelectorQuery()
      query
        .select('.imgItem')
        .boundingClientRect(rect => {
          this.screenWidth = rect.width;
        })
        .exec()
    }
  }

  render() {
    let { currentWork } = this.state;
    // console.log( )
    return (
      <View className='index'>
        <View className="imgItem" ref='imgRange'>
          {currentWork.src && (
            <Image src={currentWork.src} style={`width:${currentWork.meta.imageWidth}px;height:${currentWork.meta.imageHeight}px`}></Image>
          )
          }
        </View>
        <View className="btnItem">
          <Button type="primary" onClick={this.nextWork}>提交</Button>
          <Button type="warn" onClick={this.nextWork}>放弃</Button>
        </View>
      </View>
    )
  }
}

