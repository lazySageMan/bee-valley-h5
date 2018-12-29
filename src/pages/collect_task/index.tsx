import Taro from '@tarojs/taro'
import {
  View,
  Image,
  Text,
  Input
} from '@tarojs/components'
import {
  AtButton,
  AtIcon
} from 'taro-ui'
import NavBar from '../../components/navBar/index'
import {
  fetchWork
} from '../../utils/beevalley'

import './index.scss'

export default class DataAcquistion extends Taro.Component {

  constructor() {
    super(...arguments)
    this.apiToken = Taro.getStorageSync('apiToken');
  }

  componentDidMount() {
    this.packageId = this.$router.params.packageId
    fetchWork(this.apiToken, 'collect', 1, this.packageId).then(res => {
      if (res.length > 0) {
        // TODO fix potential bug here
        this.workId = res[0].id
        this.setState({
          sampleImages: res[0].meta.samples,
          selectedImages: new Array(res[0].meta.samples.length)
        })
      } else {
        Taro.showToast({
          title: '没有任务了'
        })
      }
    })
  }

  getImg = (index, event) => {
    let files = event.target.files;
    let file = '';
    if (files && files.length > 0) {
      file = files[0];
      var reader = new FileReader();
      reader.onload = (ev) => {
        this.setState(prevState => {
          let selectedImages = prevState.selectedImages
          selectedImages[index] = ev.target.result
          return {
            selectedImages: selectedImages
          }
        })
      };
      reader.readAsDataURL(file);
    }
  }

  delete = (index) => {
    this.setState(prevState => {
      let selectedImages = prevState.selectedImages
      selectedImages[index] = null
      return {
        selectedImages: selectedImages
      }
    })
  }



  submitWork = () => {

  }

  render() {

    let showOne = (selectedImage, index) => {
      if (selectedImage) {
        return (
          <View className='showImg'>
                    <AtIcon size='20' value='close-circle' color='red' onClick={this.delete.bind(this, index)}></AtIcon>
                    <Image src={selectedImage} className='img'></Image>
                </View>
        )
      } else {
        return (
          <View className='showIcon' >
                    <AtIcon size='60' value='camera' color='orange'></AtIcon>
                    添加图片
                    <Input type='file' accept='image/*' className='selectImg' onChange={this.getImg.bind(this, index)} />
                </View>
        )
      }
    }

    let {
      sampleImages,
      selectedImages
    } = this.state;
    let sampleImageView
    if (sampleImages && selectedImages) {
      sampleImageView = sampleImages.map((item, index) => {
        return (
          <View key={index} className='show-item'>
                        <View className='eg img-item'>
                            <View className='eg-item'>示例</View>
                            <Image src={item} className='img'></Image>
                        </View>
                        <View className='img-item'>
                            {showOne(selectedImages[index], index)}
                        </View>
                    </View>

        )
      })
    }

    return (
      <View className='data-wrap'>
                <View className='main-content'>
                    <View className='task_demand'>
                        <View className='title'>任务要求</View>
                        <View className='content-list'>
                            <View className='list-item'>1 每组图片10张以上，同一组目标对象必须是同一个老年人；</View>
                            <View className='list-item'>2 老年人应在60岁以上，男女不限；</View>
                            <View className='list-item'>3 图像来源可以是监控摄像头，手机自拍，拍别人，不能是网上搜索的图片；</View>
                            <View className='list-item'>4 每张图片的人脸必须五官清晰可见，能够准确辨认出身份；</View>
                            <View className='list-item'>5 所有图片应避免在同一时刻、同一场景下拍摄，尽量保证场景差异性越大越好（比如在不同的餐厅、景区、商场等）；</View>
                            <View className='list-item'>6 所有图片的人脸角度差异性越大越好（比如在保证五官清晰的前提下，有不同角度的侧脸、低头、抬头等）；</View>
                            <View className='list-item'>7 同一张图片内若有多张人脸，目标人脸必须最大。</View>
                        </View>

                    </View>
                </View>
                <View className='user-photo'>
                    <View className='user-photo-wrap'>
                        <View className='title'>
                            <AtIcon size='30' value='image' color='orange'></AtIcon>
                            <Text className='font'>拍摄第一张照片</Text>
                        </View>
                        <View className='take-photo'>
                            {sampleImageView}
                        </View>
                        <View className='info'>请拍摄10组照片</View>
                        <View className='cenggao'></View>
                    </View>
                </View>
                <View className='cengHeight'></View>
                <View className='top'>
                    <NavBar title='老人图像采集任务'></NavBar>
                    <View className='top-info'>0/1 已添加</View>
                </View>

                <View className='bottom-btn'>
                    <AtButton type='primary' circle className='btn' onClick={this.submitWork}>提交审核</AtButton>
                </View>
            </View>
    )
  }
}
