class ApiKeyProvider {
    /**
    @type {string|null}
    */
    value;

    /**
    @param {string|null} value
    */
    constructor(value) {
        this.value = value;
    }

    /**
    @private
    @async
    @function get
    @returns {Promise<string>}
    */
    async get() {
        if (this.value) {
            return this.value;
        }
        const response = await fetch('ApiKey.txt');
        if (response.ok) {
            this.value = await response.text();
        }
        if (this.value) {
            return this.value;
        }
        throw 'No API Key was provided: you must set it in the index.html file or inside a file named ApiKey.txt in this project root directory.'
    }
}

export default ApiKeyProvider;