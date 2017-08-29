//index.js
//获取应用实例
var app = getApp()
var common = require("../../utils/common.js");
var constant = require("../../utils/constant.js");
var bluetoochUtil = require("../../utils/bluetoochUtil.js");
bluetoolthEdit();
//存储d0 d1 d2数据
var d0Data;
//存储 b0 b1  b2 数据
var b0data;
var resData = '';   // 刷卡数据  
//当前权限选择索引
var pickerindex;
var myThat;
Page({
  data: {
    //蓝牙对象-----开始
    deviceId: '',
    name: '',
    //蓝牙对象--结束
    myButtonConn: '刷  卡',
    top_content: '云梯控',
    user_get_res: '获取权限',
    //用户输入的手机号
    userPhonennumber: '',
    //查询到的权限
    industryArray: [],

    //存储蓝牙设备
    list: [],
    userInfo: {}
  },
  onShareAppMessage: function (res) {
    wx.showShareMenu({
      withShareTicket: true
    })
  },
  //文本框内容改变
  bindUserPhoneChange: function (e) {
    //获取内容进行设置
    this.setData({
      userPhonennumber: e.detail.value
    })
  },
  getResNum: function (e) {
    console.log("industryArray  length:" + this.industryArray);
    if (null == this.industryArray) {
      wx.showToast({
        icon: 'loading',
        title: '请先获取权限',
        image: "../../resource/image/warn.png"

      })
    }
  },
  //选择权限回调
  bindResChange: function (e) {
    var that = this
    //选中的val的索引
    var i = e.detail.value;
    //当前选择索引
    pickerindex = i;
    try {
      var value = wx.getStorageSync('industryData')
      if (value) {
        resData = value[i][1]

      }
    } catch (e) {
      // Do something when catch error
    }

  },
  //点击获取权限按钮事件
  btnGetRes: function () {

    var that = this
    var phoneNumber = this.data.userPhonennumber;


    //获取输入的手机号并检验
    if ("" == phoneNumber) {
      console.log("输入为null");
      wx.showToast({
        icon: 'loading',
        title: '请输入手机号',
        image: "../../resource/image/warn.png"
      })
      return;
    }
    //验证手机号正则表达式
    if (phoneNumber.length != 11) {
      wx.showToast({
        icon: 'loading',
        title: '请输入正确的手机号',
        image: "../../resource/image/warn.png"
      })
    }
    wx.showToast({
      icon: 'loading',
      title: '获取权限中'
    })
    //根据手机号访问网络获取权限
    wx.request({
      url: 'https://www.sycalid.cn/api/getKeyByPhoneNum.do',//上线的话必须是https，没有appId的本地请求貌似不受影响  
      data: { t_touristPhone: phoneNumber },
      method: 'POST',
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        var myresData = common.myresDataEdit(res.data.data)
        //从缓存中获取权限
        var pickerArray = new Array()
        console.log("cccc:" + res);
        try {
          var value = wx.getStorageSync('industryData')
          if (value.length > 0) {
            for (var i = 0; i < value.length; i++) {
              pickerArray[i] = value[i][0]
            }
            // //更新数据
            that.setData({
              industryArray: pickerArray
            });
          }
        } catch (e) {
          // Do something when catch error
        }


      },
      fail: function (res) {
        console.log("get error" + res.data.msg)
        // fail  
      },
      complete: function (res) {
        //判断状态码是否获取成功
        if (res.data.status == 314) {
          //未获取到权限
          wx.showToast({
            icon: 'success',
            title: res.data.msg,
            image: "../../resource/image/warn.png"
          })
        } else if (res.data.status == 200) {
          //获取权限成功
          wx.showToast({
            icon: 'success',
            title: res.data.msg
          })
        }else{
          //其他错误
          wx.showToast({
            title: res.data.msg,
            image: "../../resource/image/warn.png"
          })
        }

        console.log("get complete" + res.data.status);
        // complete  
      }
    })

  },

  //事件处理函数
  bindViewTap: function () {
    console.log("bindViewTap");
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  connBlueTootch: function () {
    //链接蓝牙
    console.log("链接蓝牙就绪..");
  },

  //事件处理函数
  btnConn: function (e) {
    //判断resData是否为空
    bluetoolthEdit();
    if (resData == '' || resData.length < 100) {
      wx.showToast({
        icon: 'loading',
        title: '点击右上角+号选择权限',
        image: "../../resource/image/warn.png"
      })
      return;
    }
    var that = this;
    myThat = this;
    try {
      var value = wx.getStorageSync('layaID')
      if (value) {
        console.log('地址' + value)
        that.setData({
          deviceId: value
        })
      } else {
        console.log("没有连接过,进行查找连接")
      }
    } catch (e) {
      // Do something when catch error
    }


    if (that.data.deviceId.length > 10) { //有存储的地址 时
      console.log('连接蓝牙 ------------------------直接连接')
      bluetoolthlianjie(); //连接蓝牙


    } else {      //没有存储的地址 要去搜索
      var myDate = new Date();
      bluetoolthScanning();
      console.log("开始时间" + myDate.getMinutes() + "--" + myDate.getSeconds());
      setTimeout(function () {
        myDate = new Date();
        console.log("结束时间:" + myDate.getMinutes() + "--" + myDate.getSeconds());
        wx.getBluetoothDevices({    //获取所有已发现的蓝牙设备
          success: function (res) {
            console.log("getBluetoothDevices suc " + res.devices.length);
            // success
            //{devices: Array[11], errMsg: "getBluetoothDevices:ok"}
            for (var i = 0; i < res.devices.length; i++) {
              console.log("名称" + "  name:" + res.devices[i].name + "截取的名称 :" + res.devices[i].name.substr(0, 5) + '长度' + res.devices[i].name.length + '地址 :' + res.devices[i].deviceId);
              if (res.devices[i].name.substr(0, 5) == 'CALID' && res.devices[i].name.length > 10) {
                that.setData({
                  deviceId: res.devices[i].deviceId
                })
                try {     //蓝牙地址存储
                  wx.setStorageSync('layaID', res.devices[i].deviceId)
                } catch (e) {
                }
                console.log("找到了CALID :" + res.devices[i].deviceId);
                //停止扫描
                wx.stopBluetoothDevicesDiscovery({
                  success: function (res) {
                    console.log(res)
                  }
                })
                /**
                 * 连接设备
                 */
                bluetoolthlianjie();

                //找到设备后进行链接
                break;
              }
            }
            // console.log(res);
            // console.log("  name:" + res.devices.name);
          },
          fail: function (res) {
            console.log("查找蓝牙失败")
          },
          complete: function (res) {
            console.log("查找蓝牙完成")
          }
        })
      }, 1500);
    }   //没地址 搜索 结束括号

  },

  onLoad: function () {
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
  }


})
/**
 * 蓝牙适配器初始化
 */
