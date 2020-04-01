class Video
{
    /**
    @type {string}
    */
    id;

    /**
    @type {string}
    */
    title;

    /**
    @type {boolean}
    */
    ready;

    /**
    @type {any}
    */
    result;

    /**
    @public
    @static
    @function fromResult
    @param {any} result
    @returns {Video}
    */
    static fromResult(result) {
        const video = new Video();
        video.id = result.id;
        video.title = result.title;
        video.ready = result.source !== null;
        video.result = result;
        return video;
    }
}
export default Video;