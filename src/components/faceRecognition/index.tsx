import Taro, {
  Component
} from '@tarojs/taro';
import {
  View,
  Video,
} from '@tarojs/components';
import * as d3 from 'd3'

import {
  checkDveice
} from '../../utils/beevalley'
import i18next from '../../i18n'

import './index.scss'

export default class faceRecognitionLogin extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let res = Taro.getSystemInfoSync();
    this.isMobile = checkDveice(res)
    this.videoWidth = this.isMobile ? res.windowWidth : res.windowWidth * 0.6;
    this.videoHeight = res.windowHeight - res.windowHeight * 0.07;

    this.svg = d3.select(".Mask").append("svg");
    this.svg.attr("width", this.videoWidth)
      .attr("height", this.videoHeight);
    let rect = this.svg.selectAll("rect");
    let update = rect.data([{
      x: this.videoWidth / 2 - this.videoWidth * 0.5 / 2,
      y: this.videoHeight / 2 - this.videoWidth * 0.5 / 2,
      width: this.videoWidth * 0.5,
      height: this.videoWidth * 0.5
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
    // this.getImgData();
  }

  initVideo = () => {
    this.video = document.getElementById("webcam");
    if (
      navigator.mediaDevices.getUserMedia ||
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia
    ) {
      var constraints = {
        video: {
          facingMode: "user"
        }
      };
      this.getUserMedia(constraints, this.videoSuccess, this.videoError);
    } else {
      Taro.showToast({
        title: i18next.t('PermissionsCamera'),
        mask: true
      })
    }
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
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.videoWidth;
    this.canvas.height = this.videoHeight;
    this.getImgData()
  }

  videoError = (error) => {
    console.error(error);
  }

  componentWillUnmount = () => {
    this.mediaStreamTrack && this.mediaStreamTrack.stop();
    this.mediaStreamTrack = null
  }

  getImgData = () => {
    if (this.mediaStreamTrack) {
      let context = this.canvas.getContext("2d");
      // TODO
      context.drawImage(this.video, 0, 0, this.videoWidth, this.videoHeight);
      let that = this
      this.canvas.toBlob((blob) => {
        if (blob) {
          that.props.onGetImgSrc(blob).then(rst => {
            if (!rst) {
              setTimeout(() => {
                that.getImgData()
              }, 2000)
            }
          })
        }
      }, "image/jpeg")
    }
  }


  render() {
    return (
      <View style='wrap_face'>
        <View className='Mask' >

        </View>
        <Video
          id='webcam'
          loop
          autoplay
          className='Video'
        >
        </Video>
      </View>
    )
  }
}
