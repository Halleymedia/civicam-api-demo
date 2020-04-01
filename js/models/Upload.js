import VideoInformations from './VideoInformations.js';
import Estimate from './Estimate.js';

class Upload
{
    /**
    @type {string}
    */
    filename;

    /**
    @type {Number|null}
    */
    percentage = null;

    /**
    @type {Number|null}
    */
    speed = null;

    /**
    @type {string|null}
    */
    remaining = null;

    /**
    @type {VideoInformations}
    */
    videoInformations;

    /**
    @type {Estimate}
    */
    estimate;

    /**
    @param {File} file
    */
    constructor(file) {
        this.filename = file.name;
    }
}
export default Upload;