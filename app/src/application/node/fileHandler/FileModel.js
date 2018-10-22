(function (factory) {
    if (!window.require || typeof(window.require) != 'function') return;

    module.exports = factory(
        window.require('chokidar'),
        window.require('fs'),
        window.require('os') 
    );

})(function (chokidar, fs, os) {

    class FileModel {

        constructor(opts) {
            this.path = opts.path;
            console.log(this.path);
        }

        // 获取所有文件
        getFiles() {
            let path = this.path[0];
            let self = this;
            fs.readdir(path,function(err,menu){	
                if(!menu)
                    return;
                menu.forEach((ele) => {	
                    fs.stat(path+"/"+ele,(err,info) => {
                        if(info.isDirectory()){
                            console.log("dir: "+ele);
                            self.getFiles(path+"/"+ele);
                        }else{
                            console.log("file: "+ele);
                        }	
                    });
                });			
            });
        }

        watchNormalFiles() {

        }

        handleFile2Obj() {

        }

        fetchFiles2Server() {

        }
    }
    
    return FileModel;
});


