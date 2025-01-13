// index.js
const PlayerIframe = (function () {
    class PlayerIframe {
        #window;
        #element;
        #pendingSubscriptions;
        #isIframeReady;
        #readyCallbacks;
        #listeners;
        #origin;

        /**
         * @param {HTMLIFrameElement} element - The iframe element
         * @param {Object} options - Configuration options
         * @param {string} [options.origin='*'] - The allowed origin for postMessage
         */
        constructor(element, options = {origin: '*'}) {
            if (!(element instanceof HTMLIFrameElement)) {
                throw new TypeError('Element must be an iframe');
            }

            this.#window = element.ownerDocument.defaultView;
            this.#element = element;
            this.#origin = options.origin;
            this.#listeners = new Map();
            this.#pendingSubscriptions = new Set();
            this.#isIframeReady = false;
            this.#readyCallbacks = [];

            this.#initializeEventListeners();
        }

        #initializeEventListeners() {
            this.#element.addEventListener('load', this.#checkIframeReady.bind(this));

            window.addEventListener('message', (event) => {
                if (this.#origin !== '*' && event.origin !== this.#origin) return;

                const {type, data} = event.data || {};
                if (type === 'IFRAME_READY') {
                    this.#handleIframeReady();
                } else if (type) {
                    this.#emit(type, data);
                }
            });
        }

        #checkIframeReady() {
            this.#element.contentWindow?.postMessage({
                type: 'CHECK_READY'
            }, this.#origin);
        }

        #handleIframeReady() {
            this.#isIframeReady = true;
            this.#pendingSubscriptions.forEach(eventName => {
                this.#sendSubscription(eventName);
            });
            this.#pendingSubscriptions.clear();
            this.#readyCallbacks.forEach(callback => callback());
            this.#readyCallbacks = [];
        }

        /**
         * @param {Function} callback - Function to call when iframe is ready
         */
        onReady(callback) {
            if (typeof callback !== 'function') {
                throw new TypeError('Callback must be a function');
            }

            if (this.#isIframeReady) {
                callback();
            } else {
                this.#readyCallbacks.push(callback);
            }
        }

        /**
         * @param {string} eventName - Name of the event to listen to
         * @param {Function} callback - Event handler function
         * @returns {Function} Unsubscribe function
         */
        on(eventName, callback) {
            if (typeof callback !== 'function') {
                throw new TypeError('Callback must be a function');
            }

            if (!this.#listeners.has(eventName)) {
                this.#listeners.set(eventName, new Set());
                if (this.#isIframeReady) {
                    this.#sendSubscription(eventName);
                } else {
                    this.#pendingSubscriptions.add(eventName);
                }
            }

            this.#listeners.get(eventName).add(callback);
            return () => this.off(eventName, callback);
        }

        #sendSubscription(eventName) {
            this.#element.contentWindow?.postMessage({
                type: 'subscribe',
                eventName
            }, this.#origin);
        }

        #sendUnsubscription(eventName) {
            this.#element.contentWindow?.postMessage({
                type: 'unsubscribe',
                eventName
            }, this.#origin);
        }

        #emit(eventName, data) {
            const callbacks = this.#listeners.get(eventName);
            callbacks?.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${eventName} listener:`, error);
                }
            });
        }

        // Player control methods
        play() {
            return this.#sendCommand('play');
        }

        pause() {
            return this.#sendCommand('pause');
        }

        mute() {
            return this.#sendCommand('mute');
        }

        unmute() {
            return this.#sendCommand('unmute');
        }

        /**
         * @param {number} value - Volume level between 0 and 1
         */
        setSound(value) {
            if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) {
                throw new RangeError('Volume must be a number between 0 and 1');
            }
            return this.#sendCommand('setSound', {volume: value});
        }

        /**
         * @param {boolean} value - Loop state
         */
        setLoop(value) {
            return this.#sendCommand('setLoop', {loop: !!value});
        }

        enterFullscreen() {
            return this.#sendCommand('enterFullscreen');
        }

        leaveFullscreen() {
            return this.#sendCommand('leaveFullscreen');
        }



        /**
         * @param {number} [duration=10] - Duration to rewind in seconds
         */
        rewind(duration = 10) {
            return this.#sendCommand('rewind', {duration});
        }

        /**
         * @param {number} [duration=10] - Duration to forward in seconds
         */
        forward(duration = 10) {
            return this.#sendCommand('forward', {duration});
        }

        #sendCommand(action, data = null) {
            this.#element.contentWindow?.postMessage({
                action,
                data
            }, this.#origin);
        }

        // Async getter methods
        async #requestVideoData(type) {
            return new Promise((resolve) => {
                const handler = (event) => {
                    if (event.data?.type === type) {
                        window.removeEventListener('message', handler);
                        resolve(event.data.data);
                    }
                };
                window.addEventListener('message', handler);
                this.#sendCommand(type);
            });
        }

        getVideoInfos() {
            return this.#requestVideoData('getVideoInfos');
        }

        getCurrentTime() {
            return this.#requestVideoData('getCurrentTime');
        }

        getLoop() {
            return this.#requestVideoData('getLoop');
        }

        getSound() {
            return this.#requestVideoData('getSound');
        }

        getQuality() {
            return this.#requestVideoData('getQuality');
        }

        getQualities() {
            return this.#requestVideoData('getQualities');
        }
        isFullscreen() {
            return this.#requestVideoData('isFullscreen');
        }
    }

    return PlayerIframe;
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlayerIframe;
}