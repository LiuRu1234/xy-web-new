import {get, post} from '@utils/utils';
import {All_RECORD} from './constants';

export function ajaxRecord(data) {
    post ('/save/log', data);
}