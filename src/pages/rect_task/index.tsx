import Taro, { Component } from '@tarojs/taro'
import { View, Button, Image } from '@tarojs/components'
import * as d3 from 'd3'
import NavBar from '../component/navBar/index'
import { fetchWork, downloadWorkFile, cancelWork, submitWork, checkDveice } from '../../utils/beevalley'
import './index.scss'

export default class RectTask extends Component {

    constructor(props) {
        super(props)

        this.state = {
            ratio: 1
        }

        this.apiToken = Taro.getStorageSync('apiToken');
        this.rectInitialized = false;
    }

    nextWork = () => {

        if (this.work.length > 0) {
            let currentWork = this.work.pop();

            if (this.work.length > 0) {
                this.downloadWorkFile(this.work[this.work.length - 1]);
            }

            this.rectInitialized = false;

            if (currentWork.rectPosition) {
                this.rectInitialized = true;
            }

            this.setState({
                currentWork: currentWork,
                ratio: 1
            })

            Taro.hideLoading()

        } else {
            this.setState({ currentWork: null, ratio: 1 })
            this.fetchWorks();
        }
    }

    fetchWorks = () => {
        let { apiToken } = this;
        fetchWork(apiToken, 'rect', 4, this.packageId).then((res) => {
            this.work = res.map(item => this.preprocessWork(item));
            if (this.work.length > 0) {
                this.downloadWorkFile(this.work[this.work.length - 1]);
                this.nextWork();
            } else {
                Taro.showToast({
                    title: '没有任务了'
                })
            }
        })
    }

    preprocessWork = (work) => {
        let { ratio } = this.state;
        let anchorX = Math.floor(work.prerequisites[0].result[work.meta.index].x);
        let anchorY = Math.floor(work.prerequisites[0].result[work.meta.index].y);
        let imageWidth = work.meta.imageWidth;
        let imageHeight = work.meta.imageHeight;
        work['anchorX'] = anchorX;
        work['anchorY'] = anchorY;

        if (this.isMobile) {
            let options = this.calculateWorkarea(imageWidth, imageHeight, anchorX, anchorY, Math.round(this.screenWidth * ratio), Math.round(this.screenHeight * ratio));
            options['format'] = 'jpeg';
            work['xOffset'] = options.x;
            work['yOffset'] = options.y;
            work['downloadOptions'] = options;
        } else {
            work['xOffset'] = 0;
            work['yOffset'] = 0;
        }

        if (work.previousWork && !work.rectPosition) {

            let rectData = {
                xMin: (work.previousWork.result[0][0].x - work.xOffset) / ratio,
                yMin: (work.previousWork.result[0][0].y - work.yOffset) / ratio,
                xMax: (work.previousWork.result[0][1].x - work.xOffset) / ratio,
                yMax: (work.previousWork.result[0][1].y - work.yOffset) / ratio,
            };

            work.rectPosition = rectData;
        }

        return work;
    }

