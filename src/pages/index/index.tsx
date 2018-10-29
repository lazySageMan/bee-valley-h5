import Taro, { Component, Config } from '@tarojs/taro'
import { View, Button, Image } from '@tarojs/components'
import { fetchWork, downloadWorkFile, cancelWork, submitWork} from '../../utils/beevalley'
import D3, {event} from 'd3'
import './index.scss'

export default class Index extends Component {
  //小程序json配置
  config: Config = {
    navigationBarTitleText: '首页'
  }

  constructor(props) {
    super(props);

    this.state = {
      currentWork: {},
      circlePoints: []
    }
    this.apiToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1YmM0M2RiMmYxNzdjOTAwMDEzZTZkZTUiLCJyb2xlcyI6WyJXT1JLRVIiLCJSRVZJRVdFUiJdLCJpYXQiOjE1NDA4MTU5MzMsImV4cCI6MTU0MDkwMjMzM30.zqWwI2rid-r6CYZfwCMaO0vt6qCZdJLzeGIT1m6D7pc';
    this.circlePoints = [];
  }

  componentWillMount() {
  }

  getWork = () => {
    let { apiToken } = this;
    fetchWork(apiToken, 'count', 4).then((res) => {
      this.work = res;

      if (this.work.length > 0) {
        this.work.forEach(item => this.getImgFile(item.id));
        this.nextWork()
      }
    })
  }

  nextWork = () => {

    if(this.work.length > 0){
      let nowWork = this.work.pop();

      if (this.circlePoints.length > 0) {
        this.circlePoints = [];

        this.updateCircle();
        this.svg.remove();
      }


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
    }else{
      this.getWork();
    }
  }

  getImgFile = (imgId) => {
    let { apiToken } = this;
    downloadWorkFile(apiToken, imgId).then((res) => {
      let imgBase64 = 'data:image/png;base64,' + Taro.arrayBufferToBase64(new Uint8Array(res));
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
    });

  }

  imgLoad = () => {
    this.svg = D3.select(".workImg")
      .append("svg")
      .attr("width", this.state.currentWork.meta.imageWidth)
      .attr("height", this.state.currentWork.meta.imageHeight)
      .on('click', () => {
        this.addCircle(event)
      });
  }

  addCircle = (event) => {

    console.log(event)
    this.circlePoints.push({
      x: event.clientX,
      y: event.clientY
    });
    
    this.updateCircle();
  }

  updateCircle = () => {

    this.circle = this.svg.selectAll("circle");
    let update = this.circle.data(this.circlePoints);

    update.enter().append("circle")
      .attr("r", 10)
      .attr("fill", "red")
      .attr("cx", function (d) { return d.x; })
      .attr("cy", function (d) { return d.y; });
    update.exit().remove();
  }

  cancelWork = () => {
    let {apiToken} = this;
    let {id} = this.state.currentWork;

    cancelWork(apiToken, [id])
    this.nextWork();
  }

  submitWork = () => {
    let {apiToken} = this;
    let {id} = this.state.currentWork;
    let {circlePoints} = this;
    if(circlePoints.length > 0){
      submitWork(apiToken, id, circlePoints);
      this.nextWork();
    }else{
      alert("请标注点")
    }
  }


  componentDidMount() {
    this.getWork();
    const query = Taro.createSelectorQuery()
    query
      .select('.imgItem')
      .boundingClientRect(rect => {
        this.screenWidth = rect.width;
      })
      .exec()
    if (process.env.TARO_ENV === 'weapp') {
      // 这里 this.refs.input 访问的时候通过 `wx.createSeletorQuery` 取到的小程序原生组件
      console.log('weapp')
    } else if (process.env.TARO_ENV === 'h5') {
      // 这里 this.refs.input 访问到的是 `@tarojs/components` 的 `Input` 组件实例
    }
  }

  render() {
    let { currentWork } = this.state;
    // console.log( )
    return (
      <View className='index'>
        <View className="imgItem">
          {currentWork.src && (
            <Image onLoad={() => this.imgLoad()} src={currentWork.src} style={`width:${currentWork.meta.imageWidth}px;height:${currentWork.meta.imageHeight}px;`}></Image>
          )
          }
          <View className="workImg"></View>
        </View>
        <View className="btnItem">
          <Button type="primary" onClick={this.submitWork}>提交</Button>
          <Button type="warn" onClick={this.cancelWork}>放弃</Button>
        </View>
      </View>
    )
  }
}

