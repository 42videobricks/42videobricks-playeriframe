// Types et interfaces
interface PlayerOptions {
    origin?: string;
}

interface MessageEvent {
    type?: string;
    data?: any;
    origin?: string;
}

interface VideoData {
    type: string;
    data: any;
}

interface CommandData {
    action: string;
    data?: any;
}

export default class PlayerIframe {
    #window: Window;
    #element: HTMLIFrameElement;
    #pendingSubscriptions: Set<string>;
    #isIframeReady: boolean;
    #readyCallbacks: Array<() => void>;
    #listeners: Map<string, Set<(data: any) => void>>;
    #origin: string;

    /**
     * @param {HTMLIFrameElement} element - The iframe element
     * @param {PlayerOptions} options - Configuration options
     */
    constructor(element: HTMLIFrameElement, options: PlayerOptions = {origin: '*'}) {
        if (!(element instanceof HTMLIFrameElement)) {
            throw new TypeError('Element must be an iframe');
        }
        this.#window = element.ownerDocument.defaultView!;
        this.#element = element;
        this.#origin = options.origin || '*';
        this.#listeners = new Map();
        this.#pendingSubscriptions = new Set();
        this.#isIframeReady = false;
        this.#readyCallbacks = [];

        this.#initializeEventListeners();
    }

    #initializeEventListeners(): void {
        this.#element.addEventListener('load', this.#checkIframeReady.bind(this));

        window.addEventListener('message', (event: MessageEvent) => {
            if (this.#origin !== '*' && event.origin !== this.#origin) return;
            const {type, data} = event.data || {};
            if (!type && !data ) {
                /* @__PURE__ */
                console.log('Received message:', type, data);//cas pour les tests unitaire
            }
            if (type === 'IFRAME_READY') {
                this.#handleIframeReady();
            } else if (type) {
                this.#emit(type, data);
            }
        });
    }


    #checkIframeReady(): void {
        this.#element.contentWindow?.postMessage({
            type: 'CHECK_READY'
        }, this.#origin);
    }

    #handleIframeReady(): void {
        this.#isIframeReady = true;
        this.#pendingSubscriptions.forEach(eventName => {
            this.#sendSubscription(eventName);
        });
        this.#pendingSubscriptions.clear();
        this.#readyCallbacks.forEach(callback => callback());
        this.#readyCallbacks = [];
    }

    /**
     * @param {() => void} callback - Function to call when iframe is ready
     */
    onReady(callback: () => void): void {
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
     * @param {(data: any) => void} callback - Event handler function
     * @returns {() => void} Unsubscribe function
     */
    on(eventName: string, callback: (data: any) => void): () => void {
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

        this.#listeners.get(eventName)?.add(callback);
        return () => this.off(eventName, callback);
    }

    /**
     * @param {string} eventName - Name of the event to unsubscribe from
     * @param {(data: any) => void} callback - Event handler function to remove
     */
    off(eventName: string, callback: (data: any) => void): void {
        const callbacks = this.#listeners.get(eventName);
        if (callbacks) {
            callbacks.delete(callback);
            if (callbacks.size === 0) {
                this.#listeners.delete(eventName);
                this.#sendUnsubscription(eventName);
            }
        }
    }

    #sendSubscription(eventName: string): void {
        this.#element.contentWindow?.postMessage({
            type: 'subscribe',
            eventName
        }, this.#origin);
    }

    #sendUnsubscription(eventName: string): void {
        this.#element.contentWindow?.postMessage({
            type: 'unsubscribe',
            eventName
        }, this.#origin);
    }

    #emit(eventName: string, data: any): void {
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
    play(): void {
        return this.#sendCommand('play');
    }

    pause(): void {
        return this.#sendCommand('pause');
    }

    mute(): void {
        return this.#sendCommand('mute');
    }

    unmute(): void {
        return this.#sendCommand('unmute');
    }

    reloadIframe(): void {
        return this.#sendCommand('reloadIframe');
    }

    /**
     * @param {number} value - Volume level between 0 and 1
     */
    setSound(value: number): void {
        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) {
            throw new RangeError('Volume must be a number between 0 and 1');
        }
        return this.#sendCommand('setSound', {volume: value});
    }

    /**
     * @param {boolean} value - Loop state
     */
    setLoop(value: boolean): void {
        return this.#sendCommand('setLoop', {loop: !!value});
    }

    enterFullscreen(): void {
        return this.#sendCommand('enterFullscreen');
    }

    leaveFullscreen(): void {
        return this.#sendCommand('leaveFullscreen');
    }

    /**
     * @param {number} duration - Duration to rewind in seconds
     */
    rewind(duration: number = 10): void {
        return this.#sendCommand('rewind', {duration});
    }

    /**
     * @param {number} duration - Duration to forward in seconds
     */
    forward(duration: number = 10): void {
        return this.#sendCommand('forward', {duration});
    }

    #sendCommand(action: string, data: any = null): void {
        this.#element.contentWindow?.postMessage({
            action,
            data
        }, this.#origin);
    }

    // Async getter methods
    async #requestVideoData<T>(type: string): Promise<T> {
        return new Promise((resolve) => {
            const handler = (event: MessageEvent) => {
                if (event.data?.type === type) {
                    window.removeEventListener('message', handler);
                    resolve(event.data.data);
                }
            };
            window.addEventListener('message', handler);
            this.#sendCommand(type);
        });
    }

    getVideoInfos<T>(): Promise<T> {
        return this.#requestVideoData<T>('getVideoInfos');
    }

    getCurrentTime(): Promise<number> {
        return this.#requestVideoData<number>('getCurrentTime');
    }

    getLoop(): Promise<boolean> {
        return this.#requestVideoData<boolean>('getLoop');
    }

    getSound(): Promise<number> {
        return this.#requestVideoData<number>('getSound');
    }

    getQuality(): Promise<string> {
        return this.#requestVideoData<string>('getQuality');
    }

    getQualities(): Promise<string[]> {
        return this.#requestVideoData<string[]>('getQualities');
    }

    isFullscreen(): Promise<boolean> {
        return this.#requestVideoData<boolean>('isFullscreen');
    }

    // Getter pour permettre le test de la propriété privée
    getOrigin() {
        return this.#origin;
    }
}
