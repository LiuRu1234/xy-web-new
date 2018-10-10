/**
 * Created by bll on 2017/11/13.
 */
import request from './request';
import { XY_API } from '@config/constants';
import { notification } from 'antd';
import {LOGIN_ID, TOKEN} from '../config/constants';


/**
 * 存储当前的项目id，文件夹id
 */
 export function savePidDid(pid, did) {
   localStorage.setItem('_xy_pid', pid);
   localStorage.setItem('_xy_did', did);
 }

 /**
  * 获取当前项目ID，文件夹id
  */
 export function getPidDid() {
  const project_id = localStorage.getItem('_xy_pid') || 0;
  const doc_id = localStorage.getItem('_xy_did') || 0;
  return { project_id, doc_id: parseInt(doc_id) };
}

/**
 * 存储当前文件id
 */
export function saveFid(fid) {
  localStorage.setItem('_xy_fid', fid);
}

/**
 * 获取当前文件id
 */
export function getFid() {
  const file_id = localStorage.getItem('_xy_fid') || 0;
  return file_id;
}

/**
 * 获取对比文件id
 */
export function saveCid(cid) {
  localStorage.setItem('_xy_cid', cid);
}

/**
 * 获取对比文件id
 */
export function getCid() {
  const version_id = localStorage.getItem('_xy_cid') || 0;
  return version_id;
}


/**
 * 存储本地用户信息头像，名称等
 */
export function saveUser(realname, avatar, avatarBg) {
  localStorage.setItem('_xy_realname', realname);
  localStorage.setItem('_xy_avatar', avatar);
  localStorage.setItem('_xy_avatarBg', avatarBg);
}

/**
 * 获取本地用户信息头像，名称等
 */
export function getUser() {
  const realname = localStorage.getItem('_xy_realname') || '';
  const avatar = localStorage.getItem('_xy_avatar') || '';
  const avatarBg = localStorage.getItem('_xy_avatarBg') || '';
  return {realname, avatar, avatarBg};
}


/**
 * 请求数据序列化
 * @param  {object} [values]  参数对象
 * @return {string}          返回序列化参数
 */
export function serialize(values){
  let serializeStr = '';
  for(let k in values) {
    serializeStr += `${k}=${values[k]}&`;
  }
  return  serializeStr;
}

/**
 * 获取url参数 （hash url）
 * @param {string} name  将要获取的参数名称
 */
export function getQuery(name){
  let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  let hash = window.location.hash;
  let search = hash.substr(hash.indexOf('?'));
  let r = search.substr(1).match(reg);
  if (r != null) {
    return unescape(r[2]);
  }
  return null;
}

/**
 * 获取url参数 （非hash url）
 * @param {string} name  将要获取的参数名称
 */
export function getQuery2(name) {
  var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if(r!=null)return  unescape(r[2]); return null;
}

/**
 * post请求
 * @param {string} url        请求链接
 * @param {object} [values]   请求参数
 */
export function post(url, values) {
  return request(`${XY_API}${url}`, {
    method: 'POST',
    headers:{
      'Content-Type':'application/x-www-form-urlencoded'
    },
    body: serialize(values)
  });
}

/**
 * put请求
 * @param {string} url        请求链接
 * @param {object} [values]   请求参数
 */
export function put(url, values) {
  return request(`${XY_API}${url}`, {
    method: 'PUT',
    headers:{
      'Content-Type':'application/x-www-form-urlencoded'
    },
    body: serialize(values)
  });
}

/**
 * get请求
 * @param {string} url        请求链接
 * @param {object} [values]   请求参数
 */
export function get(url, values) {
  return request(`${XY_API}${url}?${serialize(values)}`, {
    method: 'GET',
    headers:{
      'Content-Type':'application/x-www-form-urlencoded'
    }
  });
}

/**
 * delete请求
 * @param {string} url        请求链接
 * @param {object} [values]   请求参数
 */
export function del(url, values) {
  return request(`${XY_API}${url}`, {
    method: 'delete',
    headers:{
      'Content-Type':'application/x-www-form-urlencoded'
    },
    body: serialize(values)
  });
}

/**
 * 根据关键字搜索
 * @param {string} text        关键字
 * @param {object} [list]      被搜索列表
 */
export function search(text, list) {
  let gl = JSON.parse(JSON.stringify(list));
  if (text== '' || gl.length == 0) return list;
  let pattern = new RegExp(text);

  let items = gl.filter ((item, key) => {

    let patternOk = false;

     for (let i in item) {
       if (pattern.test(item[i])) {
         patternOk = true;
         break;
       }
     }

     if (patternOk) {
        return item;
     }
  });
  return items;
}

