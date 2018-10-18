import { START_PAGE_TIME, END_PAGE_TIME, FILE_PLAY_TIME, RELAY, PAGE_NAME, All_RECORD }from './constants';
import { getLocalTime, post } from '@utils/utils';
import {LOGIN_ID, TOKEN} from '@config/constants';
// import { Base64 } from 'js-base64';
var Base64 = require('js-base64').Base64;

//记录所有的记录
export function recordAll(o) {
    let allRecord = localStorage.getItem(All_RECORD);
   
    if (!allRecord) {
        allRecord = [];
    } else {
        allRecord = JSON.parse(allRecord);
    }

    allRecord.push({...o, create_at: (new Date()).format("yyyy-MM-dd hh:mm:ss")});
    localStorage.setItem(All_RECORD, JSON.stringify(allRecord));
}

// 记录当前页面时间
export function pageStayStorage() {
    recordPageEnd();
    let startTime = JSON.parse(localStorage.getItem(START_PAGE_TIME));
    let endTime = JSON.parse(localStorage.getItem(END_PAGE_TIME));
    let o = {
        log_type: 'stayPage',
        user_id: localStorage.getItem(LOGIN_ID),
        type: 'PC',
        begin_at: startTime.date_time,
        page_name: localStorage.getItem(PAGE_NAME),
        stay_time: endTime.time - startTime.time
    };

    recordAll(o);
}

// 记录转发操作
export function relayStorage(trans_button, share_code) {
    let o = {
        log_type: 'relay',
        user_id: localStorage.getItem(LOGIN_ID),
        type: 'PC',
        trans_button, // 项目页转发，内页转发
        share_code,
    };
    recordAll(o);
}

// 记录播放时长
// belong_id 项目id
// doc_id 文件id
export function playStorage(belong_id, doc_id, play_time) {
    let o = {
        log_type: 'play',
        user_id: localStorage.getItem(LOGIN_ID),
        type: 'PC',
        belong_id,
        doc_id,
        play_time
    };
    recordAll(o);
}

export function clearStoragePlayTime() {
    localStorage.setItem(FILE_PLAY_TIME, 0);
}

// 记录页面停留的开始时间
export function recordPageStart(page_name) {
    let time = Date.parse(new Date());
    let o = {
        date_time: (new Date()).format("yyyy-MM-dd hh:mm:ss"),
        time: time / 1000
    };
    localStorage.setItem(START_PAGE_TIME, JSON.stringify(o));
    localStorage.setItem(PAGE_NAME, page_name);
}

// 记录页面停留的结束时间
export function recordPageEnd() {
    let time = Date.parse(new Date());
    let o = {
        date_time: (new Date()).format("yyyy-MM-dd hh:mm:ss"),
        time: time / 1000
    };
    localStorage.setItem(END_PAGE_TIME, JSON.stringify(o));
    return time;
}


// 轮询发送埋点
function sendRecord() {
    let data = localStorage.getItem(All_RECORD);
    data = Base64.encode(data);
    recordPageEnd();
    pageStayStorage();
    post ('/save/log', {
        data, 
        login_id: localStorage.getItem(LOGIN_ID),
        token: localStorage.getItem(TOKEN)
    }).then((res) => {
        if (res.data.status == 1) {
            localStorage.setItem(All_RECORD, '[]');
        }
    });
}

window.recordTimer = setInterval(() => {
    sendRecord();
}, 60000);


