import Taro, { Component } from '@tarojs/taro'
import { View, Button, Image } from '@tarojs/components'
import * as d3 from 'd3'
import { fetchReview, downloadReviewFile, submitReview, cancelWork } from '../../utils/beevalley'
import { fetch } from '../../utils/localIfo'
import './index.scss'

export default class RectReview extends Component {
    constructor(props){
        super(props);

        this.state = {
            currentWork: {}
        }

        this.apiToken = fetch('apiToken');
    }

    getWork = () => {
        let { apiToken } = this;
        fetchReview(apiToken, 'rect', 4).then((res) => {
            this.work = res;
            
            if (this.work.length > 0) {

                if(this.screenWidth < 500){
                    this.work = this.work.map((item) => this.preprocessWork(item))
                }

                this.work.forEach(item => this.getImgFile(item));
                this.nextWork()
            }
        })
    }

    preprocessWork = (work) => {
        let anchorX = Math.floor(work.work.result[0][0].x + (work.work.result[0][1].x - work.work.result[0][0].x)/2);
        let anchorY = Math.floor(work.work.result[0][0].y + (work.work.result[0][1].y - work.work.result[0][0].y)/2);

        let options = this.calculateWorkarea(work.meta.imageWidth, work.meta.imageHeight, anchorX, anchorY, this.screenWidth, this.screenHeight);
        options['format'] = 'jpeg';

        work['xOffset'] = options.x;
        work['yOffset'] = options.y;
        work['anchorX'] = anchorX;
        work['anchorY'] = anchorY;
        work['downloadOptions'] = options;

        return work;

    }

    nextWork = () => {
        if (this.work.length > 0) {
            let nowWork = this.work.pop();

            if (this.svg) {
                this.svg.remove();
            }

            if (this.screenWidth < 500) {

                nowWork.meta = {
                    imageWidth: this.screenWidth,
                    imageHeight: this.screenHeight
                }
            }
            this.setState({
                currentWork: nowWork
            })
        } else {
            this.getWork();
        }
    }

    getImgFile = (work) => {
        let { apiToken } = this;
        downloadReviewFile(apiToken, work.id, work.downloadOptions).then((res) => {
            let imgBase64 = 'data:image/jpeg;base64,' + Taro.arrayBufferToBase64(new Uint8Array(res));
            if (work.id === this.state.currentWork.id) {
                let current = Object.assign({}, this.state.currentWork, { src: imgBase64 });

                this.setState({
                    currentWork: current
                })
            } else {
                let foundIndex = this.work.findIndex(item => item.id === work.id);

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

    componentDidMount() {
        this.getWork();
        const query = Taro.createSelectorQuery()
        query
            .select('#workearea')
            .fields({
                size: true,   
            }, res => {
                
                this.screenWidth = Math.floor(res.width);
                this.screenHeight = Math.floor(res.height);
            })
            .exec();
        if (process.env.TARO_ENV === 'weapp') {
        } else if (process.env.TARO_ENV === 'h5') {
        }
    }

    calculateWorkarea = (imageWidth, imageHeight, anchorX, anchorY, windowWidth, windowHeight) => {
        var x;
        if (anchorX < windowWidth / 2) {
            x = 0;
        } else if (anchorX > imageWidth - windowWidth / 2) {
            x = imageWidth - windowWidth;
        } else {
            x = anchorX - windowWidth / 2
        }
        var y;
        if (anchorY < windowHeight / 2) {
            y = 0;
        } else if (anchorY > imageHeight - windowHeight / 2) {
            y = imageHeight - windowHeight;
        } else {
            y = anchorY - windowHeight / 2
        }
        return { x: Math.floor(x), y: Math.floor(y), width: windowWidth, height: windowHeight };
    }

    

    render(){
        
        let { currentWork } = this.state;

        if (currentWork.src) {
            this.svg = d3.select(".workImg")
                .append("svg")
                .attr("width", this.state.currentWork.meta.imageWidth)
                .attr("height", this.state.currentWork.meta.imageHeight);
            let rectData = {}; 
            if(this.screenWidth < 500){
                rectData = {
                    x: currentWork.work.result[0][0].x - currentWork.xOffset,
                    y: currentWork.work.result[0][0].y - currentWork.yOffset,
                    width: currentWork.work.result[0][1].x - currentWork.work.result[0][0].x,
                    height: currentWork.work.result[0][1].y - currentWork.work.result[0][0].y 
                }
            }else{
                rectData = {
                    x: currentWork.work.result[0][0].x,
                    y: currentWork.work.result[0][0].y,
                    width: currentWork.work.result[0][1].x - currentWork.work.result[0][0].x,
                    height: currentWork.work.result[0][1].y - currentWork.work.result[0][0].y
                }
            }
            
            let rect = this.svg.selectAll("rect");
            let update = rect.data([rectData]);

            update.exit().remove();
            update.enter().append("rect")
                .attr("fill", "yellow")
                .attr("fill-opacity", 0.1)
                .attr("stroke", "green")
                .attr("stroke-width", "2px")
                .attr("x", (d) => d.x)
                .attr("y", (d) => d.y)
                .attr("width", (d) => d.width)
                .attr("height", (d) => d.height);
        }

        return (
            <View className='index'>
                <View className="imgItem" id="workearea">
                    {currentWork.src && (
                        <Image src={currentWork.src} style={`width:${currentWork.meta.imageWidth}px;height:${currentWork.meta.imageHeight}px;`}></Image>
                    )
                    }
                    <View className="workImg"></View>
                </View>
                <View className="btnItem">
                    <Button type="primary" onClick={this.submitWork}>提交</Button>
                    <Button type="warn" onClick={this.rejectWork}>驳回</Button>
                    <Button style="background: #FFCC00;" type="warn" onClick={this.cancelWork}>放弃</Button>
                </View>
            </View>
        )
    }
}