/**
 * 将时间戳转为字符串
 * @param {number} nS        时间戳
 * @return {string}          返回的时间字符串
 */
export function getLocalTime(nS) {
  let timeStr = (new Date(parseInt(nS) * 1000).toLocaleString().replace(/:\d{1,2}$/,' ')).replace('上午12', '上午00');
  return timeStr;
}

/**
 * 将时间戳转为年月日
 * @param {number} nS        时间戳
 * @return {string}          返回的时间字符串
 */
export function timeInt2Str(ns) {
  var now = new Date(ns * 1000);  
  var yy = now.getFullYear();      //年
  var mm = now.getMonth() + 1;     //月
  var dd = now.getDate();          //日
  return `${yy}年${mm}月${dd}日`;
}


/**
 * 范围随机取整数
 * @param {number} lowerValue        最小值
 * @param {number} upperValue        最大值
 * @return {string}                  返回的随机数
 */
function randomFrom(lowerValue,upperValue) {
 return Math.floor(Math.random() * (upperValue - lowerValue + 1) + lowerValue);
}


/**
 * 范围随机不取整数，保留两位
 * @param {number} lowerValue        最小值
 * @param {number} upperValue        最大值
 * @return {string}                  返回的随机数
 */
function randomFrom2(lowerValue,upperValue) {
  return (Math.random() * (upperValue - lowerValue + 1) + lowerValue).toFixed(2);
}

/**
 * 将时间转为分秒
 * @param {number} time              时间（s）
 * @return {string}                  返回几分几秒
 */
export function timeToMS(time) {
    if (time < 0) return '';
    let m = parseInt(parseInt(time) / 60);
    let s = parseInt(time) % 60;
    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    return m + ':' + s;
}

/**
 * 计算多久前
 * @param {number} beforeTime         时间戳
 * @return {string}                   返回多久之前
 */
export function beforeTime(beforeTime) {
    const currentTime = Date.parse(new Date()) / 1000;
    let differenceTime = currentTime - beforeTime;

    if (differenceTime > 60 && differenceTime <= 3600) {
      //1小时内
      return parseInt(differenceTime / 60) + '分钟前';
    } else if (differenceTime > 3600 && differenceTime <= 3600 * 24) {
      //大于1小时
      return parseInt(differenceTime / 3600) + '小时前';
    } else if (differenceTime > 3600 * 24  && differenceTime <= 3600 * 24 * 30) {
      //大于1天
      return parseInt(differenceTime / (3600 * 24)) + '天前';
    } else if (differenceTime > 3600 * 24 * 30 && differenceTime <= 3600 * 24 * 30 * 365) {
      //大于1个月
      return parseInt(differenceTime / (3600 * 24 * 30)) + '月前';
    } else if (differenceTime > 3600 * 24 * 30 * 365) {
      //大于1年
      return parseInt(differenceTime / (3600 * 24 * 30 * 365)) + '年前';
    } else {
      //刚刚
      return '刚刚';
    }
}


//消息提示
const noticeTypeArgs = [
  {name: '加入了', type: 'join', status: ''},
  {name: '退出了', type: 'deleteprojectuser', status: ''},
  {name: '上传了', type: 'upload', status: ''},
  {name: '修改了', type: 'changecover', status: '封面'},
  {name: '合并了', type: 'merge', status: ''},
  {name: '删除了', type: 'deletedoc', status: '目录'},
  {name: '解除了', type: 'deleteversion', status: '版本'},
  {name: '创建了', type: 'created_doc', status: '文件夹'},
  {name: '评论了', type: 'comment', status: ''},
  {name: '修改了', type: 'change', status: '状态'},
  {name: '删除了', type: 'deletecomment', status: '评论'},
];

/**
 * 消息提示
 * @param {object} item               消息对象
 * @param {function} onClick         点击触发事件
 */
export function openNotification(item, onClick) {
  if (!item) return;
  let noticeType = noticeTypeArgs.filter(it => {
    return item.type == it.type;
  })[0];

  let message = 
  <div className="-adobe-notice-message" onClick={onClick}>
    <span>{item.realname}</span>&nbsp;{noticeType.name}&nbsp;<span>{item.content_name}</span>&nbsp;&nbsp;{noticeType.status}
  </div>;

  let icon = 
  <div className="-adobe-notice-icon">
    {item.avatar != '' ? <img src={item.avatar} alt=""/> : <span style={{background: item.avatar_background_color}}>{item.realname[0]}</span>}
  </div>;

  notification.open({
    icon,
    duration: 5,
    key: item.id,
    message
  });
}


