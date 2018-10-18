import { START_PAGE_TIME, END_PAGE_TIME, FILE_PLAY_TIME, RELAY, PAGE_NAME, All_RECORD }from './constants';
import { getLocalTime } from '@utils/utils';
import {LOGIN_ID} from '@config/constants';

//记录所有的记录
export function recordAll(o) {
    let allRecord = localStorage.getItem(All_RECORD);
   
    if (!allRecord) {
        allRecord = [];
    } else {
        allRecord = JSON.parse(allRecord);
    }

    allRecord.push(o);
    localStorage.setItem(All_RECORD, JSON.stringify(allRecord));
}

// 记录当前页面时间
export function pageStayStorage() {
    recordPageEnd();
    let startTime = JSON.parse(localStorage.getItem(START_PAGE_TIME));
    let endTime = JSON.parse(localStorage.getItem(END_PAGE_TIME));
    console.log(endTime, startTime);
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
export function relayStorage() {

} 

// 记录播放时长
export function playStorage() {

}

// 记录页面停留的开始时间
export function recordPageStart(page_name) {
    let time = Date.parse(new Date());
    let o = {
        date_time: getLocalTime(time / 1000),
        time: time / 1000
    };
    localStorage.setItem(START_PAGE_TIME, JSON.stringify(o));
    localStorage.setItem(PAGE_NAME, page_name);
}

// 记录页面停留的结束时间
export function recordPageEnd() {
    let time = Date.parse(new Date());
    let o = {
        date_time: getLocalTime(time / 1000),
        time: time / 1000
    };
    localStorage.setItem(END_PAGE_TIME, JSON.stringify(o));
    return time;
}

