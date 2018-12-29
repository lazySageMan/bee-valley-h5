import Taro, { Component } from '@tarojs/taro'
import { View, Button, Image } from '@tarojs/components'
import * as d3 from 'd3'
import { fetchReview, downloadReviewFile, submitReview, cancelWork, checkDveice } from '../../utils/beevalley'
import NavBar from '../../components/navBar/index'
import './index.scss'

export default class RectReview extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentWork: {}
        }
        this.apiToken = Taro.getStorageSync('apiToken');
    }
    
    fetchWorks = () => {
        let { apiToken } = this;
        fetchReview(apiToken, 'rect', 4, this.packageId).then((res) => {
            this.work = res.map((item) => this.preprocessWork(item))
            if (this.work.length > 0) {
                this.getImgFile(this.work[this.work.length - 1]);
                this.nextWork()
            } else {
                Taro.showToast({
                    title: '没有任务了'
                })
            }
        })
    }

    preprocessWork = (work) => {
        let anchorX = Math.floor(work.work.result[0][0].x + (work.work.result[0][1].x - work.work.result[0][0].x) / 2);
        let anchorY = Math.floor(work.work.result[0][0].y + (work.work.result[0][1].y - work.work.result[0][0].y) / 2);
        work['anchorX'] = anchorX;
        work['anchorY'] = anchorY;

        if (this.isMobile) {
            let options = this.calculateWorkarea(work.meta.imageWidth, work.meta.imageHeight, anchorX, anchorY, this.screenWidth, this.screenHeight);
            options['format'] = 'jpeg';
            work['xOffset'] = options.x;
            work['yOffset'] = options.y;
            work['downloadOptions'] = options;
        } else {
            work['xOffset'] = 0;
            work['yOffset'] = 0;
        }

        return work;

    }

    nextWork = () => {
        if (this.work.length > 0) {
            let currentWork = this.work.pop();

            if (this.work.length > 0) {
                this.getImgFile(this.work[this.work.length - 1]);
            }
            if (this.isMobile) {
                currentWork.meta = {
                    imageWidth: this.screenWidth,
                    imageHeight: this.screenHeight
                }
            }

            if (currentWork.work.result) {

                let rectData = {
                    xMin: currentWork.work.result[0][0].x - currentWork.xOffset,
                    yMin: currentWork.work.result[0][0].y - currentWork.yOffset,
                    xMax: currentWork.work.result[0][1].x - currentWork.xOffset,
                    yMax: currentWork.work.result[0][1].y - currentWork.yOffset,
                };
                currentWork.rectPosition = rectData;
            }
            this.setState({
                currentWork: currentWork
            })
            // Taro.hideLoading();

        } else {
            this.setState({currentWork: {}})
            this.fetchWorks();
        }
    }

    getImgFile = (work) => {
        let { apiToken } = this;
        downloadReviewFile(apiToken, work.id, work.downloadOptions)
        .then((res) => {
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
        })
        .catch(this.defaultErrorHandling)

    }

    submitWork = () => {
        let { currentWork } = this.state;
        if (currentWork && currentWork.id) {
            Taro.showLoading({
                title: 'loading',
                mask: true
            })
            this.setState({currentWork: {}})
            submitReview(this.apiToken, currentWork.id, true)
                .then(() => this.nextWork())
                .catch(this.defaultErrorHandling)            
        }

    }

    rejectWork = () => {
        let { currentWork } = this.state;
        if (currentWork && currentWork.id) {
            Taro.showLoading({
                title: 'loading',
                mask: true
            })
            this.setState({currentWork: {}})
            submitReview(this.apiToken, currentWork.id, false)
            .then(() => this.nextWork())
            .catch(this.defaultErrorHandling)
        }
    }

    cancelWork = () => {
        let { currentWork } = this.state;
        let { apiToken } = this;

        if (currentWork && currentWork.id) {
            Taro.showLoading({
                title: 'loading',
                mask: true
            })
            this.setState({currentWork: {}})
            cancelWork(apiToken, [currentWork.id])
                .then(() => {
                    this.nextWork();
                })
                .catch(this.defaultErrorHandling)            
            }
    }

    defaultErrorHandling = () => {
        Taro.hideLoading()
        Taro.navigateBack({
                delta: 1
            })
    }

    componentWillMount() {
        this.packageId = this.$router.params.packageId;
        let res = Taro.getSystemInfoSync()
        this.screenWidth = res.windowWidth;
        this.screenHeight = Math.floor(res.windowHeight * 0.85);
        this.isMobile = checkDveice(res)
    }

    componentDidMount() {
        this.svg = d3.select(".workImg").append("svg");
        if (this.isMobile) {
            this.svg.on("touchmove", () => {
                d3.event.preventDefault();
            })
        }
        Taro.showLoading({
                title: 'loading',
                mask: true
            })
        this.fetchWorks()
    }

    componentWillUnmount() {
        if (this.work) {
            let toCancel = this.work.map(w => w.id)
            if (this.state.currentWork && this.state.currentWork.id) {
                toCancel.push(this.state.currentWork.id)
            }
            if (toCancel.length > 0) {
                cancelWork(this.apiToken, toCancel)
            }
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

    updateReact = (currentWork) => {
        let { rectPosition } = currentWork;
        let rectData = [];
        if (rectPosition && rectPosition.xMin && rectPosition.yMin && rectPosition.xMax && rectPosition.yMax) {
            rectData = [{
                x: rectPosition.xMin,
                y: rectPosition.yMin,
                width: rectPosition.xMax - rectPosition.xMin,
                height: rectPosition.yMax - rectPosition.yMin
            }]
        }
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

    render() {

        let { currentWork } = this.state;

        if (currentWork && currentWork.src) {
            Taro.hideLoading()
        }

        if (currentWork.meta && this.svg) {
            this.svg
                .attr("width", currentWork.meta.imageWidth)
                .attr("height", currentWork.meta.imageHeight);
        }

        this.updateReact(currentWork)

        return (
            <View className='rect'>
                <NavBar title='方框审核' />
                <View className='imgItem' id='workearea'>
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