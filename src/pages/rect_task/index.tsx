import Taro, { Component } from '@tarojs/taro'
import { View, Button, Image } from '@tarojs/components'
import * as d3 from 'd3'
import { fetchWork, downloadWorkFile, cancelWork, submitWork ,checkDveice} from '../../utils/beevalley'
import './index.scss'

export default class RectTask extends Component {

    constructor(props) {
        super(props)

        this.state = {
            currentWork: {}
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

            // TODO find better way to check mobile device
            if (this.isMobile) {

                currentWork.meta = {
                    imageWidth: this.screenWidth,
                    imageHeight: this.screenHeight
                }
            }

            if (currentWork.previousWork) {

                let rectData = {
                    xMin: currentWork.previousWork.result[0][0].x - currentWork.xOffset,
                    yMin: currentWork.previousWork.result[0][0].y - currentWork.yOffset,
                    xMax: currentWork.previousWork.result[0][1].x - currentWork.xOffset,
                    yMax: currentWork.previousWork.result[0][1].y - currentWork.yOffset,
                };

                this.rectInitialized = true;
                currentWork.rectPosition = rectData;
            }

            this.setState({
                currentWork: currentWork
            })
        } else {
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
                // TODO show toast

            }

        })
    }

    preprocessWork = (work) => {
        let anchorX = Math.floor(work.prerequisites[0].result[work.meta.index].x);
        let anchorY = Math.floor(work.prerequisites[0].result[work.meta.index].y);
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

    downloadWorkFile = (work) => {
        let { apiToken } = this;
        // console.log(work)
        downloadWorkFile(apiToken, work.id, work.downloadOptions)
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
        .catch(() => Taro.navigateBack({
            delta: 1
        }))
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

        let updated = Object.assign({}, this.state.currentWork, {
            rectPosition: rectPosition
        });
        this.setState({ currentWork: updated });

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

        let updated = Object.assign({}, this.state.currentWork, {
            rectPosition: rectPosition
        });

        this.setState({ currentWork: updated });

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
        this.isMobile = checkDveice(res)

        if (process.env.TARO_ENV === 'weapp') {
        } else if (process.env.TARO_ENV === 'h5') {
        }

        this.svg = d3.select(".workImg")
            .append("svg");

        if (this.isMobile) {
            this.svg.on("touchstart", () => {

                if (!this.rectInitialized) {
                    console.log(d3.event)
                    let updated = Object.assign({}, this.state.currentWork, {
                        rectPosition: {
                            xMin: d3.event.targetTouches[0].clientX,
                            yMin: d3.event.targetTouches[0].clientY
                        }
                    });
                    this.setState({ currentWork: updated });
                }

                this.startRect = {
                    x: d3.event.targetTouches[0].clientX,
                    y: d3.event.targetTouches[0].clientY
                };

            });

            this.svg.on("touchmove", () => {
                if (this.rectInitialized) {
                    this.adjustRect(d3.event.targetTouches[0].clientX, d3.event.targetTouches[0].clientY);
                } else {
                    this.initializeRect(d3.event.targetTouches[0].clientX, d3.event.targetTouches[0].clientY);
                }
            })

            this.svg.on("touchend", () => {
                if (!this.rectInitialized) {
                    let { rectPosition } = this.state.currentWork;
                    if (rectPosition.xMin < rectPosition.xMax && rectPosition.yMin < rectPosition.yMax) {
                        this.rectInitialized = true;
                    }
                }
            })

        } else {

            this.svg.on('mousedown', () => {
                if (!this.rectInitialized) {
                    let updated = Object.assign({}, this.state.currentWork, {
                        rectPosition: {
                            xMin: d3.event.offsetX,
                            yMin: d3.event.offsetY
                        }
                    });
                    this.setState({ currentWork: updated });
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

        this.fetchWorks();

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
        // TODO missing offset handling
        if (rectPosition) {
            let rectData = [{ x: rectPosition.xMin, y: rectPosition.yMin }, { x: rectPosition.xMax, y: rectPosition.yMax }];
            submitWork(apiToken, id, [rectData])
            .then(() => {
                this.nextWork();
            })
            .catch(() => Taro.navigateBack({
                delta: 1
            }))
        } else {
            alert("请标注框");
        }
    }

    cancelWork = () => {
        let { id } = this.state.currentWork;
        let { apiToken } = this;

        cancelWork(apiToken, [id])
        .then(() => {
            this.nextWork();
        })
        .catch(() => Taro.navigateBack({
            delta: 1
        }))
    }

    render() {
        let { currentWork } = this.state;

        if (this.svg && currentWork) {
            this.svg.attr("width", currentWork.meta.imageWidth)
                .attr("height", currentWork.meta.imageHeight);

            let circleData = {
                x: currentWork.anchorX - currentWork.xOffset,
                y: currentWork.anchorY - currentWork.yOffset,
            };
            this.updateCircle([circleData])
            this.changePosition(currentWork.rectPosition);
        }

        return (
            <View className='index'>
                <View className='imgItem' id='workearea'>
                    {currentWork.src && (
                        <Image src={currentWork.src} style={`width:${currentWork.meta.imageWidth}px;height:${currentWork.meta.imageHeight}px;`}></Image>
                    )
                    }
                    <View className='workImg'></View>
                </View>
                <View className='btnItem'>
                    <Button type='primary' onClick={this.submitWork}>提交</Button>
                    <Button type='warn' onClick={this.cancelWork}>放弃</Button>
                </View>
            </View>
        )
    }
}