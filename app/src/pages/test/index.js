import React, { PureComponent } from 'react';
const FileModel = require('@APP_NODE/fileHandler/FileModel');


class test extends PureComponent {

    openDialog() {
        // window.require('electron').dialog;
        const {dialog} = window.require('electron').remote;

        // console.log(dialog.showOpenDialog({properties: ['openDirectory']}))

        let fm = new FileModel({
            path: dialog.showOpenDialog({properties: ['openDirectory']})
        });
        fm.getFiles();
    }

    render () {
        return (
            <div>
               <button onClick={this.openDialog}>选择</button>
            </div>
        );
    }
}

export default test;