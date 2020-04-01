import Video from '../models/Video.js';
import Estimate from '../models/Estimate.js';
import UploadDestination from '../models/UploadDestination.js';
import VideoInformations from '../models/VideoInformations.js';
import ApiKeyProvider from './ApiKeyProvider.js';

class Client {

    /**
    @type {ApiKeyProvider}
    */
    apiKeyProvider;

    /**
    @type {string}
    */
    baseUrl;

    /**
    @param {ApiKeyProvider} apiKeyProvider
    @param {string} baseUrl
    */
    constructor(apiKeyProvider, baseUrl) {
        this.apiKeyProvider = apiKeyProvider;
        this.baseUrl = baseUrl;
    }

    /**
    Get existing videos
    @public
    @async
    @function getVideosAsync
    @returns {Promise<Video[]>}
    */
    async getVideosAsync() {
        const result = await this.sendRequestAsync('GET', 'videos');
        const videos = result.results.map(result => Video.fromResult(result));
        return videos;
    }

    /**
    Get an estimated cost for upload and transcoding a video
    @public
    @async
    @function getUploadEstimate
    @param {VideoInformations} videoInformations
    @returns {Promise<Estimate>}
    */
    async getUploadEstimate(videoInformations) {
        const result = await this.sendRequestAsync('POST', 'videos/aws/estimate', videoInformations);
        const estimate = Estimate.fromResult(result);
        return estimate;
    }

    /**
    Confirms an estimate and get an S3 bucket upload info back
    @public
    @async
    @function confirmEstimateAndGetUploadDestination
    @param {string} estimateId
    @returns {Promise<UploadDestination>}
    */
    async confirmEstimateAndGetUploadDestination(estimateId) {
        const result = await this.sendRequestAsync('POST', `videos/aws/estimate/${estimateId}/bind`);
        const uploadDestination = UploadDestination.fromResult(result);
        return uploadDestination;
    }

    /**
    @public
    @async
    @function updateVideoTitle
    @param {string} videoId
    @param {string} title
    @returns {Promise}
    */
    async updateVideoTitle(videoId, title) {
        await this.sendRequestAsync('PUT', `videos/${videoId}/title`, { title: title });
    }

    /**
    @public
    @async
    @function deleteVideo
    @param {string} videoId
    @returns {Promise}
    */
    async deleteVideo(videoId) {
        await this.sendRequestAsync('DELETE', `videos/${videoId}`);
    }

    /**
    @public
    @async
    @function signCanonicalRequest
    @param {string} estimateId
    @param {string} canonicalRequest
    @returns {Promise<string>}
    */
    async signCanonicalRequest(estimateId, canonicalRequest) {
        const { result } = await this.sendRequestAsync('POST', `videos/aws/estimate/${estimateId}/sign`, {canonicalRequest: canonicalRequest});
        return result;
    }

    /**
    @private
    @async
    @function sendRequestAsync
    @param {string} method
    @param {string} path
    @param {any|undefined} payload
    @returns {Promise<any>}
    */
    async sendRequestAsync(method, path, payload) {
        const apiKey = await this.apiKeyProvider.get();
        method = method.toUpperCase();
        const url = this.baseUrl + path;
        const options = {
            method: method,
            cache: 'no-cache',
            headers: {
                Authorization: `ApiKey ${apiKey}`
            }
        };
        if (method !== 'GET' && payload) {
            options.body = JSON.stringify(payload);
            options.headers['Content-Type'] = 'application/json';
        }
        const response = await fetch(url, options);
        if (!response.ok) {
            switch (response.status) {
                case 401:
                    throw 'Your request to the Civicam REST API was not auhtorized: please use a valid API Key.';
                default:
                    throw `An error occurred during the request to the Civicam REST API: ${response.status} ${response.statusText}`;
            }
        }
        if (response.headers.has('Content-Type') && response.headers.get('Content-Type').includes('json')) {
            return await response.json();
        }
        return await response.text();
    }
}

export default Client