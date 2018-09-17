import React, { PureComponent } from 'react';
import Modal from '@CC/Modal';
import Image from '@CC/Image';
import './index.scss';

class SaveModal extends PureComponent {
	constructor(props) {
        super(props);
        
        this.state = {
            selectedProject: 0
        };
    }

    toggleSaveFileModal = (saveFileModalShow) => {
		this.props.dispatch({
			type: 'project/saveSaveFileModalShow',
			payload: saveFileModalShow	 
		});
    }
    
    isOtherFile2(file) {
        if (['video', 'audio', 'image'].indexOf(file.file_type) == -1 && ['rar', 'zip'].indexOf(file.ext) == -1) {
            return true;
        } else {
            return false;
        }
    }

    changeSelectProject = (selectedProject) => {
        this.setState({
            selectedProject 
        });
    }

    copyFile2Project = () => {
        const _self = this;
        this.props.dispatch({
            type: 'file/copyFile2Project',
            payload: {
                source_project_id: _self.props.projectActive,
				to_project_id: _self.state.selectedProject,
				doc_id: _self.props.fileInfo.id
            }
        });
    }

    renderSaveFooter() {
		return (
			<div className="file-save-footer">
				<button onClick={this.copyFile2Project}>确定</button>
			</div>
		);
    }
    
    render() {
        const {tabIndex, saveFileModalShow, projectsListTemp, fileInfo, comments, projectActive} = this.props;

        if (!fileInfo) return null;

        let fileSelectCoverImg = fileInfo.cover_img[0];

        if (fileInfo.cover_img.length == 0) {
            if (fileInfo.file_type == 'audio') {
                fileSelectCoverImg = 'mp3.svg';
            }

            if (['zip', 'rar'].indexOf(fileInfo.ext) > -1) {
                fileSelectCoverImg = 'compress.svg';

            }

            if (this.isOtherFile2(fileInfo)) {
                fileSelectCoverImg = 'ext.png';
            }
        }

        let getSize = (size) => {
            if (size >= 1024 && size < Math.pow(1024, 2)) {
                return parseFloat(size / Math.pow(1024, 1)).toFixed(2);  //KB
            }

            if (size >= Math.pow(1024, 2) && size < Math.pow(1024, 3)) {
                return parseFloat(size / Math.pow(1024, 2)).toFixed(2);  //MB
            }

            if (size >= Math.pow(1024, 3) && size < Math.pow(1024, 4)) {
                return parseFloat(size / Math.pow(1024, 3)).toFixed(2);  //GB
            }

            return size;
        };

        return(
            <Modal visible={saveFileModalShow}
                title="保存到其他项目"
                onClose={() => this.toggleSaveFileModal(false)}
                footer={this.renderSaveFooter()}
                >
                <div className="ps-save">
                    <header className="ps-save-header">
                        <div className="ps-save-header-img">
                            {fileInfo.cover_img.length != 0 ? <img src={fileSelectCoverImg} alt=""/> : null}
                            {fileInfo.cover_img.length == 0 ? <Image name={fileSelectCoverImg}> </Image> : null}
                        </div>

                        <div className="psh-content">
                            <p>{fileInfo.name}</p>
                            <div className="psh-content-bottom">
                                <div>
                                    <Image name="save-video.svg"></Image>
                                    <span>{getSize(fileInfo.size)}MB</span>
                                </div>
                                <div>
                                    <Image name="save-comment.svg"></Image>
                                    <span>{comments.length}</span>
                                </div>
                            </div>
                        </div>
                    </header>
                    <section className="ps-save-section">
                        <p className="pss-p">请选择您要保存的位置</p>
                        <ul className="pss-project-list">
                            {projectsListTemp.map((item, k) => {                                
                                return (
                                    <li key={k} onClick={() => this.changeSelectProject(item.id)}>
                                        {this.state.selectedProject == item.id ? <Image name="status-check.svg"></Image> : null}
                                        <span>{item.name}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                </div>
            </Modal>
        );
    }
}

export default SaveModal;