import State from './State.js';
import Client from './Services/Client.js';
import Uploader from './services/Uploader.js';
import Video from './models/Video.js';
import VideoInformations from './models/VideoInformations.js';
import Upload from './models/Upload.js';
import ApiKeyProvider from './services/ApiKeyProvider.js';

class App {

    /**
    @type {State}
    @public
    */
    state;

    /**
    @type {ApiKeyProvider}
    @private
    */
    apiKeyProvider;

    /**
    @type {string}
    @private
    */
    baseUrl;

    /**
    @type {Client}
    @private
    */
    client;

    /**
    @type {Uploader}
    @private
    */
    uploader;

    /**
    @type {Function}
    @private
    */
    elementFactory;

    /**
    @type {URL}
    @private
    */
    urlFactory;

    /**
    @type {function(result:boolean)|null}
    @private
    */
    confirmationModalCallback;


    /**
    @param {ApiKeyProvider} apiKey
    @param {string} baseUrl
    @param {function(elementName:string):HTMLElement} elementFactory
    @param {URL} urlFactory
    */
    constructor(apiKeyProvider, baseUrl, elementFactory, urlFactory) {
        this.apiKeyProvider = apiKeyProvider;
        this.baseUrl = baseUrl;
        this.state = new State();
        this.client = new Client(apiKeyProvider, baseUrl);
        this.uploader = new Uploader();
        this.elementFactory = elementFactory;
        this.urlFactory = urlFactory;
        this.loadVideos();
    }

    /**
    @public
    @async
    @function loadVideos
    @returns {Promise}
    */
    async loadVideos() {
        this.state.videos = null;
        /**
        @type {Video[]}
        */
        const videos = await this.client.getVideosAsync();
        this.state.videos = [...videos];
    }

    /**
    @public
    @async
    @function uploadVideo
    @param {Event} event
    @returns {Promise}
    */
    async uploadVideo(event) {
        const files = event.target.files;
        if (files.length == 0) {
            return;
        }
        const videoFile = files[0];
        this.ensureFileHasSupportedExtension(videoFile);

        //Create a new Upload object
        this.state.upload = new Upload(videoFile);

        //Get duration, width, height and framerate of the video to get a more accurate estimation of upload costs
        this.state.upload.videoInformations = await this.detectVideoInformations(videoFile);
        //For demo purposes, all videos with a duration greater than 5 minutes are rejected
        if (this.state.upload.videoInformations.duration > 5 * 60) {
            await this.completeUpload();
            throw 'For this demo, videos with a duration greater than 5 minutes are rejected';
        }

        //Get an estimate of the upload costs
        this.state.upload.estimate = await this.client.getUploadEstimate(this.state.upload.videoInformations);

        //At this point, you might want to ask the user to approve the estimate
        const estimationApproved = await this.showConfirmationModal(`Depending on the specific license in use, uploading and transcoding this video might incur a cost of ${this.state.upload.estimate.toString()}.`);
        if (!estimationApproved) {
            await this.completeUpload();
            return;
        }

        const uploadDestination = await this.client.confirmEstimateAndGetUploadDestination(this.state.upload.estimate.id);

        //Well, go ahead and start uploading!
        try {
            this.state.upload.progress = 0;
            await this.uploader.uploadVideo(this.client, videoFile, uploadDestination, this.state.upload.estimate.id, this.reportUploadProgress.bind(this));
        } finally {
            //All done, reset the upload property and refresh the video list
            await this.completeUpload();
        }
    }

    /**
    @public
    @async
    @function cancelUpload
    @returns {Promise}
    */
    async cancelUpload() {
        const cancelConfirmation = await this.showConfirmationModal('Are you sure you want to abort the upload of this video? All progress will be lost.');
        if (!cancelConfirmation) {
            return;
        }
        this.uploader.cancel();
    }

    /**
    @public
    @async
    @function playVideo
    @param {Video} video
    @returns {Promise}
    */
    async playVideo(video) {
        await this.showPlayerModal(video.id);
    }

    /**
    @public
    @async
    @function deleteVideo
    @param {Video} video
    @returns {Promise}
    */
    async deleteVideo(video) {
        const deletionConfirmed = await this.showConfirmationModal(`Do you want to remove the video '${video.title}' (ID: ${video.id})?`);
        if (!deletionConfirmed) {
            return;
        }
        await this.client.deleteVideo(video.id);
        const index = this.state.videos.indexOf(video);
        this.state.videos.splice(index, 1);
    }

