import Taro, { Component } from '@tarojs/taro'
import { View, Button, Image, Input } from '@tarojs/components'
import * as d3 from 'd3'
import { fetchReview, downloadReviewFile, submitReview, cancelWork, checkDveice } from '../../utils/beevalley'
import './index.scss'

export default class PointReview extends Component {

    constructor(props) {
        super(props);

        this.state = {
            currentWork: [],
            lineData:[],
            lineWidth: 50
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
        submitReview(this.apiToken, currentWork.id, true)
        .then(() => this.nextWork())
    }

    rejectWork = () => {
        let { currentWork } = this.state;
        if (!currentWork.id) return;
        submitReview(this.apiToken, currentWork.id, false)
        .then(() => this.nextWork())
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
                this.isMobile = checkDveice(res)
            }
        })

        this.svg = d3.select(".workImg").append("svg");

        this.svg.on("mouseover", () => {
            this.changeLine(d3.event.offsetX, d3.event.offsetY)
      
            this.svg.on("mousemove", () => {
                this.changeLine(d3.event.offsetX, d3.event.offsetY)
            })
      
            this.svg.on("mouseout", () => {
                this.svg.on("mousemove", null);
                this.svg.on("mouseout", null);
                this.setState({
                    lineData: []
                })
            })
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

    updateLine = (lineData) => {
        if(this.svg){
            let line = this.svg.selectAll("line");
            let update = line.data(lineData);
        
            update.exit().remove();
            
            update.enter().append("line")
                .attr("x1", (d) => d.x1)
                .attr("y1", (d) => d.y1)
                .attr("x2", (d) => d.x2)
                .attr("y2", (d) => d.y2)
                .style("stroke", "red")
                .style("stroke-width", 2);
        
            update.attr("x1", (d) => d.x1)
                .attr("y1", (d) => d.y1)
                .attr("x2", (d) => d.x2)
                .attr("y2", (d) => d.y2);
        }
    }

    changeLine = (eventX, eventY) => {
        let {lineWidth} = this.state;
        let pointRadius = 10;
        let hengX1 = eventX - pointRadius;
        let hengX2 = eventX + pointRadius;
    
        let shuY1 = eventY - pointRadius;
        let shuY2 = eventY + pointRadius;
    
        this.setState({
            lineData: [
                {x1: hengX1, x2: hengX1 - lineWidth, y1: eventY, y2: eventY},
                {x1: hengX2, x2: hengX2 + lineWidth, y1: eventY, y2: eventY},
                {x1: eventX, x2: eventX, y1: shuY1, y2: shuY1 - lineWidth},
                {x1: eventX, x2: eventX, y1: shuY2, y2: shuY2 + lineWidth}
            ]
        });
    }

    changeR = (ev) => {
        this.setState({lineWidth: Number(ev.target.value)});
    }

    render() {

        let { currentWork, lineData } = this.state;

        if (currentWork.src && this.svg) {

            this.svg
                .attr("width", this.state.currentWork.meta.imageWidth)
                .attr("height", this.state.currentWork.meta.imageHeight);
            this.updateCircle();
            this.updateLine(lineData);
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
                    <Input placeholder="十字标的半径" className="changeR" onChange={this.changeR} value={this.state.lineWidth}></Input>
                </View>
            </View>
        )
    }
}