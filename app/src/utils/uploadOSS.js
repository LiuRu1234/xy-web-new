import {message} from 'antd';
export default class UploadOSS {

    client = null
    uploadFileClient = null
    // currentCheckpoint = null
    progressEvent = null
    createOSSFail = null
    setMid = null
    successEvent = null
    
    constructor(config) {
        this.progressEvent = config.progressEvent;
        this.file = config.file;
        this.setMid = config.setMid;
        this.successEvent = config.successEvent;
        this.objectKey = config.objectKey;
        this.checkpoint = config.checkpoint;
        this.uploadFail = config.uploadFail;
        this.clientConfig = config.clientConfig;

        // let clientConfig = {
        //     region: 'oss-cn-shanghai',
        //     //云账号AccessKey有所有API访问权限，建议遵循阿里云安全最佳实践，创建并使用STS方式来进行API访问
        //     accessKeyId: 'LTAILWCfmthKUqkk',
        //     accessKeySecret: '4b3woUoanrHOMBKShIYvxBieoP1mHJ',
        //     bucket: 'xinyuetest',
        //     endpoint: "https://oss-cn-shanghai.aliyuncs.com/",
        // };

        this.client = new window.OSS.Wrapper(this.clientConfig);
        this.uploadFile();
    }


    progress = (p, checkpoint) => {
        let _self = this;
        return function (done) {
            // _self.currentCheckpoint = checkpoint;
            _self.progressEvent(p,checkpoint, _self.uploadFileClient);
            done();
        };
    }

    uploadFile = () => {
        let _self = this;
        if (!_self.uploadFileClient || Object.keys(_self.uploadFileClient).length === 0) {
            window.uploadFileClient = _self.uploadFileClient = this.client;
        }

        let options = {
            parallel: 8,
            progress: _self.progress,
            partSize: 2 * 1024 * 1024,
            checkpoint: this.checkpoint,
            meta: {
              year: 2018,
              people: 'xinyue'
            }
        };

        // if (this.currentCheckpoint) {
        //     options.checkpoint = this.currentCheckpoint;
        // }

        _self.uploadFileClient.multipartUpload(this.objectKey, this.file, options)
        .then(res => {
            // _self.currentCheckpoint = null;
            _self.uploadFileClient = null;
            if (res.res.status == 200) {
                _self.successEvent(res);
            }
        }).catch(err => {
            console.log(err, 'error');
            this.uploadFail && this.uploadFail();
            if (_self.uploadFileClient) {
                console.log(err, 'stop-upload!');
            } else {
                console.error(err, 'uploadErr');
            }
        });
    }

}
