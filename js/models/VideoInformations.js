class VideoInformations
{
    /**
    @type {string}
    */
    filename;

    /**
    @type {Number}
    */
    width;

    /**
    @type {Number}
    */
    height;

    /**
    @type {Number}
    */
    duration; //In seconds

    /**
    @type {Number}
    */
    fps;

    /**
    @public
    @static
    @function fromVideoElement
    @param {string} filename
    @param {HTMLVideoElement} videoElement 
    @returns {VideoInformations}
    */
    static fromVideoElement(filename, videoElement) {
        const videoInformations = new VideoInformations();
        videoInformations.filename = filename;
        videoInformations.width = videoElement.videoWidth || 1920;
        videoInformations.height = videoElement.videoHeight || 1080;
        videoInformations.duration = videoElement.duration || 3600;
        videoInformations.fps = 30; //Unfortunately, FPS is not reported by a video element
        return videoInformations;
    }
}
export default VideoInformations;