/**
 * 开发环境打印
 * @param {any} o        时间戳
 */
export function ld(o) {
  if (process.env.NODE_ENV === 'production') {
    console.log(o);
  }
}

/**
 * 获取localstorage 的信息
 * @return {object}                   返回登录的存储信息
 */
export function getTokenLocalstorage() {
  const login_id = localStorage.getItem(LOGIN_ID);
  const token = localStorage.getItem(TOKEN);
  if (!login_id || !token || login_id == '' || token == '') return null;
  return {login_id, token};
}

/**
 * 计算文件大小
 * @return {number}                   文件大小（字节）
 */
export function size2Str(size) {
  if (size < 1024) {
     return size + 'B';
  }else if(size >= 1024 && size < Math.pow(1024, 2)){
    return parseFloat(size / 1024).toFixed(2) + 'KB';
  }else if(size >= Math.pow(1024, 2) && size < Math.pow(1024, 3)){
    return parseFloat(size / Math.pow(1024, 2)).toFixed(2) + 'MB';
  }else if(size > Math.pow(1024, 3)){
    return parseFloat(size / Math.pow(1024, 3)).toFixed(2) + 'GB';
  }else {
    return 0 + 'B';
  }
}

 /**
   * Format time into 'hh:mm:ss:SS'
   *
   * @static
   * @param {number} [seconds=0]
   * @returns {string}
   * @memberof Format
   */
export function formatTimecode (seconds) {
    const safeSeconds = Number(seconds);
    if (isNaN(safeSeconds)) {
      return seconds;
    }

    const msec = ('00' + Math.floor(safeSeconds * 100 % 100)).substr(-2);
    const sec = ('00' + Math.floor(safeSeconds % 60)).substr(-2);
    const min = ('00' + Math.floor(safeSeconds / 60 % 60)).substr(-2);
    const hour = ('00' + Math.floor(safeSeconds / 3600 % 60)).substr(-2);

    return `${hour}:${min}:${sec}:${msec}`;
}


 /**
   * 触发事件
   * @param {object} [n]       触发节点
   * @param {string} [event]      触发事件
   */
export function trigger(n, event) {
    const eo= new window.MouseEvent(event);
    n.dispatchEvent(eo);
}

/**
 * 字符串转为时间戳
 * @param {string} [timestr]      事件字符串
 */
 export function ts2Ti(timestr) {
  let date = timestr.substring(0,19);    
  date = date.replace(/-/g,'/'); 
  return new Date(date).getTime() / 1000;
 } 

/**
 *对Date的扩展，将 Date 转化为指定格式的String
 *月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
 *年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 *例子：
 *(new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
 *(new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
 */
