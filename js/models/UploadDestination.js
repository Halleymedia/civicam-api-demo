class UploadDestination
{
    /**
    @type {string}
    */
    region;

    /**
    @type {string}
    */
    bucket;

    /**
    @type {string}
    */
    accessKey;

    /**
    @type {string}
    */
    objectKey; //In seconds

    /**
    @type {string}
    */
    signatureVersion;

    /**
    @type {string}
    */
   videoId;

    /**
    @public
    @static
    @function fromResult
    @param {any} result
    @returns {UploadDestination}
    */
    static fromResult(result) {
        const uploadDestination = new UploadDestination();
        uploadDestination.region = result.region;
        uploadDestination.bucket = result.bucket;
        uploadDestination.accessKey = result.accessKey;
        uploadDestination.objectKey = result.objectKey;
        uploadDestination.signatureVersion = result.signatureVersion;
        uploadDestination.videoId = result.videoId;
        return uploadDestination;
    }
}
export default UploadDestination;