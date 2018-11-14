import Taro, { Component } from '@tarojs/taro'
import { View, Button, Image } from '@tarojs/components'
import * as d3 from 'd3'
import { fetchReview, downloadReviewFile, submitReview, cancelWork } from '../../utils/beevalley'
import './index.scss'

export default class PointReview extends Component {

    constructor(props) {
        super(props);

        this.state = {
            currentWork: []
        }

        this.apiToken = Taro.getStorageSync('apiToken');
    }

    fetchWorks = () => {
        let { apiToken } = this;
        fetchReview(apiToken, 'count', 4).then((res) => {
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
            this.setState({
                currentWork: nowWork
            })
        } else {
            this.fetchWorks();
        }
    }

    getImgFile = (imgId) => {
        let { apiToken } = this;
        downloadReviewFile(apiToken, imgId).then((res) => {
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

    submitWork = () => {
        let { currentWork } = this.state;
        if (!currentWork.id) return;
        submitReview(this.apiToken, currentWork.id, true);
        this.nextWork();
    }

    rejectWork = () => {
        let { currentWork } = this.state;
        if (!currentWork.id) return;
        submitReview(this.apiToken, currentWork.id, false);
        this.nextWork();
    }

    cancelWork = () => {
        let { currentWork } = this.state;
        if (!currentWork.id) return;
        cancelWork(this.apiToken, [currentWork.id]);
        this.nextWork();
    }

    imgLoad = () => {

    }

    componentDidMount() {
        this.fetchWorks();
        Taro.getSystemInfo({
            success: (res) => {
                this.screenWidth = res.windowWidth;
                (res.model !== null) ? this.isMobile = true : this.isMobile = false;
            }
        })
        if (process.env.TARO_ENV === 'weapp') {
        } else if (process.env.TARO_ENV === 'h5') {
        }
    }

    updateCircle = () => {

        let { currentWork } = this.state;
        if (currentWork.work) {
            let circle = this.svg.selectAll("circle");
            let update = circle.data(currentWork.work.result);
            update.exit().remove();
            update.enter().append("circle")
                .attr("r", 10)
                .attr("fill", "red")
                .attr("cx", (d) => d.x)
                .attr("cy", (d) => d.y);
            update.attr("cx", (d) => d.x).attr("cy", (d) => d.y);


        }
    }

    render() {

        let { currentWork } = this.state;

        if (currentWork.src) {
            this.svg = d3.select(".workImg")
                .append("svg")
                .attr("width", this.state.currentWork.meta.imageWidth)
                .attr("height", this.state.currentWork.meta.imageHeight);
            this.updateCircle();
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
                    <Button type='primary' onClick={this.submitWork}>通过</Button>
                    <Button type='warn' onClick={this.rejectWork}>驳回</Button>
                    <Button style='background: #FFCC00;' type='warn' onClick={this.cancelWork}>放弃</Button>
                </View>
            </View>
        )
    }
}