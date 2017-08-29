//暴漏接口 供调用人员使用
module.exports = {
  myresDataEdit: myresDataEdit,
  lanyaShuakareturnPromptActioninteger: lanyaShuakareturnPromptActioninteger,
  cardSuccessHandle: cardSuccessHandle
}
function myresDataEdit(infodata) {
  var industryArray = new Array()
  //var infoArray = new Array()

  for (var i = 0; i < infodata.length; i++) {
      var infoArray = new Array()
      infoArray[0] = infodata[i].t_owner_Note,
      infoArray[1] = infodata[i].res,
      infoArray[2] = '3',
      industryArray[i] = infoArray

  }
  try {     //蓝牙 权限
    wx.setStorageSync('industryData', industryArray)
  } catch (e) {
  }


}

//刷卡成功进行次数减一
//@param index 传递的当前索引
function cardSuccessHandle(index){
  console.error("当前index:" + index)
  

  try {
    //获取存储的蓝牙权限
    var value = wx.getStorageSync('industryData');
    if (value) {
      //获取当前权限可用的次数
      var useNum = parseInt(value[index][2]) - 1;
      if (useNum <= 0) {
        //删除整条数据
        value.splice(index, 1)
      } else {
        //减一
        value[index][2] = parseInt(value[index][2]) - 1;
      }
    }
    //再次存储
    wx.setStorageSync('industryData', value)
  } catch (e) {
    // Do something when catch error
  }

}



//  刷卡数据返回  错误 报告
function lanyaShuakareturnPromptActioninteger(promptInteger) {

  switch (promptInteger) {
    case 0x2b:
      return "循环用的EEPROM读写出现致命错误!"
      break;
    case 0x34:
      return "在设置卡上发现的UID卡!"
      break;
    case 0x2c:
      return "CRC错误或老卡变新卡时错误!"
      break;
    case 0x24:
      return "被复制或写附属地址出错!"
      break;
    case 0x04:
      return "卡被复制!"
      break;
    case 0x2a:
      return "在用户卡上发现的UID!"
      break;
    case 0x30:
      return "防潜返,已经是进入或出去!"
      break;
    case 0x1a:
      return "减次数为0!"
      break;
    case 0x1b:
      return "减次数为0!"
      break;
    case 0x05:
      return "滚动码处理出错!"
      break;
    case 0x1f:
      return "第一次被顶掉!"
      break;
    case 0x22:
      return "没有通讯上!"
      break;
    case 0x23:
      return "测试卡处理!"
      break;
    case 0x0d:
      return "地址不对!"
      break;
    case 0x20:
      return "成功,权限所剩不多!"
      break;
    case 0x0f:
      return "准时段可进入!"
      break;
    case 0x35:
    case 0x36:
    case 0x2e:
    case 0x37:
    case 0x38:
    case 0x21:
    case 0x2f:
    case 0x39:
    case 0x3a:
      return "正常进入"
      break;
    case 0x11:
      return "权限过期!"
      break;
    default:
      return "出现异常错误！"
      break;
  }
}


