import Vue from './vendor/Vue.js';
import App from './app.js';
import ApiKeyProvider from './services/ApiKeyProvider.js';

class Bootstrapper {
    /**
    @param {string} apiKey
    @param {string} baseUrl
    @param {HTMLElement} rootElement
    @param {HTMLElement} videoPlayerContainer
    */
    static initializeApp(apiKey, baseUrl, rootElement) {
        const apiKeyProvider = new ApiKeyProvider(apiKey);
        const app = new App(apiKeyProvider, baseUrl, elementName => rootElement.ownerDocument.createElement(elementName), rootElement.ownerDocument.defaultView.URL);
        const methods = {};
        for (let name of Object.getOwnPropertyNames(Object.getPrototypeOf(app))) {
            let method = app[name];
            if (!(method instanceof Function) || method === App) continue;
            methods[method.name] = method.bind(app);
        }
        Vue.config.errorHandler = err => { console.error(err); alert(err); };
        new Vue({ el: rootElement, data: app.state, methods: methods });
        return app;
    }
}
export default Bootstrapper;