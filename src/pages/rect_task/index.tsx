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
        console.log(this.apiToken)
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

        currentWork.rectPosition = currentWork.rectPosition ? [newRect, ...currentWork.rectPosition] : [newRect];

        this.setState({
            currentWork: currentWork
        }, () => {
            this.updateRect(currentWork.rectPosition);
        })
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
            
            rect.on("click", (d) => {
                d3.event.stopPropagation();
                console.log(d);
            })
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
        this.svg = d3.select(".workImg")
            .append("svg");
        this.svg.on('mousedown', () => {
            let id = Math.random()*500000;
            this.addRect({
                x: d3.event.offsetX,
                y: d3.event.offsetY,
                defaultX: d3.event.offsetX,
                defaultY: d3.event.offsetY,
                width: 0,
                height: 0,
                id: id
            });

            this.svg.on('mousemove', () => {
                let {rectPosition} = this.state.currentWork;
                rectPosition.forEach((item) => {
                    if(item.id === id){
                        let {defaultX, defaultY} = item;

                        let changeWidth = d3.event.offsetX - defaultX;
                        let changeHeight = d3.event.offsetY - defaultY;

                        if(changeWidth < 0){
                            item.x = d3.event.offsetX;
                            item.width = Math.abs(changeWidth);
                            
                        }else{
                            item.width = changeWidth
                        }
                        if(changeHeight < 0){
                            item.y = d3.event.offsetY;
                            item.height = Math.abs(changeHeight);
                            
                        }else{
                            item.height = changeHeight;
                        }
                        this.updateRect(rectPosition);
                    }
                })
                
            });
            this.svg.on('mouseup', () => {
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