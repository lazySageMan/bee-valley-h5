import Taro, {
  Component
} from '@tarojs/taro';
import {
  View,
  Video,
  Image
} from '@tarojs/components';
import NavBar from '../../components/navBar/index'
import i18next from '../../i18n';
import * as d3 from 'd3'
import './index.scss'

export default class faceRecognitionLogin extends Component {

  constructor(props){
    super(props)
    this.state = {
      imgsrc: null
    }
  }

  componentDidMount(){
    // this.wrap = document.getElementById('imgItem')
    // this.VideoWidth = Number(window.getComputedStyle(this.wrap, null).getPropertyValue('width').substring(0, 3));
    // this.VideoHeight = Number(window.getComputedStyle(this.wrap, null).getPropertyValue('height').substring(0, 3));
    // this.videoWidth = Number(this.wrap.style.width.substring(0, 3));
    // this.videoHeight = Number(this.wrap.style.height.substring(0, 2));
    // console.log(this.videoWidth, this.videoHeight);

    let res = Taro.getSystemInfoSync();
    this.videoWidth = res.windowWidth;

    this.videoHeight = res.windowHeight - res.windowHeight * 0.07;


    this.svg = d3.select(".Mask").append("svg");
    this.svg.attr("width", this.videoWidth)
      .attr("height", this.videoHeight);
    let rect = this.svg.selectAll("rect");
    let update = rect.data([{
      x: this.videoWidth/2 - 75,
      y: this.videoHeight/2 - 75,
      width: 150,
      height:150
    }]);
    update.exit().remove();
    update.enter().append("rect")
      .attr("fill", "yellow")
      .attr("fill-opacity", 0)
      .attr("stroke", "green")
      .attr("stroke-width", "2px")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("width", (d) => d.width)
      .attr("height", (d) => d.height);
    this.initVideo();
    this.getImgData();
  }

  initVideo = () => {
    this.video = document.getElementById("webcam");
    setTimeout(() => {
      if (
        navigator.mediaDevices.getUserMedia ||
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia
      ) {
        var constraints = {
          video: {
            width: 600,
            height: 375,
            facingMode: "user",
          }
        };
        this.getUserMedia(constraints, this.videoSuccess, this.videoError);
      } else {
        // this.$toast.center("摄像头打开失败,请检查权限设置!");
      }
    }, 300);

    // this.canvas = document.createElement("canvas");
    // let context = this.canvas.getContext("2d");
    // context.drawImage(this.video, 0, 0, 300, 300);
    // this.imgSrc = this.canvas.toDataURL("image/png");
    // console.log(this.imgSrc)
  }

  getUserMedia = (constraints, success, error) => {
    // console.log(constraints, navigator.mediaDevices.getUserMedia(constraints))
    if (navigator.mediaDevices.getUserMedia) {
      //最新的标准API
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(success)
        .catch(error);
    } else if (navigator.webkitGetUserMedia) {
      //webkit核心浏览器
      navigator.webkitGetUserMedia(constraints, success, error);
    } else if (navigator.mozGetUserMedia) {
      //firfox浏览器
      navigator.mozGetUserMedia(constraints, success, error);
    } else if (navigator.getUserMedia) {
      //旧版API
      navigator.getUserMedia(constraints, success, error);
    }
  }

  videoSuccess = (stream) => {
    this.mediaStreamTrack = stream.getTracks()[0];
    this.video.srcObject = stream;
  }

  videoError = (error) => {
    console.error(error);
  }

  componentWillUnmount = () => {
    this.mediaStreamTrack && this.mediaStreamTrack.stop();
  }

  getImgData = () => {
    setTimeout(() => {
      if (this.mediaStreamTrack) {
        this.canvas = document.createElement("canvas");
        let context = this.canvas.getContext("2d");
        context.drawImage(this.video, 0, 0, 300, 150);
        let imgSrc = this.canvas.toDataURL("image/png");
        this.setState({
          imgsrc: imgSrc
        })
        this.mediaStreamTrack.stop();
      }
    }, 5000)
  }

  render(){
    let {imgsrc} = this.state
    return (
      <View className='faceLogin'>
        <NavBar title='面容识别登录'></NavBar>
        <View id='imgItem'>
          <View className='Mask' >

          </View>
          {imgsrc ? <Image src={imgsrc} style='width:100vw;height:93vh'></Image> : <Video
            id='webcam'
            loop
            autoplay
            className='Video'
          >
          </Video>}

        </View>
      </View>
    )
  }
}
