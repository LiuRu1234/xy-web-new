import {post, get, getTokenLocalstorage, getQuery, sortBy, search} from '../utils/utils';
import {message} from 'antd';

export default {
	namespace: 'price',
	
	state: {
        priceModalShow: false,
        priceArgs: [],
        currentPrice: null,
        codeUrl: '',
        step: 0,
        fail: false,
        successModalShow: false, 
        warningModalShow: false,
        paySuccess: false,
        successObj: null,
        orderId: 0,
        isWarning: false,  //判断是否从警告框升级过来的
    },

    reducers: {
        saveInit(state, { payload: {}}) {
            return { ...state, ...{
                priceModalShow: false,
                codeUrl: '',
                step: 0,
                fail: false,
                warningModalShow: false,
                paySuccess: false,
                isWarning: false
            }};
        },

        saveSuccessObj(state, { payload: successObj}) {
            return { ...state, successObj };
        },

        saveIsWarning(state, { payload: isWarning}) {
            return { ...state, isWarning };
        },

        saveOrderId(state, { payload: orderId}) {
            return { ...state, orderId };
        },

        savePriceModalShow(state, { payload: priceModalShow}) {
            return { ...state, priceModalShow };
        },

        savePaySuccess(state, { payload: paySuccess}) {
            return { ...state, paySuccess };
        },

        savePriceArgs(state, { payload: priceArgs}) {
            return { ...state, priceArgs };
        },

        saveCodeUrl(state, { payload: codeUrl}) {
            return { ...state, codeUrl };
        },

        saveCurrentPrice(state, { payload: currentPrice}) {
            return { ...state, currentPrice };
        },

        saveStep(state, { payload: step}) {
            return { ...state, step };
        },

        saveFail(state, { payload: fail}) {
            return { ...state, fail };
        },

        saveSuccessModalShow(state, { payload: successModalShow}) {
            return { ...state, successModalShow };
        },

        saveWarningModalShow(state, { payload: warningModalShow}) {
            return { ...state, warningModalShow };
        }
    },


    effects: {
        *fetchPrices({ payload: {}}, { call, put, select }) {
            const localLogin = getTokenLocalstorage();
            let json = yield call(get, '/product/list', localLogin);

            if (json.data.status == 1) {
                yield put({ type: 'savePriceArgs', payload: json.data.data});
            } else {
                message.error(json.data.msg);
            }
        },

        *fetchWxPay({ payload: {price_id}}, { call, put, select }) {
            const localLogin = getTokenLocalstorage();
            let price = yield select(state => state.price);
            let json = yield call(post, '/wxpay', {...localLogin, product_id: price_id});

            if (json.data.status == 1) {
                let currentPrice = price.priceArgs.filter((item, k) => {
                    return price_id == item.id;
                });
                yield put({ type: 'saveCodeUrl', payload: json.data.data.code_url});
                yield put({ type: 'saveCurrentPrice', payload: currentPrice[0]});
                yield put({ type: 'saveOrderId', payload: json.data.data.order_id});
            } else {
                message.error(json.data.msg);
            }
        },

        *fetchPaySuccess({ payload: {}}, { call, put, select }){
            const localLogin = getTokenLocalstorage();
            let price = yield select(state => state.price);
            if (price.orderId == 0) return;
            let json = yield call(get, 'orderstatus', {...localLogin, order_id: price.orderId});
            if (json.data.status == 1) {
                if (json.data.data.status == 1) {
                    yield put({type: 'savePaySuccess', payload: true});
                    yield put({type: 'saveStep', payload: 2});
                    yield put({type: 'saveSuccessObj', payload: json.data.data.product});
                } else {
                    // message.error('购买失败');
                    // yield put({type: 'savePaySuccess', payload: true});
                    // yield put({type: 'saveFail', payload: true});
                    // yield put({type: 'saveStep', payload: 2});
                }
             
            } else {
                message.error(json.data.msg);
            }
        },
        
        // 判断是否超量并处理
        *handleWarning({ payload: {}}, { call, put, select }){
            let price = yield select(state => state.price);
            let user = yield select(state => state.user);
            if (user.userInfo.usage_state == -1) {
                yield put({type: 'saveWarningModalShow', payload: true});
            } else {
                yield put({type: 'saveWarningModalShow', payload: false});
            }
        }
    }

};