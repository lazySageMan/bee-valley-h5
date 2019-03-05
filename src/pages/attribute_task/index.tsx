import Taro, {
  Component
} from '@tarojs/taro'
import {
  View,
  Button,
  Image
} from '@tarojs/components'
import {
  fetchWork,
  downloadWorkFile,
  checkDveice,
  getAttribute,
  cancelWork,
  submitWork
} from '../../utils/beevalley'
import NavBar from '../../components/navBar/index'
import AttributeSelect from '../../components/attributeSelector/index'
import i18next from '../../i18n'
import './index.scss'

export default class attributeTask extends Component {
  constructor(props){
    super(props);
    this.state = {
      currentWork: {},
      isShowModal: false
    };
    this.work = [];
  }

  componentDidMount = () => {
    this.apiToken = Taro.getStorageSync('apiToken');
    this.packageId = this.$router.params.packageId;
    let res = Taro.getSystemInfoSync()
    this.isMobile = checkDveice(res)
    this.nextWork();
  }

  nextWork = () => {
    Taro.showLoading({
      title: `${i18next.t('Loadingin')}...`
    })
    this.index = 0;
    if(this.work.length === 0) {
      this.fetchWork();
    }else{
      let currentWork = this.work.pop();
      let work = {};
      work.id = currentWork.id;
      work.price = currentWork.price;
      work.details = currentWork.details;
      work.expiredAt = currentWork.expiredAt;
      work.attributes = currentWork.meta.attributes;
      work.category = currentWork.meta.category;
      work.description = currentWork.description;
      work.meta = currentWork.meta;
      this.downLoadImg(work);
    }

    Taro.hideLoading();
  }

  fetchWork = () => {
    fetchWork(this.apiToken, 'attribute', 1, this.packageId).then(res => {
      if(res.length === 0){
        Taro.hideLoading();
        Taro.showModal({
          title: i18next.t('Tips'),
          content: i18next.t('notask'),
          showCancel: false,
          confirmText: i18next.t('Gotit'),
          success: function () {
            Taro.navigateBack({
              delta: 1
            })
          }
        })
      }else{
        this.work = res;
        this.nextWork();
      }
    }).catch(this.defaultErrorHandling)
  }

  downLoadImg = (work) => {
    if(work.id){
      downloadWorkFile(this.apiToken, work.id, false).then(res => {
        let imgBase64 = 'data:image/jpeg;base64,' + Taro.arrayBufferToBase64(new Uint8Array(res));
        work.src = imgBase64;
        this.getSelect(work);
      }).catch(this.defaultErrorHandling)
    }
  }

  defaultErrorHandling = (error) => {
    Taro.hideLoading()
    if (error === 'forbidden') {
      Taro.navigateBack({
        delta: 1
      })
    } else {
      Taro.showToast({
        title: `${error}`,
        mask: true
      })
    }
  }

  getSelect = (work) => {
    if (this.index === work.attributes.length) {
      this.setState({
        currentWork: work
      })
    } else {
      if (work.attributes[this.index].dependency) {
        work.attributes[this.index].dataArray = [];
        work.attributes[this.index].indexArray = 0;
        work.attributes[this.index].isShowList = false;
        this.index++;
        this.getSelect(work);
      } else {
        getAttribute(this.apiToken, work.category, work.attributes[this.index].attr, false).then(res => {
            work.attributes[this.index].dataArray = JSON.parse(res);
            work.attributes[this.index].indexArray = 0;
            work.attributes[this.index].isShowList = false;
            work.value = '';
            this.index++;
            this.getSelect(work);
        }).catch(this.defaultErrorHandling)
      }
      // let id = work.attributes[this.index].dependency ? work.attributes.find((v) => v.attr === work.attributes[this.index].dependency).dataArray[0].id : false;
    }
  }

  getSelectList = (index, value, id, attr, dependency, itemIndex) => {
    let { currentWork } = this.state;
    currentWork.attributes[itemIndex].indexArray = index;
    currentWork.attributes[itemIndex].value = value;
    currentWork.attributes[itemIndex].isShowList = false;
    this.setState({
      currentWork: currentWork
    })

    if (!dependency) {

      let attrs = currentWork.attributes.find((v) => v.dependency === attr).attr;

      getAttribute(this.apiToken, currentWork.category, attrs, id).then(res => {
        currentWork.attributes.forEach((v, indexs) => {
          if (v.dependency === attr) {
            currentWork.attributes[indexs].dataArray = JSON.parse(res);
            currentWork.attributes[indexs].indexArray = 0;
            currentWork.attributes[indexs].value = '';
            this.setState({
              currentWork: currentWork
            })
          }
        })
      })
    }
  }

  changeShow = (index) => {
    let { currentWork } = this.state;
    currentWork.attributes.forEach((v, indexs) => {
      if (index === indexs) {
        v.isShowList = true;
      } else {
        v.isShowList = false;
      }
    })
    this.setState({
      currentWork: currentWork
    })
  }

  cancelWork = () => {
    let { currentWork } = this.state;

    cancelWork(this.apiToken, [currentWork.id]).then(() => {
      this.closeModal()
      this.nextWork()
    }).catch(this.defaultErrorHandling)
  }

  closeModal = () => {
    let { isShowModal } = this.state;
    this.setState({
      isShowModal: false
    })
  }

  openModal = () => {
    let { isShowModal } = this.state;
    this.setState({
      isShowModal: true
    })
  }

  submitWork = () => {
    let { currentWork } = this.state;
    let result = [];
    currentWork.attributes.forEach((item) => {
      if (item.value) {
        result.push({
          attr: item.attr,
          value: item.dataArray[item.indexArray].value
        })
      }
    })

    if (result.length === currentWork.attributes.length){
      submitWork(this.apiToken, currentWork.id, result).then(() => {
        this.closeModal()
        this.nextWork()
      }).catch(this.defaultErrorHandling)

    }else{
      Taro.showModal({
        title: i18next.t('Tips'),
        content: i18next.t('Targetattribute'),
        showCancel: false,
        confirmText: i18next.t('Gotit')
      })
    }



  }


  render(){

    let { currentWork, isShowModal } = this.state;

    let isMobile = this.isMobile ? (currentWork && currentWork.src &&
      <Image src={currentWork.src} mode='widthFix' style='width:100%'></Image>
    ) : (
        currentWork && currentWork.src && (
          <Image src={currentWork.src} mode='widthFix' style={`width:${currentWork.meta.imageWidth}PX;height:${currentWork.meta.imageHeight}PX;`}></Image>
        )
    );

    let selects = currentWork.attributes ? currentWork.attributes.map((item, index) => {
      return (
        <AttributeSelect changeShow={this.changeShow} selectdata={item} itemIndex={index} dealSelect={this.getSelectList} key={index}></AttributeSelect>
      )
    })
    : null ;

    return (
      <View className='attribute_task'>
        <NavBar title={i18next.t('Attributetask')} />
        <View className='imgItem' id='workearea'>
          {isMobile}
          <View className='workImg'></View>
        </View>
        <View className='btnItem'>
          <Button type='primary' onClick={this.openModal}>{i18next.t('Targetattribute')}</Button>
          <Button type='warn' onClick={this.cancelWork}>{i18next.t('Give')}</Button>
        </View>
        {isShowModal && (
          <View className='useSelector'>
            <View className='useSelectorWrap'>
              {selects}
              <View className='footer'>
                <View className='btn' onClick={this.submitWork}>{i18next.t('sure')}</View>
                <View className='btn' onClick={this.closeModal}>{i18next.t('cancel')}</View>
              </View>
            </View>
          </View>
        )}
      </View>
    )
  }
}