function bluetoolthEdit() {

  wx.openBluetoothAdapter({     //  蓝牙 适配器 初始化
    success: function (res) {
      // success
      console.log("----适配器- 设置----------");
    },
    fail: function (res) {
      // fail
      console.log("适配器配置失败 :" + res);
      //判断是否开启了蓝牙
      if (res.errMsg = '10001') {
        wx.showToast({
          icon: 'success',
          title: '请开启您的蓝牙!',
          image: "../../resource/image/warn.png",
          duration: 1000

        })
      }
    },
    complete: function (res) {
      // complete
      console.log("适配器配置完成 :" + res);
    }
  })


}
/**
 * 蓝牙适扫描蓝牙
 */
function bluetoolthScanning() {



  wx.startBluetoothDevicesDiscovery({     //搜索蓝牙
    services: [],
    success: function (res) {
      // success
      console.log("-----搜索蓝牙--成功----------");
    },
    fail: function (res) {
      // fail
      console.log("搜索蓝牙失败 :" + res);
    },
    complete: function (res) {
      // complete
      console.log("搜索蓝牙完成" + res);
    }
  })

}

/**
 * 蓝牙连接
 */
function bluetoolthlianjie() {

  var deviceId = ''
  var serviceId = ''
  var lanyaWrite = ''
  var lanyaRead = ''
  d0Data = '';
  b0data = '';
  try {
    var value = wx.getStorageSync('layaID')
    if (value) {
      console.log('地址' + value)
      deviceId = value
    }
  } catch (e) {
    // Do something when catch error
  }

  wx.createBLEConnection({
    deviceId: deviceId,
    success: function (res) {
      // success
      console.log("连接蓝牙 -获取服务:" + res);
      /**
       * 连接成功，后开始获取设备的服务列表
       */
      wx.showToast({
        icon: 'loading',
        title: '正在连接'
      })
      wx.getBLEDeviceServices({   // 获取蓝牙 所有服务
        // 这里的 deviceId 需要在上面的 getBluetoothDevices中获取
        deviceId: deviceId,
        success: function (res) {
          for (var c = 0; c < res.services.length; c++) {
            console.log("查找到的服务:" + res.services[c].uuid)
            if (res.services[c].uuid.toUpperCase().indexOf("FFF0") > 3) {

              //获取到服务id
              serviceId = res.services[c].uuid;
              break;
            }
          }
          console.log('查找的服务 :', serviceId)

          try {     //蓝牙服务ID存储
            wx.setStorageSync('lanyaserviceId', serviceId)
          } catch (e) {
          }
          console.log('--------------------------------------');
          console.log('device设备的id:', deviceId);
          console.log('device设备的服务id:', serviceId);
          /**
           * 延迟3秒，根据服务获取特征 
           */
          setTimeout(function () {
            wx.getBLEDeviceCharacteristics({
              // 这里的 deviceId 需要在上面的 getBluetoothDevices
              deviceId: deviceId,
              // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
              serviceId: serviceId,
              success: function (res) {
                console.log('获取到的 蓝牙服务特征  :' + res.characteristics + "长度 :" + res.characteristics.length)
                for (var i = 0; i < res.characteristics.length; i++) {
                  var fuwuStr = res.characteristics[i].uuid.substr(4, 4);
                  console.log("--------------->" + fuwuStr);
                  //写特性
                  if (fuwuStr.toUpperCase() == 'FFF6') {

                    lanyaWrite = res.characteristics[i].uuid

                    try {     //蓝牙写标识
                      console.log("-------写-------->" + fuwuStr),
                        wx.setStorageSync('lanyaWrite', res.characteristics[i].uuid)
                    } catch (e) {
                    }
                  }
                  //读特性
                  if (fuwuStr.toUpperCase() == 'FFF7') {

                    lanyaRead = res.characteristics[i].uuid

                    try {     //蓝牙读标识
                      console.log("-------读-------->" + fuwuStr),
                        wx.setStorageSync('lanyaRead', res.characteristics[i].uuid)
                    } catch (e) {
                    }
                  }

                }

                var shuaka = "0180010101FF334455660000000000000000000000000000000000000000000000000000000000000000"
                var str = bluetoochUtil.writeOneBlueTootch(shuaka)
                str = 'cc' + str
                console.log('jiami    : ' + str)

                bluetoolthWrite(str);  //写入    'AA5504B10000B5'

                /**
                  * 回调获取 设备发过来的数据
                  */
                wx.onBLECharacteristicValueChange(function (characteristic) {
                  console.log('characteristic value comed:', characteristic.value)
                  const result = characteristic.value;
                  const hex = buf2hex(result);
                  //判断头是d还是b 例如:d0 d1 d2  b0 b1 b2
                  var strDataHead = hex.substring(0, 2);
                  //解析D系列数据
                  if (strDataHead.indexOf('d') > -1) {
                    //去掉d0 d1 d2
                    if (strDataHead == 'd2') {
                      d0Data += hex.substr(2, 16);
                    } else {
                      //解析 d0 d1
                      d0Data += hex.substring(2, hex.length);
                    }
                    console.log("d系列数据长度:" + d0Data.length + "     数据:" + d0Data);
                    //判断是否接受完成
                    if (d0Data.length == 92) {
                      //接收完毕进行解密
                      var readstr = bluetoochUtil.readOneDataDecrypted(d0Data);
                      console.log("开始解密 :" + readstr + '      resData    :' + resData.length)
                      console.log("111111111     :" + resData.substring(0, 104) + '      222222222    :' + resData.substring(104, resData.length))
                      var resOnestr = bluetoochUtil.resdataEncryption(resData.substring(0, 104), readstr);
                      console.log("resOnestr  数据 :" + resOnestr + '      resOnestr长度    :' + resOnestr.length)
                      var resTowstr = bluetoochUtil.resdataEncryption(resData.substring(104, resData.length), readstr);
                      console.log("resTowstr  数据 :" + resTowstr + '      resTowstr长度    :' + resTowstr.length)
                      resOnestr = 'aa' + resOnestr + resTowstr
                      console.log("刷卡第二段  数据 :" + resOnestr + '      刷卡第二段数据长度    :' + resOnestr.length)
                      bluetoolthWrite(resOnestr);  //写入    'AA5504B10000B5'


                    }
                  }
                  console.log('读取   :' + hex);

                })

                /**
                                     * 顺序开发设备特征notifiy
                                     */
                wx.notifyBLECharacteristicValueChanged({
                  deviceId: deviceId,
                  serviceId: serviceId,
                  characteristicId: lanyaRead,
                  state: true,
                  success: function (res) {
                    // success
                    console.log('notifyBLECharacteristicValueChanged success', res);
                  },
                  fail: function (res) {
                    // fail
                  },
                  complete: function (res) {
                    // complete
                  }
                })
                wx.notifyBLECharacteristicValueChanged({
                  deviceId: deviceId,
                  serviceId: serviceId,
                  characteristicId: lanyaRead,
                  state: true,
                  success: function (res) {
                    // success
                    console.log('notifyBLECharacteristicValueChanged success', res);
                  },
                  fail: function (res) {
                    // fail
                  },
                  complete: function (res) {
                    // complete
                  }
                })
                wx.notifyBLECharacteristicValueChanged({
                  deviceId: deviceId,
                  serviceId: serviceId,
                  characteristicId: lanyaRead,
                  state: true,
                  success: function (res) {
                    // success
                    console.log('notifyBLECharacteristicValueChanged success', res);
                  },
                  fail: function (res) {
                    // fail
                  },
                  complete: function (res) {
                    // complete
                  }
                })

                wx.notifyBLECharacteristicValueChanged({
                  // 启用 notify 功能
                  // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
                  deviceId: deviceId,
                  serviceId: serviceId,
                  characteristicId: lanyaRead,
                  state: true,
                  success: function (res) {
                    console.log('notifyBLECharacteristicValueChanged success', res)
                  }
                })




                console.log('读取参数 :', deviceId + '    ' + serviceId + '   ' + lanyaRead)

                // wx.readBLECharacteristicValue({
                //   // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
                //   deviceId: deviceId,
                //   // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
                //   serviceId: serviceId,
                //   // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
                //   characteristicId: lanyaRead,
                //   success: function (res) {
                //     console.log('接收蓝牙发送过来的数据 :', res.characteristic.value)
                //   },
                //   fail: function (res) {
                //     console.log('接收蓝牙的数据 失败 :' + res.errMsg);
                //   },
                //   complete: function (res) {
                //     console.log('接收蓝牙的数据 完成 :' + res);
                //   }
                // })




              }, fail: function (res) {
                console.log("error: " + res);
              }
            })
          }
            , 1500);
        }
      })
    },
    fail: function (res) {
      console.log("连接蓝牙失败" + res.errMsg);
    },
    complete: function (res) {
      console.log("连接蓝牙完成" + res);
    }
  })
}