    downloadWorkFile = (work) => {
        let { apiToken } = this;
        downloadWorkFile(apiToken, work.id, work.downloadOptions)
            .then((res) => {
                let imgBase64 = 'data:image/jpeg;base64,' + Taro.arrayBufferToBase64(new Uint8Array(res));
                if (this.state.currentWork && work.id === this.state.currentWork.id) {

                    this.setState(prevState => {
                        let updated = prevState.currentWork
                        updated['src'] = imgBase64
                        return { currentWork: updated }
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

    changePosition = (rectPosition) => {
        if (rectPosition && rectPosition.xMin && rectPosition.yMin && rectPosition.xMax && rectPosition.yMax) {
            this.updateRect([{
                x: rectPosition.xMin,
                y: rectPosition.yMin,
                width: rectPosition.xMax - rectPosition.xMin,
                height: rectPosition.yMax - rectPosition.yMin
            }]);
        } else {
            this.updateRect([]);
        }
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

    initializeRect = (x, y) => {
        let rectPosition = this.state.currentWork.rectPosition;

        if (x > rectPosition.xMin) {
            rectPosition.xMax = x;
        } else {
            rectPosition.xMax = rectPosition.xMin;
            rectPosition.xMin = x;
        }

        if (y > rectPosition.yMin) {
            rectPosition.yMax = y;
        } else {
            rectPosition.yMax = rectPosition.yMin;
            rectPosition.yMin = y;
        }
        this.setState((prevState) => {
            let updated = prevState.currentWork
            updated['rectPosition'] = rectPosition
            return { currentWork: updated }
        });

    }

    adjustRect = (Touchx, Touchy) => {
        let { x, y } = this.startRect;
        let { rectPosition } = this.state.currentWork;

        let deltaXmin = Math.abs(Touchx - rectPosition.xMin);
        let deltaXmax = Math.abs(Touchx - rectPosition.xMax);
        let deltaYmin = Math.abs(Touchy - rectPosition.yMin);
        let deltaYmax = Math.abs(Touchy - rectPosition.yMax);

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

        this.setState(prevState => { currentWork: Object.assign(prevState.currentWork, { rectPosition: rectPosition }) });

        this.startRect = {
            x: Touchx,
            y: Touchy
        };
    }

    componentDidMount() {

        this.packageId = this.$router.params.packageId;
        this.rectInitialized = false;

        let res = Taro.getSystemInfoSync()
        this.screenWidth = res.windowWidth;
        this.screenHeight = Math.floor(res.windowHeight * 0.85);
        this.cengHeight = this.screenHeight * 0.07;
        this.isMobile = checkDveice(res)

        if (process.env.TARO_ENV === 'weapp') {
        } else if (process.env.TARO_ENV === 'h5') {
        }

        this.svg = d3.select(".workImg")
            .append("svg");

        if (this.isMobile) {
            this.svg.on("touchstart", () => {
                d3.event.preventDefault();
                if (!this.rectInitialized && this.state.currentWork) {
                    let touch0 = d3.event.targetTouches[0]
                    this.setState(prevState => {
                        currentWork: Object.assign(prevState.currentWork, {
                            rectPosition: {
                                xMin: touch0.clientX,
                                yMin: touch0.clientY - this.cengHeight
                            }
                        })
                    });
                }

                this.startRect = {
                    x: d3.event.targetTouches[0].clientX,
                    y: d3.event.targetTouches[0].clientY - this.cengHeight
                };

            });

            this.svg.on("touchmove", () => {
                d3.event.preventDefault();
                if (this.rectInitialized) {
                    this.adjustRect(d3.event.targetTouches[0].clientX, d3.event.targetTouches[0].clientY - this.cengHeight);
                } else {
                    this.initializeRect(d3.event.targetTouches[0].clientX, d3.event.targetTouches[0].clientY - this.cengHeight);
                }
            })

            this.svg.on("touchend", () => {
                if (!this.rectInitialized && this.state.currentWork) {
                    let { rectPosition } = this.state.currentWork;
                    if (rectPosition.xMin < rectPosition.xMax && rectPosition.yMin < rectPosition.yMax) {
                        this.rectInitialized = true;
                    }
                }
            })

        } else {

            this.svg.on('mousedown', () => {
                if (!this.rectInitialized && this.state.currentWork) {

                    let offsetX = d3.event.offsetX
                    let offsetY = d3.event.offsetY

                    this.setState(prevState => {
                        currentWork: Object.assign(prevState.currentWork, {
                            rectPosition: {
                                xMin: offsetX,
                                yMin: offsetY
                            }
                        })
                    })
                }

                this.startRect = {
                    x: d3.event.offsetX,
                    y: d3.event.offsetY
                };

            });

            this.svg.on('mousemove', () => {

                if (this.startRect) {
                    if (this.rectInitialized) {
                        this.adjustRect(d3.event.offsetX, d3.event.offsetY);
                    } else {
                        this.initializeRect(d3.event.offsetX, d3.event.offsetY);
                    }
                }

            });

            this.svg.on('mouseup', () => {
                if (!this.rectInitialized) {
                    this.rectInitialized = true;
                }
                this.startRect = null;
            });
        }

        Taro.showLoading({
            title: 'loading',
            mask: true
        })

        this.fetchWorks();

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

    submitWork = () => {
        let {currentWork, ratio} = this.state
        if (currentWork) {
            let { rectPosition, id, anchorX, anchorY, xOffset, yOffset } = currentWork,
                { apiToken } = this,
                relativeAnchorX = anchorX - xOffset,
                relativeAnchorY = anchorY - yOffset
            if (rectPosition && relativeAnchorX > rectPosition.xMin && relativeAnchorX < rectPosition.xMax && relativeAnchorY > rectPosition.yMin && relativeAnchorY < rectPosition.yMax) {
                let cengHeight = this.isMobile ? this.cengHeight : 0
                let rectData = [{ x: (rectPosition.xMin + xOffset) * ratio, y: (rectPosition.yMin + yOffset) * ratio + cengHeight }, { x: (rectPosition.xMax + xOffset) * ratio, y: (rectPosition.yMax + yOffset) * ratio + cengHeight }];
                Taro.showLoading({
                    title: 'loading',
                    mask: true
                })
                submitWork(apiToken, id, [rectData])
                    .then(() => {
                        this.nextWork();
                    })
                    .catch(this.defaultErrorHandling)
            } else {
                alert("请框中圆点标记目标");
            }
        }
    }

    cancelWork = () => {
        let { currentWork } = this.state;
        let { apiToken } = this;

        if (currentWork) {
            Taro.showLoading({
                title: 'loading',
                mask: true
            })

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

    lessRatio = () => {

        let { currentWork, ratio } = this.state;
        if (ratio <= 1) {
            Taro.showModal({
                title: '提示',
                content: '不能继续缩小'
            })

        } else {
            ratio -= 1;
            this.setState({
                ratio: ratio
            }, () => {
                this.preprocessWork(currentWork)
                this.downloadWorkFile(currentWork)
            })
        }
    }

    addRatio = () => {
        let { currentWork, ratio } = this.state;
        if (this.screenWidth * (ratio + 1) > currentWork.meta.imageWidth || this.screenHeight * (ratio + 1) > currentWork.meta.imageHeight) {
            Taro.showModal({
                title: '提示',
                content: '不能继续放大'
            })
        } else {
            ratio += 1;
            this.setState({
                ratio: ratio
            }, () => {
                this.preprocessWork(currentWork)
                this.downloadWorkFile(currentWork)
            })
        }
    }


    render() {
        let { currentWork, ratio } = this.state;
        let imageWidth = 0,
            imageHeight = 0

        if (this.svg && currentWork) {
            
            imageWidth = this.isMobile ? this.screenWidth : currentWork.meta.imageWidth,
            imageHeight = this.isMobile ? this.screenHeight : currentWork.meta.imageHeight

            this.svg.attr("width", imageWidth)
                .attr("height", imageHeight);

            if (currentWork.anchorX && currentWork.anchorY) {
                let circleData = {
                    x: (currentWork.anchorX - currentWork.xOffset) / ratio,
                    y: (currentWork.anchorY - currentWork.yOffset) / ratio,
                };
                this.updateCircle([circleData])
            }
            
            this.changePosition(currentWork.rectPosition)
            
        }

        let adjustBtn = this.isMobile ?
            (
                <View className="adjustBtn">
                    <Button className="btn" onClick={this.lessRatio}>－</Button>
                    <Button className="btn" onClick={this.addRatio}>＋</Button>
                </View>
            )
            :
            '';

        return (
            <View className='rect'>
                <NavBar title="方框任务" />
                <View className='imgItem' id='workearea'>
                    {currentWork && currentWork.src && (
                        <Image src={currentWork.src} style={`width:${imageWidth}px;height:${imageHeight}px;`}></Image>
                    )
                    }
                    <View className='workImg'></View>
                </View>
                <View className='btnItem'>
                    <Button type='primary' onClick={this.submitWork}>提交</Button>
                    <Button type='warn' onClick={this.cancelWork}>放弃</Button>
                    {adjustBtn}
                </View>
            </View>
        )
    }
}