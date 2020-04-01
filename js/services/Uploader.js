import Evaporate from '../vendor/Evaporate.js';
import UploadDestination from '../models/UploadDestination.js';
import Client from './Client.js';
import Md5 from '../vendor/Md5.js'; 
import Sha256 from '../vendor/Sha256.js'; 
class Uploader
{
    /**
    @private
    @type {Evaporate|null}
    */
    evaporate;

    /**
    @public
    @async
    @function uploadVideo
    @param {Client} client
    @param {File} file
    @param {UploadDestination} destination
    @param {string} estimateId
    @param {function(percentage: Number, remaningSeconds: Number)} progressCallback
    @returns {Promise}
    */
    async uploadVideo(client, file, destination, estimateId, progressCallback) {

        const uploadParams = this.createUploadParams(file, destination, progressCallback);
        this.evaporate = await this.createEvaporate(client, destination, estimateId);
        await this.evaporate.add(uploadParams); //Upload starts here
    }

    /**
    @private
    @function createUploadParams
    @param {File} file
    @param {UploadDestination} destination
    @param {function(percentage: Number, remaningSeconds: Number)} progressCallback
    @returns {any}
    */
    createUploadParams(file, destination, progressCallback) {
        return {
            name: destination.objectKey,
            file: file,
            progress: (progress, stats) => progressCallback(Math.floor(progress * 1000)/10, stats.secondsLeft, Math.floor(stats.speed/1024/1024*10)/10)
        };
    }

    /**
    @private
    @async
    @function createEvaporate
    @param {Client} client
    @param {File} file
    @param {UploadDestination} destination
    @param {string} estimateId
    @param {function(percentage: Number)} progressCallback
    @returns {Promise<Evaporate>}
    */
    async createEvaporate(client, destination, estimateId) {
        return await Evaporate.create({
            aws_key: destination.accessKey,
            bucket: destination.bucket,
            awsRegion: destination.region,
            awsSignatureVersion: destination.signatureVersion,
            computeContentMd5: true,
            logging: false,
            customAuthMethod: this.performCustomAuthentication.bind(this, client, estimateId),
            cryptoMd5Method: data => Md5.base64(data),
            cryptoHexEncodedHash256: data => Sha256.hex(data)
        })
    }


    /**
    @public
    @function cancel
    */
    cancel() {
        this.evaporate = true;
        if (this.evaporate) {
            //this.evaporate.cancel();
        }
    }

    /**
    @private
    @async
    @function performCustomAuthentication
    @param {Client} client
    @param {string} estimateId
    @param {string} signParams
    @param {string} signHeaders
    @param {string} stringToSign
    @param {string} dateString
    @param {string} canonicalRequest
    @returns {Promise<string>}
    */
    async performCustomAuthentication(client, estimateId, signParams, signHeaders, stringToSign, dateString, canonicalRequest) {
        return await client.signCanonicalRequest(estimateId, canonicalRequest);
    }
}
export default Uploader;