    /**
    @public
    @function confirmConfirmationModal
    */
    confirmConfirmationModal() {
        this.completeConfirmationModal(true);
    }

    /**
    @public
    @function cancelConfirmationModal
    */
    cancelConfirmationModal() {
        this.completeConfirmationModal(false);
    }

    /**
    @private
    @async
    @function showPlayerModal
    @param {string} videoId
    @returns {Promise}
    */
    async showPlayerModal(videoId) {
        this.state.playerModal.shown = true;
        const apiKey = await this.apiKeyProvider.get();
        this.state.playerModal.src = `${this.baseUrl}embed/webtvplayer.html?apiKey=${apiKey}&videoId=${videoId}`;
    }

    /**
    @public
    @function cancelPlayerModal
    */
    cancelPlayerModal() {
        this.state.playerModal.shown = false;
        this.state.playerModal.src = null;
    }

    /**
    @public
    @asyng
    @function saveEditModal
    */
    async saveEditModal() {
        await this.client.updateVideoTitle(this.state.editModal.video.id, this.state.editModal.title);
        this.state.editModal.video.title = this.state.editModal.title;
        this.cancelEditModal();
    }

    /**
    @public
    @function cancelEditModal
    @param {Video} video
    */
    editVideo(video) {
        this.state.editModal.title = video.title;
        this.state.editModal.video = video;
        this.state.editModal.shown = true;
    }

    /**
    @public
    @function cancelEditModal
    */
    cancelEditModal() {
        this.state.editModal.shown = false;
        this.state.editModal.title = null;
        this.state.editModal.video = null;
    }

    /**
    @private
    @function showConfirmationModal
    @param {string} message
    @returns {Promise}
    */
    showConfirmationModal(message) {
        this.state.confirmationModal.message = message;
        this.state.confirmationModal.shown = true;
        return new Promise((resolve) => {
            this.confirmationModalCallback = resolve;
        });
    }

    /**
    @private
    @function completeConfirmationModal
    @param {boolean} result
    */
    completeConfirmationModal(result) {
        this.state.confirmationModal.shown = false;
        if (this.confirmationModalCallback) {
            this.confirmationModalCallback(result);
        }
    }

    /**
    @private
    @function reportUploadProgress
    @param {Number} percentage
    @param {Number} remainingSeconds
    @param {Number} mbps
    */
    reportUploadProgress(percentage, remainingSeconds, mbps) {
        if (this.state.upload) {
            this.state.upload.percentage = percentage;
            this.state.upload.remaining = this.formatTime(remainingSeconds);
            this.state.upload.speed = mbps;
        }
    }

    /**
    @private
    @function completeUpload
    */
    async completeUpload() {
        this.state.upload = null;
        await this.loadVideos();
    }

    /**
    @private
    @function formatTime
    @param {Number} seconds
    @returns {string}
    */
    formatTime(seconds) {
        if (seconds === undefined || seconds === null || isNaN(seconds) || seconds < 0) {
            return '--:--:--';
        }
        seconds = Math.floor(seconds);
        const hours = Math.floor(seconds / 3600);
        let minutes = Math.floor((seconds / 60) % 60);
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        seconds = seconds % 60;
        if (seconds < 10) {
            seconds = '0' + seconds;
        }
        return `${hours}:${minutes}:${seconds}`;
    }

    /**
    @private
    @function detectVideoInformations
    @param {File} file
    @returns {Promise<VideoInformations>}
    */
    detectVideoInformations(file) {
        return new Promise((resolve, reject) => {
            /**
            @type {HTMLVideoElement}
            */
            const videoElement = this.elementFactory('video');
            videoElement.onerror = () => {
                reject('Non è stato possibile rilevare la dimensione e la durata del video selezionato');
            };
            videoElement.onloadedmetadata = () => {
                this.urlFactory.revokeObjectURL(videoElement.src);
                const videoInformations = VideoInformations.fromVideoElement(file.name, videoElement);
                resolve(videoInformations);
            };
            videoElement.src = this.urlFactory.createObjectURL(file);
        });
    }

    /**
    @private
    @function ensureFileHasSupportedExtension
    @param {File} file
    */
    ensureFileHasSupportedExtension(file) {
        const extension = (file.name || "").split('.').pop().toLowerCase();
        switch (extension) {
            case "mp4":
            case "m4v":
            case "avi":
            case "mpg":
            case "mpeg":
            case "mkv":
            case "mov":
            case "qt":
            case "wmv":
            case "asf":
            case "mxf":
                return;
            default:
                throw `The extension ${extension} is not supported`;
        }
    }
}

export default App;