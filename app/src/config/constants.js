
export const EXP_EMAIL = new RegExp('^[\.A-Za-z0-9_-\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$');

export const EXP_PHONE = /^[1][3,4,5,7,8][0-9]{9}$/;

export const XY_API = process.env.NODE_ENV === 'production' ? 'http://www.uxinyue.com:81/api' : '/api';
// export const XY_API = '/api';

export const ASSETS = '';

export const LOGIN_ID = 'LOGIN_ID';

export const TOKEN = 'TOKEN';

export const NOTICE_TIME = '_xy_notice_update_time_2018';

export const ALERT_NOTICE_TIME = '_xy_alert_notice_update_time_2018';

export const CURRENT_LOCATION = '_xy_current_location';

// 判断是否是移动端
let isMobile = '';
if (/Android|webOS|iPhone|iPad|BlackBerry/i.test(navigator.userAgent)) {
	isMobile = true;
} else {
	isMobile = false;
}
export const PRE_PAGE = isMobile?10:20;

export const PRO_COLOR = ['#FF635D', '#F9A746', '#F5CE4A', '#5B53FF', '#4BB9F4', '#50E3C2'];

export const FILE_STATUS = [
    {
        review: 0,
        text: '审核',
    },
    {
        review: 1,
        text: '审核通过',
    },
    {
        review: 2,
        text: '进行中',
    },
    {
        review: 3,
        text: '待审核',
    },
    {
        review: 4,
        text: '意见搜集完成',
    },
];

export const PROJECT_TABS = [
    {
        name: '文件',
        icon: 'file.svg',
        iconActive: 'file-active.svg'
    },
    {
        name: '分享',
        icon: 'link.svg',
        iconActive: 'link-active.svg'
    },
    {
        name: '收藏',
        icon: 'like.svg',
        iconActive: 'like-active.svg'
    },
    {
        name: '应用',
        icon: 'pack.svg',
        iconActive: 'pack-active.svg'
    },
    // {
    //     name: '消息',
    //     icon: 'notice-tab.svg',
    //     iconActive: 'notice-tab-active.svg'
    // },
];


export const HELP_ONE = [
    {
        id: 'create-project',
        content: '创建属于自己的新的项目组',
        title: '添加到我的项目（1/3）',
        sureText: '下一步',
        left: 0,
        top: 0,
        key: 0,
    },
    {
        id: 'add-member',
        content: '点击添加按钮，输入邮箱添加项目成员和设置成员角色',
        title: '添加成员／设置角色(2/3)',
        sureText: '下一步',
        left: 0,
        top: 0,
        key: 1,
    },
    {
        id: 'header-notice',
        content: '新成员加入项目组后您将收到通知',
        title: '加入通知(3/3)',
        sureText: '关闭',
        left: 0,
        top: 0,
        key: 2,
        arrowDirection: 'right'
    }
];

export const HELP_TWO = [
    {
        id: 'file-status',
        content: '查看媒体当前状态，管理员与审阅者可修改状态',
        title: '媒体状态(1/6)',
        sureText: '下一步',
        left: 0,
        top: 0,
        key: 0,
    },
    {
        id: 'fps-body',
        content: '通过画笔和标注工具对画面进行标注',
        title: '标注区域(2/6)',
        sureText: '下一步',
        left: 0,
        top: 0,
        key: 1,
    },
    {
        id: 'fc-body',
        content: '视频所有的评论都会展示在评论列表中，您可以进行查看、回复、审阅确认',
        title: '评论列表(3/6)',
        sureText: '下一步',
        left: 0,
        top: 0,
        key: 2,
    },
    {
        id: 'file-versions',
        content: '上传同一媒体的多个版本，切换不同版本进行对比',
        title: '版本切换与对比(4/6)',
        sureText: '下一步',
        left: 0,
        top: 0,
        key: 3,
    },
    {
        id: 'file-share',
        content: '分享成片链接或发送对应邮箱的联系人',
        title: '分享选项(5/6)',
        sureText: '下一步',
        left: 0,
        top: 0,
        key: 4,
    },
    {
        id: 'fpt-draw',
        content: '可以使用画笔和文字描述对媒体的具体修改建议进行操作',
        title: '标注工具(6/6)',
        sureText: '关闭',
        left: 0,
        top: 0,
        key: 5,
        direction: 'bottom'
    },

];

export const USE_ICON = [
    {
        name: '小程序',
        icon: 'xcx.svg',
        key: 'xcx'
    },
    {
        name: 'Pr插件',
        icon: 'pr.svg',
        key: 'pr',
    },
    // {
    //     name: '新片场',
    //     icon: 'xpc.svg',
    //     key: 'xpc'
    // },
    {
        name: '精品案例',
        icon: 'jpal.jpg',
        key: 'jpal'
    },
    {
        name: '水印管理',
        icon: 'watermark.svg',
        key: 'watermark'
    },
];


export const PR_FIELD = [
    {
        field: 'name',
        name: '姓名',
        placeholder: '请填写您的名称'
    },
    {
        field: 'phone',
        name: '联系电话',
        placeholder: '请填写您的联系电话',
        parrent: EXP_PHONE
    },
    {
        field: 'company_name',
        name: '公司名称',
        placeholder: '请填写您的公司名称',
    },
    {
        field: 'work_email',
        name: '工作邮箱',
        placeholder: '请填写您的工作邮箱',
        parrent: EXP_EMAIL
    }
];

