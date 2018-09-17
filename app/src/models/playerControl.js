import DrawUtil from '../utils/draw-util';
import {getTokenLocalstorage, post, get} from '../utils/utils';
import {message} from 'antd';
let initObj = {
	progress: 0,
	progressWidth: 0,
	progressTime: 0,    // 当前播放时间
	filePlayerTime: 0,  // 总时长
	playerTimeMode: 0,
	paused: true,
	showRatioCover: false,
	showRatio: false,
	allDrawObj: [],		//发表评论时画板数据 
	commentDrawObj: [],  //评论列表画板数据 （与评论画板数据allDrawObj区分，以免混淆）
	deleteDrawObj: [],
	colorActive: '#E74A3C',  //画画颜色
	drawTypeActive: '',  //画画方式,
	drawBackCount: 0,
	currentDefinition: '540',
	filePlayerMuted: false,
	filePlayer: null,

	// 评论
	needTime: -1,    //是否需要时间
	commentActive: null,
	commentText: '',

	currentSY: true,
	currentDefinition: '540',
	currentRatio:{
		width: 16,
		height: 9,
		text: '16:9'
	} ,
};

export default {
	namespace: 'playerControl',
	state: {
		videoWH:{w: 0, h: 0},
		videoOffset: {left: 0, top: 0},
		playerBody:null,
		paused: true,
		filePlayer: null,
		filePlayerMuted: false,
		progressBody: null,
		progress: 0,
		progressWidth: 0,
		progressTime: 0,    // 当前播放时间
		filePlayerTime: 0,  // 总时长
		playerLoop: false,
		playerTimeMode: 0,
		volume: 50,
		currentSY: true,
		currentDefinition: '540',
		currentRatio:{
			width: 16,
			height: 9,
			text: '16:9'
		} ,
		ratioList: [
			{
			  width: 2.35,
			  height: 1,
			  text: '2.35'
			},
			{
			  width: 1.85,
			  height: 1,
			  text: '1.85'
			},
			{
			  width: 16,
			  height: 9,
			  text: '16:9'
			},
			{
			  width: 4,
			  height: 3,
			  text: '4:3'
			}
		],
		showRatioCover: false,
		showRatio: false,
		ctx1: null,
		ctx2: null,
		ctx3: null,
		ctx4: null,
		ctx: null,
		allDrawObj: [],		//发表评论时画板数据 
		commentDrawObj: [],  //评论列表画板数据 （与评论画板数据allDrawObj区分，以免混淆）
		deleteDrawObj: [],
		colorActive: '#E74A3C',  //画画颜色
		drawTypeActive: '',  //画画方式,
		drawBackCount: 0,

		// 评论
		needTime: -1,    //是否需要时间
		commentActive: null,
		commentText: '',
		
	},
	reducers: {
		saveVideoWH(state, { payload: videoWH}) {
			return { ...state, videoWH };
		},

		saveCurrentSY(state, { payload: currentSY}) {
			return { ...state, currentSY };
		},

		saveFilePlayerMuted(state, { payload: filePlayerMuted}) {
			return { ...state, filePlayerMuted };
		},

		savePlayerBody(state, { payload: playerBody}) {
			return { ...state, playerBody };
		},

		savePaused(state, { payload: paused}) {
			return { ...state, paused };
		},

		saveFilePlayer(state, { payload: filePlayer}) {
			return { ...state, filePlayer };
		},

		saveProgressBody(state, { payload: progressBody}) {
			return { ...state, progressBody };
		},

		saveProgress(state, { payload: progress}) {
			return { ...state, progress };
		},

		saveProgressWidth(state, { payload: progressWidth}) {
			return { ...state, progressWidth };
		},

		// 当前播放时间
		saveProgressTime(state, { payload: progressTime}) {
			return { ...state, progressTime };
		},

		// 保存总时长
		saveFilePlayerTime(state, { payload: filePlayerTime}) {
			return { ...state, filePlayerTime };
		},

		savePlayerLoop(state, { payload: playerLoop}) {
			return { ...state, playerLoop };
		},

		savePlayerTimeMode(state, { payload: playerTimeMode}) {
			return { ...state, playerTimeMode };
		},

		saveVolume(state, { payload: volume}) {
			return { ...state, volume };
		},

		saveCurrentDefinition(state, { payload: currentDefinition}) {
			return { ...state, currentDefinition };
		},

		saveCurrentRatio(state, { payload: currentRatio}) {
			return { ...state, currentRatio };
		},

		saveCtx(state, { payload: {ctx1, ctx2, ctx3, ctx4, ctx}}) {
			return { ...state, ctx1, ctx2, ctx3, ctx4, ctx };
		},

		saveShowRatioCover(state, { payload: showRatioCover}) {
			return { ...state, showRatioCover };
		},

		saveAllDrawObj(state, { payload: allDrawObj}) {
			return { ...state, allDrawObj, allDrawObjTemp: allDrawObj };
		},

		saveColorActive(state, { payload: colorActive}) {
			return { ...state, colorActive };
		},

		saveDrawTypeActive(state, { payload: drawTypeActive}) {
			return { ...state, drawTypeActive };
		},

		saveDeleteDrawObj(state, { payload: deleteDrawObj}) {
			return { ...state, deleteDrawObj };
		},

		saveVideoOffset(state, { payload: videoOffset}) {
			return { ...state, videoOffset };
		},

		saveNeedTime(state, { payload: needTime}) {
			return { ...state, needTime };
		},

		saveCommentActive(state, { payload: commentActive}) {
			return { ...state, commentActive };
		},

		saveCommentText(state, { payload: commentText}) {
			return { ...state, commentText };
		},

		saveCommentDrawObj(state, { payload: commentDrawObj}) {
			return { ...state, commentDrawObj };
		},

		initControl(state, { payload: {}}) {
			return { ...state, ...initObj };
		}
	},
	
	effects: {
		// 计算video高度
		*getPlayerHeight({ payload:{} }, { call, put, select }) {
			const playerControl = yield select(state => state.playerControl);
			let h, w;
			if (!playerControl.playerBody) return;
			let playerBody = playerControl.playerBody.getBoundingClientRect();
			let maxHeight = document.documentElement.clientHeight - (63.8 + 50 + 75 + 105);
	
			if (playerBody.h > playerBody.width * (9 / 16)){
				h = playerBody.height;
				w = playerBody.height * (16 / 9);
			} else {
				w = playerBody.width;
				h = playerBody.width * (9 / 16);
			}
	
			if (h > maxHeight ) {
				h = maxHeight;
				w = h * (16 / 9);
			}

			yield put({type: 'saveVideoWH', payload: {w, h} });
		},

		// 视频播放暂停
		*playerPlayOrPause ({ payload: paused }, { call, put, select }) {
			let playerControl = yield select(state => state.playerControl);
			// 手动控制
			if (paused === true) {
				playerControl.filePlayer.pause();
				yield put({ type: 'savePaused', payload: true });
				return;
			}
			if (!playerControl.filePlayer) return;
			if (playerControl.paused) {
				playerControl.filePlayer.play();
				playerControl.ctx3 && playerControl.ctx3.clearRect(0, 0, playerControl.videoWH.w, playerControl.videoWH.h);
				yield put({ type: 'saveNeedTime', payload: -1 });
				yield put({ type: 'savePaused', payload: false });
			} else {
				playerControl.filePlayer.pause();
				yield put({ type: 'savePaused', payload: true });
			}
		},

		// 修改视频比例
		*changeRatio ({ payload: guide }, { call, put, select }) {
			const playerControl = yield select(state => state.playerControl);
			const canvasWidth = playerControl.videoWH.w;
			const canvasHeight = playerControl.videoWH.h;
			let ctx2 = playerControl.ctx2;
			let showRatioCover = playerControl.showRatioCover;
			ctx2.clearRect(0, 0, canvasWidth, canvasHeight);
			ctx2.strokeStyle = '#f00';
			let drawRect1 = () => {
				let height = canvasWidth * (guide.height / guide.width);
				let y =  (canvasHeight - height) / 2;
				DrawUtil.drawRect(ctx2, 0, y, canvasWidth - 1, height);
			};
	
			let drawRect2 = () => {
				let width = canvasHeight * (guide.width / guide.height);
				let x =  (canvasWidth - width) / 2;
				DrawUtil.drawRect(ctx2, x, 0, width - 1, canvasHeight);
			};
	
			let drawRect3 = () => {
				ctx2.fillStyle = '#000';
				ctx2.fillRect(0,0,canvasWidth, canvasHeight);
				let height = canvasWidth * (guide.height / guide.width);
				let y =  (canvasHeight - height) / 2;
				ctx2.clearRect(0, y, canvasWidth - 1, height);
			};
	
			let drawRect4 = () => {
				ctx2.fillStyle = '#000';
				ctx2.fillRect(0,0,canvasWidth + 1, canvasHeight); //这里多个显示出来的边，所以 +1
				let width = canvasHeight * (guide.width / guide.height);
				let x =  (canvasWidth - width) / 2;
				ctx2.clearRect(x, 0, width, canvasHeight);
			};
	
			switch (guide.text) {
				case '2.35': 
					showRatioCover ? drawRect3() : drawRect1();
					break;
				case '1.85': 
					showRatioCover ? drawRect3() : drawRect1();
					break;
				case '16.9': 
					showRatioCover ? drawRect4() : drawRect2();
					break;
				case '4:3': 
					showRatioCover ? drawRect4() : drawRect2();
					break;
			}
		},

		// 关闭视频比例
		*offRatioCover ({ payload: guide }, { call, put, select }) {
			const playerControl = yield select(state => state.playerControl);
			const canvasWidth = playerControl.videoWH.w;
			const canvasHeight = playerControl.videoWH.h;

			playerControl.ctx2 && playerControl.ctx2.clearRect(0, 0, canvasWidth, canvasHeight);
			yield put({type: 'saveCurrentRatio', payload: {
					width: 16,
					height: 9,
					text: '16:9'
			}});
		},

		// 画板撤销/恢复
		*backRecoverDraw({ payload: back }, { call, put, select }) {	
			const playerControl = yield select(state => state.playerControl);
			let allDrawObj = JSON.parse(JSON.stringify(playerControl.allDrawObj));
			let deleteDrawObj = JSON.parse(JSON.stringify(playerControl.deleteDrawObj));
			const canvasWidth = playerControl.videoWH.w;
			const canvasHeight = playerControl.videoWH.h;
			if (back) {
				if (allDrawObj.length > 0) {
					let draw = allDrawObj.pop();
					deleteDrawObj.push(draw);
					playerControl.ctx4 && playerControl.ctx4.clearRect(0, 0, playerControl.videoWH.w, playerControl.videoWH.h);
				}
			} else {
				if (deleteDrawObj.length == 0) return; 
				let draw = deleteDrawObj.pop();
				allDrawObj.push(draw);
			}
			yield put({type: 'saveAllDrawObj', payload: allDrawObj});
			yield put({type: 'saveDeleteDrawObj', payload: deleteDrawObj});
			yield put({type: 'drawAll', payload: allDrawObj});

			if (allDrawObj.length == 0) {
				playerControl.ctx3 && playerControl.ctx3.clearRect(0, 0, playerControl.videoWH.w, playerControl.videoWH.h);
			} 

		},

		// 显示所画的内容
     	*drawAll({ payload: allDrawObj }, { call, put, select }){
			const playerControl = yield select(state => state.playerControl);

			if (allDrawObj.length == 0) {
				playerControl.ctx3 && playerControl.ctx3.clearRect(0, 0, playerControl.videoWH.w, playerControl.videoWH.h);
				return;
			}
			
			let getRelativeX = (x) =>  {
				return x / playerControl.videoWH.w;
			};
			  
			let getRelativeY = (y) => {
				return y / playerControl.videoWH.h;
			};
			  
			let getPositionXW = (value) => {
				return value * playerControl.videoWH.w;
			};
			  
			let getPositionYH = (value) => {
				return value * playerControl.videoWH.h;
			};

			const {ctx3, ctx4} = playerControl;
			ctx3.clearRect(0, 0, playerControl.videoWH.w, playerControl.videoWH.h);
			ctx3.beginPath();
			allDrawObj.forEach((item) => {
				ctx3.lineWidth = item.size;
				ctx3.strokeStyle = item.color;
				ctx3.fillStyle = item.color;
				switch(item.tool) {
					case 'rect':
						DrawUtil.drawRect(ctx3, getPositionXW(item.x), getPositionYH(item.y), getPositionXW(item.w), getPositionYH(item.h));
						break;
					case 'arrow':
						DrawUtil.drawArrow(ctx3, getPositionXW(item.x1), getPositionYH(item.y1), getPositionXW(item.x2), getPositionYH(item.y2));
						break;
					case 'pen':
						item.xs.forEach((it, k) => {
							DrawUtil.drawLine(ctx3, getPositionXW(it), getPositionYH(item.ys[k]), getPositionXW(item.xs[k + 1]), getPositionYH(item.ys[k + 1]));
						});
						break;
				}
			});
			ctx3.closePath(); 
		},

		// 设置是否处于画板状态
		*setIsDrawing({ payload: drawTypeActive }, { call, put, select }){
			let type = drawTypeActive;
			const playerControl = yield select(state => state.playerControl);

			if (playerControl.drawTypeActive == type) {
				type = '';
				playerControl.ctx3.clearRect(0,0, playerControl.videoWH.w, playerControl.videoWH.h);
				playerControl.ctx4.clearRect(0,0, playerControl.videoWH.w, playerControl.videoWH.h);
				yield put({type: 'saveNeedTime', payload: -1});
				yield put({type: 'saveAllDrawObj', payload: []});
				yield put({type: 'saveDeleteDrawObj', payload: []});
				playerControl.filePlayer.play();
				yield put({type: 'savePaused', payload: false});
			}  else {
				if (playerControl.drawTypeActive == ''){
					yield put({type: 'saveAllDrawObj', payload: []});
					playerControl.ctx3.clearRect(0, 0, playerControl.videoWH.w, playerControl.videoWH.h);
				}
				playerControl.filePlayer.pause();
				yield put({type: 'savePaused', payload: true});
				yield put({type: 'saveNeedTime', payload: 0});
			}
			yield put({type: 'saveDrawTypeActive', payload: type});
		},

		*initVideoOffset({ payload: {} }, { call, put, select }){
			const playerControl = yield select(state => state.playerControl);
			let left, top;
			if(playerControl.ctx) {
				left = playerControl.ctx.getBoundingClientRect().left;
				top = playerControl.ctx.getBoundingClientRect().top;
			}
			yield put({type: 'saveVideoOffset', payload: {left, top}});
		},

		// 视频区域宽高变化响应
		*videoResize({ payload: {} }, { call, put, select }){
			const playerControl = yield select(state => state.playerControl);
			const {progressTime, filePlayerTime, progressBody} = playerControl;
			if (!progressBody) return;
		
            let progress = progressTime / filePlayerTime;
			let width = progress * progressBody.getBoundingClientRect().width;
			yield put({
				type: 'getPlayerHeight',
				payload: {}
            });
            
            yield put({
                type: 'initVideoOffset',
                payload: {}
            });

            yield put({
                type: 'drawAll',
                payload: playerControl.allDrawObj
            });
            
            yield put({
                type: 'saveProgressWidth',
                payload: width,
            });
		},

		// 点击评论
		*changeCommentActive({ payload: item }, { call, put, select }){
			const playerControl = yield select(state => state.playerControl);
			playerControl.ctx3 && playerControl.ctx3.clearRect(0, 0, playerControl.videoWH.w, playerControl.videoWH.h);
			playerControl.ctx4 && playerControl.ctx4.clearRect(0, 0, playerControl.videoWH.w, playerControl.videoWH.h);

			yield put({type: 'saveCommentActive', payload: item});
		
			if (item.label != '[]') {
				let allDrawObj = JSON.parse(item.label);
				yield put({type: 'saveCommentDrawObj', payload: allDrawObj});
				yield put({type: 'drawAll', payload: allDrawObj});
				yield put({type: 'saveNeedTime', payload: -1});
				yield put({type: 'saveAllDrawObj', payload: []});
				yield put({type: 'saveDeleteDrawObj', payload: []});
				yield put({type: 'saveDrawTypeActive', payload: ''});
			} else {
				yield put({type: 'saveCommentDrawObj', payload: []});
			}

			if (item.media_time >= 0) {
				playerControl.filePlayer.pause();
				playerControl.filePlayer.currentTime = item.media_time;
				yield put({type: 'savePaused', payload: true});
			}
		},

		// 发送评论
		*sendComment({ payload: item }, { call, put, select }){

			const playerControl = yield select(state => state.playerControl);
			const file = yield select(state => state.file);
			const {
				commentText,
				allDrawObj,
				needTime,
				progressTime,
				ctx4,
				ctx3,
				filePlayer,
			} = playerControl;

			if (commentText == '' && allDrawObj.length == 0) return;
			let param = {
				...getTokenLocalstorage(),
				content: commentText,
				label: JSON.stringify(allDrawObj),
				media_time: needTime == -1 ? -1 : progressTime,
				top_id: 0,
				doc_id: file.fileInfo.id,
				project_id: file.fileInfo.project_id
			};

			const json = yield call(post, '/comment' , param);

			if (json.data.status == 1) {
				message.success('评论成功');
				ctx3 && ctx3.clearRect(0, 0, playerControl.videoWH.w, playerControl.videoWH.h);
				ctx4 && ctx4.clearRect(0, 0, playerControl.videoWH.w, playerControl.videoWH.h);
				const user = yield select(state => state.user);
				const comment = yield select(state => state.comment);
				let getCommentObj = () => {
					return {
						avatar: user.userInfo.avatar,
						avatar_background_color: user.userInfo.avatar_background_color,
						created_at: Date.parse(new Date()),
						realname: user.userInfo.realname,
						replies: [],
						review: 0,
						top_id: 0,
						user_id: user.userInfo.id,
						content: commentText,
						id: json.data.data.id,
						label: JSON.stringify(allDrawObj),
						media_time: needTime == -1 ? -1 : progressTime,
					};
				};

				let comments = JSON.parse(JSON.stringify(comment.comments));
				comments.unshift(getCommentObj());
				yield put({type: 'comment/saveComments', payload: comments});
				
				// filePlayer.play();
				// yield put({type: 'savePaused', payload: false});
				yield put({type: 'saveCommentText', payload: ''});
				yield put({type: 'saveNeedTime', payload: -1});
				yield put({type: 'saveAllDrawObj', payload: []});
				yield put({type: 'saveDeleteDrawObj', payload: []});
				yield put({type: 'saveDrawTypeActive', payload: ''});
			} else {
				message.error('评论失败');
			}

		},

		// 上一条/下一条评论
		*forwardCommentActive({ payload: prevOrNext }, { call, put, select }) {
			const comment = yield select(state => state.comment);
			const playerControl = yield select(state => state.playerControl);
			let key = 0;

			if (playerControl.commentActive) {
				comment.comments.forEach((item, k) => {
					if (playerControl.commentActive.id == item.id) {
							key = k;
					}
				});
				if (prevOrNext == 'prev') {
					key = key - 1 <= 0 ? 0 : key - 1;
					yield put({type: 'changeCommentActive', payload: comment.comments[key]});
				} else {
					key = key + 1 >= comment.comments.length ? 0 : key + 1;
					yield put({type: 'changeCommentActive', payload: comment.comments[key]});
				}
			} else {
				if (prevOrNext == 'prev') {
					return;
				} else {
					yield put({type: 'changeCommentActive', payload: comment.comments[key]});
				}
			}
		}

	},
	subscriptions: {},
};