//  蓝牙 写数据
function bluetoolthWrite(strData) {
  var deviceId = ''
  var serviceId = ''
  var characteristicId = ''
  console.log("strData :" + strData.length)
  var strHead = ''
  var datalength = 1
  var jiequlength = 38
  try {
    var value = wx.getStorageSync('layaID')
    if (value) {
      console.log('写地址' + value)
      deviceId = value
    }
  } catch (e) {
    // Do something when catch error
  }

  try {
    var value = wx.getStorageSync('lanyaserviceId')
    if (value) {
      console.log('写服务' + value)

      serviceId = value

    }
  } catch (e) {
    // Do something when catch error
  }
  try {
    var value = wx.getStorageSync('lanyaWrite')
    if (value) {
      console.log('写标识' + value)

      characteristicId = value

    }
  } catch (e) {
    // Do something when catch error
  }


  // 这里的回调可以获取到 write 导致的特征值改变
  wx.onBLECharacteristicValueChange(function (characteristic) {
    const result = characteristic.value;
    const hex = buf2hex(result);
    console.log('characteristic value changed 222 :', hex)

    var strDataHead = hex.substring(0, 2);
    //解析D系列数据
    if (strDataHead.indexOf('b') > -1) {
      //去掉 b0  b1  b2 
      if (strDataHead == 'b2') {
        b0data += hex.substr(2, 30);
      } else {
        //解析 d0 d1
        b0data += hex.substring(2, hex.length);
      }
      //判断是否接受完成
      if (b0data.length == 106) {
        var tishi = bluetoochUtil.turnTheHexLiterals(b0data.substr(b0data.length - 2, 2))
        tishi = common.lanyaShuakareturnPromptActioninteger(tishi)
        //删除次数
        if (tishi == '正常进入') {
          //刷卡数据清空
          resData = '';
          //删除使用次数
          common.cardSuccessHandle(pickerindex);
          //重新赋值
          try {
            var value = wx.getStorageSync('industryData')
            var pickerArray = [];
            if (value.length > 0) {
              for (var i = 0; i < value.length; i++) {
                pickerArray[i] = value[i][0]

              }

              // //更新数据

            }
            myThat.setData({
              industryArray: pickerArray
            });

          } catch (e) {
            // Do something when catch error
          }

        }
        wx.showToast({
          title: tishi
        })



        wx.closeBLEConnection({
          deviceId: deviceId,
          success: function (res) {
            console.log("断开蓝牙 成功" + res.errMsg);
          }, fail: function (res) {
            console.log("断开蓝牙失败" + res.errMsg);
          },
          complete: function (res) {
            console.log("断开蓝牙完成" + res);
          }
        })

      }
    }


  })

  if (strData.length > 38) {     // 长度 大于 20  拆分成  20 字节循环发送  否则 直接发送

    datalength = ((strData.length - 2) / 2) % 19;


    if (datalength > 0) {
      datalength = Math.floor(((strData.length - 2) / 2) / 19 + 1)

    } else {
      datalength = Math.floor(((strData.length - 2) / 2) / 19)
    }
    var commandStr = strData.substr(2, strData.length - 2);

    //创建写入队列
    var writeQueue = [];
    for (var aa = 0; aa < datalength; aa++) {
      if (strData.substr(0, 2) == 'cc') {
        strHead = 'c'
      } else {
        strHead = 'a'
      }

      if (aa == datalength - 1)
        jiequlength = commandStr.length - aa * 38;
      strHead = strHead + aa + commandStr.substr(aa * 38, jiequlength)

      writeQueue.push(strHead);

    }
    //队列写入
    quenWrite(writeQueue, deviceId, serviceId, characteristicId);


  } else {    //    直接发送数据
    var hex = strData
    var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16)
    }))

    var buffer1 = typedArray.buffer

    wx.writeBLECharacteristicValue({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
      deviceId: deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: serviceId,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      characteristicId: characteristicId,
      // 这里的value是ArrayBuffer类型
      value: buffer1,
      success: function (res) {
        console.log('writeBLECharacteristicValue success', res.errMsg)
      },
      fail: function (res) {
        // fail
        console.log('写数据失败:' + res.errMsg);
      },
      complete: function (res) {
        // complete
        console.log('写数据完成 :' + res);
      }
    })
  }


}

function buf2hex(buffer) { // buffer is an ArrayBuffer
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}


function quenWrite(writeQueue, deviceId, serviceId, characteristicId) {

  var hex = writeQueue[0];
  var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16)
  }))

  var buffer1 = typedArray.buffer
  wx.writeBLECharacteristicValue({
    // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
    deviceId: deviceId,
    // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
    serviceId: serviceId,
    // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
    characteristicId: characteristicId,
    // 这里的value是ArrayBuffer类型
    value: buffer1,
    success: function (res) {
      console.log('写数据 成功 ', res.errMsg)
      writeQueue.shift();

    },
    fail: function (res) {
      // fail
      console.log('写数据失败 :' + res.toString());
    },
    complete: function (res) {
      // complete

      if (writeQueue.length > 0)
        quenWrite(writeQueue, deviceId, serviceId, characteristicId)
    }
  })
}


