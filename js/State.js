import Video from './models/Video.js';
import Upload from './models/Upload.js';

class State {
    /**
    @type {Upload|null}
    */
    upload = null;

    /**
    @type {Video[]|null}
    */
    videos = null;

    /**
    @type {{shown:boolean, message:string}}
    */
    confirmationModal = { shown: false, message: null };

    /**
    @type {{shown:boolean, src:string|null}}
    */
    playerModal = { shown: false, src: null };

    /**
    @type {{shown:boolean, title:string|null, video:Video|null}}
    */
    editModal = { shown: false, title: null, video: null };
}
export default State;