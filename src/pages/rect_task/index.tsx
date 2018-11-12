import Taro, { Component } from '@tarojs/taro'
import { View, Button, Image } from '@tarojs/components'
import * as d3 from 'd3'
import { fetchWork, downloadWorkFile, cancelWork, submitWork } from '../../utils/beevalley'
import { fetch } from '../../utils/localIfo'
import './index.scss'

export default class RectTask extends Component {
    constructor(props) {
        super(props)

        this.state = {
            currentWork: {}
        }

        this.apiToken = fetch('apiToken');
        this.rectInitialized = true;
    }

    nextWork = () => {

        if (this.work.length > 0) {
            let nowWork = this.work.pop();
            this.rectInitialized = true;
            if (this.screenWidth < 500) {

                nowWork.meta = {
                    imageWidth: this.screenWidth,
                    imageHeight: this.screenHeight
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

    getWork = () => {
        let { apiToken } = this;
        fetchWork(apiToken, 'rect', 4).then((res) => {
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
        let anchorX = Math.floor(work.prerequisites[0].result[work.meta.index].x);
        let anchorY = Math.floor(work.prerequisites[0].result[work.meta.index].y);

        let options = this.calculateWorkarea(work.meta.imageWidth, work.meta.imageHeight, anchorX, anchorY, this.screenWidth, this.screenHeight);
        options['format'] = 'jpeg';

        work['xOffset'] = options.x;
        work['yOffset'] = options.y;
        work['anchorX'] = anchorX;
        work['anchorY'] = anchorY;
        work['downloadOptions'] = options;

        return work;

    }

    getImgFile = (work) => {
        let { apiToken } = this;
        // console.log(work)
        downloadWorkFile(apiToken, work.id, work.downloadOptions).then((res) => {
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

    addRect = (newRect) => {
        let { currentWork } = this.state;
        currentWork.rectPosition = newRect;
        
        this.changePosition(newRect)
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
        if (this.svg) {
            let rect = this.svg.selectAll("rect");
            let update = rect.data(rectData);
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

            update.attr("x", (d) => d.x)
                .attr("y", (d) => d.y)
                .attr("width", (d) => d.width)
                .attr("height", (d) => d.height);
        }

    }

    updateCircle = (cirCleData) => {
        if (this.svg) {
            let cirCle = this.svg.selectAll("circle");
            let update = cirCle.data(cirCleData);
            update.exit().remove();
            update.enter().append("circle")
                .attr("r", 10)
                .attr("cx", (d) => d.x)
                .attr("cy", (d) => d.y)
                .attr("fill", "red");
            update.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
        }
    }

    drawRect = (Touchx, Touchy) => {
        let { x, y } = this.startRect;
        let { rectPosition } = this.state.currentWork;
        let changeWidth = Touchx - x;
        let changeHeight = Touchy - y;

        if (changeWidth < 0) {
            rectPosition.xMin = Touchx;
            rectPosition.xMax = x

        } else {
            rectPosition.xMax = Touchx;
        }
        if (changeHeight < 0) {
            rectPosition.yMin = Touchy;
            rectPosition.yMax = y;

        } else {
            rectPosition.yMax = Touchy;
        }
        this.changePosition(rectPosition);
    }

    adjustRect = (Touchx, Touchy) => {
        let { x, y } = this.startRect;
        let { rectPosition } = this.state.currentWork;

        let deltaXmin = Math.abs(Touchx - rectPosition.xMin);
        let deltaXmax = Math.abs(Touchx- rectPosition.xMax);
        let deltaYmin = Math.abs(Touchy - rectPosition.yMin);
        let deltaYmax = Math.abs(Touchy- rectPosition.yMax);

        if (rectPosition.yMin < Touchy && rectPosition.yMax > Touchy) {
            if (deltaXmax < deltaXmin) {
                rectPosition.xMax += (Touchx - x);
            } else {
                rectPosition.xMin += (Touchx - x);
            }
        }
        if (rectPosition.xMin < Touchx && rectPosition.xMax > Touchx) {
            if (deltaYmax < deltaYmin) {
                rectPosition.yMax += (Touchy - y);
            } else {
                rectPosition.yMin += (Touchy - y);
            }
        }
        this.changePosition(rectPosition);
        this.startRect = {
            x: Touchx,
            y: Touchy
        };
    }

    componentDidMount() {
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
        this.getWork();
        if (process.env.TARO_ENV === 'weapp') {
        } else if (process.env.TARO_ENV === 'h5') {
        }
        this.svg = d3.select(".workImg")
            .append("svg");

        if(this.screenWidth < 500){
            this.svg.on("touchstart", () => {
            
                if (this.rectInitialized) {
                    console.log(d3.event)
                    this.addRect({
                        xMin: d3.event.targetTouches[0].clientX,
                        yMin: d3.event.targetTouches[0].clientY,
                        xMax: d3.event.targetTouches[0].clientX,
                        yMax: d3.event.targetTouches[0].clientY
                    });
                }

                this.startRect = {
                    x: d3.event.targetTouches[0].clientX,
                    y: d3.event.targetTouches[0].clientY
                };

                this.svg.on("touchmove", () => {
                    if (this.rectInitialized) {
                        this.drawRect(d3.event.targetTouches[0].clientX, d3.event.targetTouches[0].clientY);
                    } else {
                        this.adjustRect(d3.event.targetTouches[0].clientX, d3.event.targetTouches[0].clientY);
                    }
                })
    
                this.svg.on("touchend", () => {
    
                    if (this.rectInitialized) {
                        this.rectInitialized = false;
                    }
                    this.svg.on("touchmove", null)
                    this.svg.on("touchend", null)
                })
            })   
        }else{
            this.svg.on('mousedown', () => {
                if (this.rectInitialized) {
    
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
    
                    if (this.rectInitialized) {
                        this.drawRect(d3.event.offsetX, d3.event.offsetY);
                    } else {
                        this.adjustRect(d3.event.offsetX, d3.event.offsetY);
                    }
    
                });
                this.svg.on('mouseup', () => {
                    if (this.rectInitialized) {
                        this.rectInitialized = false;
                    }
                    this.svg.on('mousemove', null);
                    this.svg.on('mouseup', null);
                });
    
            });
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



    submitWork = () => {
        let { rectPosition, id } = this.state.currentWork;
        let { apiToken } = this;
        let rectData = [{x: rectPosition.xMin, y: rectPosition.yMin},{x: rectPosition.xMax, y: rectPosition.yMax}];
        if (rectPosition) {
            submitWork(apiToken, id, [rectData]);
            this.nextWork();
        } else {
            alert("请标注框");
        }
    }

    cancelWork = () => {
        let { id } = this.state.currentWork;
        let { apiToken } = this;

        cancelWork(apiToken, [id])
        this.nextWork();
    }

    render() {
        let { currentWork } = this.state;

        if (this.svg && currentWork) {
            this.svg.attr("width", currentWork.meta.imageWidth)
                .attr("height", currentWork.meta.imageHeight);
            if(this.screenWidth < 500){
                let circleData = {
                    x: currentWork.anchorX - currentWork.xOffset,
                    y: currentWork.anchorY - currentWork.yOffset,
                }
                this.updateCircle([circleData])

                if (currentWork.previousWork !== null && currentWork.rectPosition == undefined) {
                
                    let rectData = {
                        xMin: currentWork.previousWork.result[0][0].x - currentWork.xOffset,
                        yMin: currentWork.previousWork.result[0][0].y - currentWork.yOffset,
                        xMax: currentWork.previousWork.result[0][1].x - currentWork.xOffset,
                        yMax: currentWork.previousWork.result[0][1].y - currentWork.yOffset,
                    }
    
                    this.addRect(rectData);
                    this.rectInitialized = false;
                } else {
                    if(currentWork.rectPosition){
                        this.changePosition(currentWork.rectPosition);
                    }else{
                        this.updateRect([])  
                    }
                    
                }
            }else{
                let circleData = {
                    x: currentWork.prerequisites[0].result[currentWork.meta.index].x,
                    y: currentWork.prerequisites[0].result[currentWork.meta.index].y
                }
                this.updateCircle([circleData])

                if (currentWork.previousWork !== null && currentWork.rectPosition == undefined) {
                
                    let rectData = {
                        xMin: currentWork.previousWork.result[0][0].x,
                        yMin: currentWork.previousWork.result[0][0].y,
                        xMax: currentWork.previousWork.result[0][1].x,
                        yMax: currentWork.previousWork.result[0][1].y,
                    }
    
                    this.addRect(rectData);
                    this.rectInitialized = false;
                } else {
                    if(currentWork.rectPosition){
                        this.changePosition(currentWork.rectPosition);
                    }else{
                        this.updateRect([])  
                    }
                    
                }
            }
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
                    <Button type="warn" onClick={this.cancelWork}>放弃</Button>
                </View>
            </View>
        )
    }
}