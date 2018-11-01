import Taro, { Component, Config } from '@tarojs/taro'
import { View, Button, Image } from '@tarojs/components'
import { fetchWork, downloadWorkFile, cancelWork, submitWork } from '../../utils/beevalley'
import * as d3 from 'd3'
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
      circlePoints: []
    }
    this.apiToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1YmM0M2RiMmYxNzdjOTAwMDEzZTZkZTUiLCJyb2xlcyI6WyJXT1JLRVIiLCJSRVZJRVdFUiJdLCJpYXQiOjE1NDA5ODkyOTQsImV4cCI6MTU0MTA3NTY5NH0.ZzUQXwMrSE4A5GFSV7NSsfjWWRUA8s5jl_cCVrTM4B8';
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

    if (this.work.length > 0) {
      let nowWork = this.work.pop();

      if (this.svg) {
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
      nowWork.pointPosition = [];
      this.setState({
        currentWork: nowWork
      })
    } else {
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

    let { currentWork } = this.state;
    this.svg = d3.select(".workImg")
      .append("svg")
      .attr("width", currentWork.meta.imageWidth)
      .attr("height", currentWork.meta.imageHeight)
      .on('click', () => {
        this.addCircle(d3.event)
      });
  }

  addCircle = (ev) => {
    let { currentWork } = this.state;
    let id = `circle${Math.round(Math.random() * 100000000)}`
    currentWork.pointPosition.push({
      x: ev.offsetX,
      y: ev.offsetY,
      id: id
    })
    this.setState({
      currentWork: currentWork
    })

  }

  cancelWork = () => {
    console.log(1)
    let { apiToken } = this;
    let { id } = this.state.currentWork;
    if(!id) return;
    cancelWork(apiToken, [id])
    this.nextWork();
  }

  submitWork = () => {
    let { apiToken } = this;
    let { id, pointPosition } = this.state.currentWork;
    if(!id) return;
    if (pointPosition.length > 0) {
      submitWork(apiToken, id, pointPosition);
      this.nextWork();
    } else {
      alert("请标注点")
    }
  }

  deleteCircle = (event) => {
    let { currentWork } = this.state;
    let target =  event.srcElement;   //  获取事件发生源DOM
    let data = d3.select(target).datum(); //获取Dom事件数据
    currentWork.pointPosition.forEach((item) => {
      if (item.id === data.id) {
        if (this.rect) {
          this.rect.remove();
        }
        this.rect = this.svg.append('rect') //添加一个框表示点被选择
          .attr('id', data.id)
          .attr('class', 'rect')
          .attr('height', 20)
          .attr('width', 20)
          .attr('x', item.x - 10)
          .attr('y', item.y - 10)
          .attr('fill', 'transparent')
          .attr('stroke', 'black')
          .attr('stroke-width', 1);
        this.svg.append(() => { //将事件源元素放在最后面 以便删除时不会错位
          return target;
        });
      }
    })


    document.onkeydown = (ev) => {
      if (ev.keyCode === 46 && this.rect) { //删除点击的数据，同步删除元素

        currentWork.pointPosition = currentWork.pointPosition.filter((item) => item.id !== data.id);
        this.setState({
          currentWork: currentWork
        }, () => {
          this.rect.remove();
        })
      }
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
    } else if (process.env.TARO_ENV === 'h5') {
    }
  }

  render() {
    let { currentWork } = this.state;
    if (this.svg) {
      let circle = this.svg.selectAll("circle");
      let update = circle.data(currentWork.pointPosition);
      update.enter().append("circle")
        .attr("r", 10)
        .attr('id', function (d) { return d.id; })
        .attr("fill", "red")
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; })
        .on('click', () => {
          d3.event.stopPropagation();
          this.deleteCircle(d3.event);

        })
        update.exit().remove();
    }
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

