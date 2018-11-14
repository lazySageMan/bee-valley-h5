import Taro, { Component, Config } from '@tarojs/taro'
import { View, Button, Image } from '@tarojs/components'
import * as d3 from 'd3'
import { fetchWork, downloadWorkFile, cancelWork, submitWork, checkDveice} from '../../utils/beevalley'
import './index.scss'

export default class PointTask extends Component {
  //小程序json配置
  config: Config = {
    navigationBarTitleText: '首页'
  }

  constructor(props) {
    super(props);

    this.state = {
      currentWork: {},
      pointRadius: 10
    }
    this.apiToken = Taro.getStorageSync('apiToken');
  }

  componentWillMount() {
  }

  fetchWork = () => {
    let { apiToken } = this;
    fetchWork(apiToken, 'count', 4, this.packageId).then((res) => {
      this.work = res;

      if (this.work.length > 0) {
        this.work.forEach(item => this.getImgFile(item.id));
        this.nextWork()
      }
    })
  }

  nextWork = () => {

    if (this.work.length > 0) {
      let nowWork = this.work.pop();

      if (this.isMobile) {
        let { imageWidth, imageHeight } = nowWork.meta;
        let ratio = imageWidth / imageHeight;
        let newHeight = this.screenWidth / ratio;

        nowWork.meta = {
          imageWidth: this.screenWidth,
          imageHeight: newHeight
        }
      }
      nowWork.pointPosition = [];
      this.setState({
        currentWork: nowWork
      })
    } else {
      this.fetchWork();
    }
  }

  getImgFile = (imgId) => {
    let { apiToken } = this;
    downloadWorkFile(apiToken, imgId).then((res) => {
      let imgBase64 = 'data:image/jpeg;base64,' + Taro.arrayBufferToBase64(new Uint8Array(res));
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

  addCircle = (ev) => {
    this.setState((prevState) => {
      let updated = prevState.currentWork
      updated.pointPosition.push({
        x: ev.offsetX,
        y: ev.offsetY
      })
      return { currentWork: updated }
    })
  }

  cancelWork = () => {
    let { apiToken } = this;
    let { id } = this.state.currentWork;
    if (!id) return;
    cancelWork(apiToken, [id])
    this.nextWork();
  }

  submitWork = () => {
    let { apiToken } = this;
    let { id, pointPosition } = this.state.currentWork;
    if (!id) return;
    if (pointPosition.length > 0) {
      submitWork(apiToken, id, pointPosition);
      this.nextWork();
    } else {
      alert("请标注点")
    }
  }

  componentDidMount() {
    this.packageId = this.$router.params.packageId;
    this.fetchWork();

    Taro.getSystemInfo({
      success: (res) => {
        this.screenWidth = res.windowWidth;
        this.isMobile = checkDveice(res)
      }
    })

    if (process.env.TARO_ENV === 'weapp') {
    } else if (process.env.TARO_ENV === 'h5') {
    }
    this.svg = d3.select(".workImg")
      .append("svg")
      .on('click', () => {
        this.addCircle(d3.event)
      });
  }

  renderDthree(pointData, pointRadius) {
    if (this.svg) {
      let circle = this.svg.selectAll("circle");
      let update = circle.data(pointData);

      update.attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; })
        .attr("r", pointRadius)
        .style('opacity', 0.5);

      update.enter().append("circle")
        .attr("r", pointRadius)
        .attr("fill", "red")
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; })
        .style('opacity', 0.5)
        .on('click', (datum) => {

          d3.event.stopPropagation();
          var index = pointData.findIndex(e => e.x === datum.x && e.y === datum.y);
          if (index > -1) {
            pointData.splice(index, 1);
          }

          this.setState((prevState) => {
            let updated = prevState.currentWork
            updated.pointPosition = pointData
            return { currentWork: updated }
          })

        })
      update.exit().remove();
    }
  }

  render() {
    let { currentWork, pointRadius } = this.state;

    if (currentWork.pointPosition) {
      this.renderDthree(currentWork.pointPosition, pointRadius);
    }
    
    if (this.svg && currentWork) {
      this.svg.attr("width", currentWork.meta.imageWidth)
      .attr("height", currentWork.meta.imageHeight);
    }

    return (
      <View className='index'>
        <View className='imgItem'>
          {currentWork.src && (
            <Image src={currentWork.src} style={`width:${currentWork.meta.imageWidth}px;height:${currentWork.meta.imageHeight}px;`}></Image>
          )
          }
          <View className='workImg'></View>
        </View>
        <View className='btnItem'>
          <Button type='primary' onClick={this.submitWork}>提交</Button>
          <Button type='warn' onClick={this.cancelWork}>放弃</Button>
        </View>
      </View>
    )
  }
}