Date.prototype.format = function (fmt) {
  let o = {
      "M+": this.getMonth() + 1, //月份
      "d+": this.getDate(), //日
      "h+": this.getHours(), //小时
      "m+": this.getMinutes(), //分
      "s+": this.getSeconds(), //秒
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度
      "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
};

/**
 * 根据某个字段排序
 * @param {string} [name]      字段名
 * @param {string} [minor]      callback
 */
export function sortBy(name,minor){
  return function(o,p){
    let a,b;
    if(o && p && typeof o === 'object' && typeof p ==='object'){
      a = o[name];
      b = p[name];
      if(a === b){
        return typeof minor === 'function' ? minor(o,p):0;
      }
      if(typeof a === typeof b){
        return a < b ? -1:1;
      }
      return typeof a < typeof b ? -1 : 1;
    }else{
      thro("error");
    }
  };
}

// 检测是否大于IE10
export function overIEAllow() {
	// alert(!!window.ActiveXObject || "ActiveXObject" in window);
	// alert(navigator.userAgent);
	// alert(navigator.appVersion);
	// alert(navigator.appName == "Microsoft Internet Explorer"&&parseInt(navigator.appVersion.split(";")[1].replace(/[ ]/g, "").replace("MSIE",""))<10);
	// alert(parseInt(navigator.appVersion.split(";")[1].replace(/[ ]/g, "").replace("MSIE","")))
	// if(!!window.ActiveXObject || "ActiveXObject" in window){
	// 	var b_version=navigator.appVersion;
	//  var version=b_version.split(";"); 

	// 	var trim_Version = parseInt(version[1].replace(/[ ]/g, "").replace(/MSIE/g, ""));
	// 	alert(111);
	// 	message.config({
	// 		top: 10,
	// 		duration: 3,
	// 	});
	// 	message.warning('为了更好的交互体验，推荐使用市面上主流浏览器进行操作（谷歌，火狐等）');
	// }

	if(navigator.appName == "Microsoft Internet Explorer" && parseInt(navigator.appVersion.split(";")[1].replace(/[ ]/g, "").replace("MSIE","")) < 11) {
		return false;
	} else {
		return true;
	}
}

//判断是否为IE
export function isIE() {
	return (!!window.ActiveXObject || "ActiveXObject" in window) ? true : false;
}

/**
 * base64加解密
 */
export function Base64() { 

    // private method for UTF-8 encoding 
    let _utf8_encode = function (string) { 
      string = string.replace(/\r\n/g,"\n"); 
      let utftext = ""; 
      for (var n = 0; n < string.length; n++) { 
       let c = string.charCodeAt(n); 
       if (c < 128) { 
        utftext += String.fromCharCode(c); 
       } else if((c > 127) && (c < 2048)) { 
        utftext += String.fromCharCode((c >> 6) | 192); 
        utftext += String.fromCharCode((c & 63) | 128); 
       } else { 
        utftext += String.fromCharCode((c >> 12) | 224); 
        utftext += String.fromCharCode(((c >> 6) & 63) | 128); 
        utftext += String.fromCharCode((c & 63) | 128); 
       } 
      
      } 
      return utftext; 
     }; 

       // private method for UTF-8 decoding 

  let _utf8_decode = function (utftext) { 
    let string = "", c1, c2; 
    let i = 0; 
    let c = c1 = c2 = 0; 
    while ( i < utftext.length ) { 
     c = utftext.charCodeAt(i); 
     if (c < 128) { 
      string += String.fromCharCode(c); 
      i++; 
     } else if((c > 191) && (c < 224)) { 
      c2 = utftext.charCodeAt(i+1); 
      string += String.fromCharCode(((c & 31) << 6) | (c2 & 63)); 
      i += 2; 
     } else { 
      c2 = utftext.charCodeAt(i+1); 
      c3 = utftext.charCodeAt(i+2); 
      string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)); 
      i += 3; 
     } 
    } 
    return string; 
   }; 
  
  // private property 
  let _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="; 
   
  // public method for encoding 
  this.encode = function (input) { 
   let output = ""; 
   let chr1, chr2, chr3, enc1, enc2, enc3, enc4; 
   let i = 0; 
   input = _utf8_encode(input); 
   while (i < input.length) { 
    chr1 = input.charCodeAt(i++); 
    chr2 = input.charCodeAt(i++); 
    chr3 = input.charCodeAt(i++); 
    enc1 = chr1 >> 2; 
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4); 
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6); 
    enc4 = chr3 & 63; 
    if (isNaN(chr2)) { 
     enc3 = enc4 = 64; 
    } else if (isNaN(chr3)) { 
     enc4 = 64; 
    } 
    output = output + 
    _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + 
    _keyStr.charAt(enc3) + _keyStr.charAt(enc4); 
   } 
   return output; 
  }; 
   
  // public method for decoding 
  this.decode = function (input) { 
   let output = ""; 
   let chr1, chr2, chr3; 
   let enc1, enc2, enc3, enc4; 
   let i = 0; 
   input = input.replace(/[^A-Za-z0-9\+\/\=]/g, ""); 
   while (i < input.length) { 
    enc1 = _keyStr.indexOf(input.charAt(i++)); 
    enc2 = _keyStr.indexOf(input.charAt(i++)); 
    enc3 = _keyStr.indexOf(input.charAt(i++)); 
    enc4 = _keyStr.indexOf(input.charAt(i++)); 
    chr1 = (enc1 << 2) | (enc2 >> 4); 
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2); 
    chr3 = ((enc3 & 3) << 6) | enc4; 
    output = output + String.fromCharCode(chr1); 
    if (enc3 != 64) { 
     output = output + String.fromCharCode(chr2); 
    } 
    if (enc4 != 64) { 
     output = output + String.fromCharCode(chr3); 
    } 
   } 
   output = _utf8_decode(output); 
   return output; 
  }; 
   

 } 

