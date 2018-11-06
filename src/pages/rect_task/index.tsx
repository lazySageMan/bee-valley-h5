import Taro, { Component, Config } from '@tarojs/taro'
import { View, Button, Image } from '@tarojs/components'
import * as d3 from 'd3'
import { fetchWork, downloadWorkFile, cancelWork, submitWork } from '../../utils/beevalley'
import {fetch, save} from '../../utils/localIfo'
import './index.scss'

export default class RectTask extends Component{
    constructor(props){
        super(props)

        this.state = {
            currentWork: {}
        }

        this.apiToken = fetch('apiToken');
        this.rectInitialized = true;
    }

    getWork = () => {
        let { apiToken } = this;
        fetchWork(apiToken, 'rect', 4).then((res) => {
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

    addRect = (newRect) => {
        let {currentWork} = this.state;

        currentWork.rectPosition = newRect;

        this.setState({
            currentWork: currentWork
        }, () => {
            this.changePosition(currentWork.rectPosition)
        })
    }

    changePosition = (rectPosition) => {
        this.updateRect([{
            x: rectPosition.xMin,
            y: rectPosition.yMin,
            width: rectPosition.xMax - rectPosition.xMin,
            height: rectPosition.yMax - rectPosition.yMin
        }]);
    }

    updateRect = (rectData) => {
        if(this.svg){
            let rect = this.svg.selectAll("rect");
            let update = rect.data(rectData);
        
            update.enter().append("rect")
                .attr("fill", "yellow")
                .attr("fill-opacity", 0.1)
                .attr("stroke", "green")
                .attr("stroke-width", "2px")
                .attr("x", function(d) { return d.x })
                .attr("y", function(d) { return d.y })
                .attr("width", function(d) { return d.width })
                .attr("height", function(d) { return d.height });
            
            update.attr("x", function(d) { return d.x })
                .attr("y", function(d) { return d.y })
                .attr("width", function(d) { return d.width })
                .attr("height", function(d) { return d.height });
        }

    }

    drawRect = (ev) => {
        let {x, y} = this.startRect;
        let {rectPosition} = this.state.currentWork;
        let changeWidth = ev.offsetX - x;
        let changeHeight = ev.offsetY - y;

        if(changeWidth < 0){
            rectPosition.xMin = ev.offsetX;
            rectPosition.xMax = x
            
        }else{
            rectPosition.xMax = ev.offsetX;
        }
        if(changeHeight < 0){
            rectPosition.yMin = ev.offsetY;
            rectPosition.yMax = y;
            
        }else{
            rectPosition.yMax = ev.offsetY;
        }
        this.changePosition(rectPosition);      
    }

    adjustRect = (ev) => {
        let {x, y} = this.startRect;
        let {rectPosition} = this.state.currentWork;

        let deltaXmin = Math.abs(ev.offsetX - rectPosition.xMin);
        let deltaXmax = Math.abs(ev.offsetX - rectPosition.xMax);
        let deltaYmin = Math.abs(ev.offsetY - rectPosition.yMin);
        let deltaYmax = Math.abs(ev.offsetY - rectPosition.yMax);

        if (rectPosition.yMin < ev.offsetY && rectPosition.yMax > ev.offsetY) {
            if (deltaXmax < deltaXmin) {
                rectPosition.xMax += (ev.offsetX - x);
            } else {
                rectPosition.xMin += (ev.offsetX - x);
            }
        }
        if (rectPosition.xMin < ev.offsetX && rectPosition.xMax > ev.offsetX) {
            if (deltaYmax < deltaYmin) {
                rectPosition.yMax += (ev.offsetY - y);
            } else {
                rectPosition.yMin += (ev.offsetY - y);
            }
        }
        this.changePosition(rectPosition);
        this.startRect = {
            x: ev.offsetX,
            y: ev.offsetY
        };
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
        this.svg = d3.select(".workImg")
            .append("svg");
        this.svg.on('mousedown', () => {
            if(this.rectInitialized){
                
                this.addRect({
                    xMin: d3.event.offsetX,
                    yMin: d3.event.offsetY,
                    xMax: d3.event.offsetX,
                    yMax: d3.event.offsetY
                });
            }

            this.startRect = {
                x: d3.event.offsetX,
                y: d3.event.offsetY
            };

            this.svg.on('mousemove', () => {

                if(this.rectInitialized){
                    this.drawRect(d3.event);
                }else {
                    this.adjustRect(d3.event);
                }
                
            });
            this.svg.on('mouseup', () => {
                if(this.rectInitialized){
                    this.rectInitialized = false;
                }
                this.svg.on('mousemove', null);
                this.svg.on('mouseup', null);
            });

        });
    }



    submitWork = () => {

    }

    cancelWork = () => {

    }

    render(){

        let {currentWork} = this.state;

        if (this.svg && currentWork) {
            this.svg.attr("width", currentWork.meta.imageWidth)
            .attr("height", currentWork.meta.imageHeight);
        }

        return (
            <View className='index'>
                <View className="imgItem">
                {currentWork.src && (
                        <Image src={currentWork.src} style={`width:${currentWork.meta.imageWidth}px;height:${currentWork.meta.imageHeight}px;`}></Image>
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