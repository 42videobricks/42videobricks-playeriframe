import PlayerIframe from "../src";


describe('PlayerIframe test function checkready', () => {
    let iframe: HTMLIFrameElement;
    let playerIframe: PlayerIframe;
    let postMessageMock: jest.Mock;

    beforeEach(() => {
        iframe = document.createElement('iframe');
        postMessageMock = jest.fn();

        Object.defineProperty(iframe, 'contentWindow', {
            value: {postMessage: postMessageMock},
            writable: true
        });

        playerIframe = new PlayerIframe(iframe);
    });

    test('should call postMessage with type CHECK_READY when iframe loads', () => {
        const loadEvent = new Event('load');
        iframe.dispatchEvent(loadEvent);

        expect(postMessageMock).toHaveBeenCalledWith(
            {type: 'CHECK_READY'},
            '*'
        );
    });

    test('should default #origin to "*" if options is not provided', () => {
        expect(playerIframe.getOrigin()).toBe('*');
    });
});

describe('PlayerIframe test function checkready orgin', () => {
    let iframe: HTMLIFrameElement;
    let playerIframe: PlayerIframe;
    let postMessageMock: jest.Mock;

    beforeEach(() => {
        iframe = document.createElement('iframe');
        postMessageMock = jest.fn();

        Object.defineProperty(iframe, 'contentWindow', {
            value: {postMessage: postMessageMock},
            writable: true
        });

        playerIframe = new PlayerIframe(iframe, {origin: 'test'});
    });

    test('should call postMessage with type CHECK_READY when iframe loads', () => {
        const loadEvent = new Event('load');
        iframe.dispatchEvent(loadEvent);

        expect(postMessageMock).toHaveBeenCalledWith(
            {type: 'CHECK_READY'},
            'test'
        );
    });

    test('should set #origin to the provided value', () => {
        expect(playerIframe.getOrigin()).toBe('test');
    });
});

describe('PlayerIframe test function checkready orgin null', () => {
    let iframe: HTMLIFrameElement;
    let playerIframe: PlayerIframe;
    let postMessageMock: jest.Mock;

    beforeEach(() => {
        iframe = document.createElement('iframe');
        postMessageMock = jest.fn();

        Object.defineProperty(iframe, 'contentWindow', {
            value: {postMessage: postMessageMock},
            writable: true
        });

        playerIframe = new PlayerIframe(iframe, {origin: undefined});
    });

    test('should call postMessage with type CHECK_READY when iframe loads', () => {
        const loadEvent = new Event('load');
        iframe.dispatchEvent(loadEvent);

        expect(postMessageMock).toHaveBeenCalledWith(
            {type: 'CHECK_READY'},
            '*'
        );
    });

    test('should set #origin to the provided value', () => {
        expect(playerIframe.getOrigin()).toBe('*');
    });
});

describe('PlayerIframe Event', () => {
    let player: PlayerIframe;
    let postMessageMock: jest.Mock;
    let iframe: HTMLIFrameElement;

    beforeEach(() => {
        iframe = document.createElement('iframe');
        postMessageMock = jest.fn();

        Object.defineProperty(iframe, 'contentWindow', {
            value: {postMessage: postMessageMock},
            writable: true
        });

        player = new PlayerIframe(iframe);
    });

    test('should handle ready event', () => {
        const callback = jest.fn();
        player.onReady(callback);

        const event = new Event('message');
        Object.defineProperty(event, 'data', {
            value: {type: 'IFRAME_READY'}
        });

        window.dispatchEvent(event);
        expect(callback).toHaveBeenCalled();
    });

    it('should handle empty event.data gracefully', () => {
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        // Simulate a message event with no data
        const messageEvent = new MessageEvent('message', {
            origin: '*',
            data: null,
        });

        window.dispatchEvent(messageEvent);
        // Ensure the console log is still called with undefined values
        expect(consoleLogSpy).toHaveBeenCalledWith('Received message:', undefined, undefined);
        consoleLogSpy.mockRestore();
    });

    test('should handle ready event after first', () => {
        const callback = jest.fn();
        player.onReady(callback);

        const event = new Event('message');
        Object.defineProperty(event, 'data', {
            value: {type: 'IFRAME_READY'}
        });
        window.dispatchEvent(event);
        const callbackAfter = jest.fn();
        player.onReady(callbackAfter);
        expect(callbackAfter).toHaveBeenCalled();
    });



    test('should throw an error onReady', () => {
        expect(() => {
            player.onReady("test" as unknown as () => void);
        }).toThrow('Callback must be a function');
    });

    test('should throw an error on', () => {
        expect(() => {
            player.on("play", "test" as unknown as () => void);
        }).toThrow('Callback must be a function');
    });

    test('should handle event subscription ', () => {
        const callback = jest.fn();
        jest.spyOn(player, 'off');
        const event = new Event('message');

        Object.defineProperty(event, 'data', {
            value: {type: 'play', data: {}}
        });

        player.on('play', callback);
        window.dispatchEvent(event);
        expect(callback).toHaveBeenCalled();



    });

    test('should handle event subscription after ready', () => {
        const callback = jest.fn();


        const event = new Event('message');
        const event2 = new Event('message');
        Object.defineProperty(event, 'data', {
            value: {type: 'IFRAME_READY'}
        });

        Object.defineProperty(event2, 'data', {
            value: {type: 'play', data: {}}
        });
        window.dispatchEvent(event);
        player.on('play', callback);
        window.dispatchEvent(event2);
        expect(callback).toHaveBeenCalled();
    });


    test('should handle event unsubscription ', () => {
        const callback = jest.fn();
        const event = new Event('message');
        player.on('play', callback);
        player.off('play', callback);
    });
});

describe('PlayerIframe EventEmitter', () => {
    let player: PlayerIframe;
    let postMessageMock: jest.Mock;
    let iframe: HTMLIFrameElement;

    beforeEach(() => {
        iframe = document.createElement('iframe');
        postMessageMock = jest.fn();

        Object.defineProperty(iframe, 'contentWindow', {
            value: {postMessage: postMessageMock},
            writable: true
        });

        player = new PlayerIframe(iframe);
    });

    it('should log an error when a listener throws', () => {
        // Espionner console.error
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        // Ajouter un écouteur qui lève une erreur
        player.on('play', () => {
            throw new Error('Test error');
        });
        const event = new Event('message');

        Object.defineProperty(event, 'data', {
            value: {type: 'play', data: {}}
        });
        window.dispatchEvent(event);
        // Vérifier que console.error est appelé avec les bons arguments
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error in play listener:',
            expect.any(Error)
        );
        expect(consoleErrorSpy.mock.calls[0][1].message).toBe('Test error');

        // Restaurer le mock de console.error
        consoleErrorSpy.mockRestore();
    });
})

describe('PlayerIframe Action', () => {
    let player: PlayerIframe;
    let postMessageMock: jest.Mock;
    let iframe: HTMLIFrameElement;

    beforeEach(() => {
        iframe = document.createElement('iframe');
        postMessageMock = jest.fn();

        Object.defineProperty(iframe, 'contentWindow', {
            value: {postMessage: postMessageMock},
            writable: true
        });

        player = new PlayerIframe(iframe);
    });

    const testCases = [
        {method: 'play', action: 'play'},
        {method: 'pause', action: 'pause'},
        {method: 'mute', action: 'mute'},
        {method: 'unmute', action: 'unmute'},
        {method: 'getQualities', action: 'getQualities'},

        {method: 'reloadIframe', action: 'reloadIframe'},
        {method: 'rewind', action: 'rewind', data: {duration: 10}},
        {method: 'forward', action: 'forward', data: {duration: 10}},
        {method: 'setSound', action: 'setSound', content: 0.8, data: {volume: 0.8}},
        {method: 'setLoop', action: 'setLoop', content: true, data: {loop: true}},
        {method: 'enterFullscreen', action: 'enterFullscreen'},
        {method: 'leaveFullscreen', action: 'leaveFullscreen'},
        {method: 'isFullscreen', action: 'isFullscreen'},
    ];

    testCases.forEach(({method, action, content = null, data = null}) => {
        test(`should send ${action} command`, () => {
            if (content !== null) {
                (player as any)[method](content);
            } else {
                (player as any)[method]();
            }
            expect(postMessageMock).toHaveBeenCalledWith(
                {action, data: data},
                '*'
            );
        });
    });

    test('should throw on setSound error', () => {
        expect(() => {
            player.setSound("test" as unknown as number);
        }).toThrow('Volume must be a number between 0 and 1');
    });

    test('should handle async video data requests', (done) => {
        const mockData = {duration: 120};

        player.getVideoInfos().then(result => {
            expect(result).toEqual(mockData);
            done();
        });

        const event = new Event('message');
        Object.defineProperty(event, 'data', {
            value: {type: 'getVideoInfos', data: mockData}
        });

        window.dispatchEvent(event);
    });
});

describe('PlayerIframe Erreur element', () => {
    test('should throw an error for iframe', () => {
        const div = document.createElement('div');
        expect(() => {
            new PlayerIframe(div as unknown as HTMLIFrameElement);
        }).toThrow('Element must be an iframe');
    });
});

describe('PlayerIframe - get Infos', () => {
    let iframe: HTMLIFrameElement;
    let postMessageMock: jest.Mock;
    let playerIframe: PlayerIframe;

    beforeEach(() => {
        iframe = document.createElement('iframe');
        postMessageMock = jest.fn();

        Object.defineProperty(iframe, 'contentWindow', {
            value: {postMessage: postMessageMock},
            writable: true
        });

        playerIframe = new PlayerIframe(iframe, {origin: '*'});
    });

    const testCases = [
        {method: 'getVideoInfos', mock: {id: '123', title: 'Test Video'}},
        {method: 'getCurrentTime', mock: {currentTime: 10}},
        {method: 'getSound', mock: {volume: 0.8}},
        {method: 'getLoop', mock: {loop: true}},
        {
            method: 'getQuality',
            mock: {
                bandwidth: 2173000, codecs: "avc1.64001f", firstFrame: 0,
                frameRate: 25, width: 1280, height: 2275, available: true
            }
        },
    ];

    testCases.forEach(({method, mock}) => {
        test(`should resolve with ${method} information when the correct message is received`, async () => {
            const messageHandler = jest.fn();
            window.addEventListener = jest.fn((event, handler) => {
                if (event === 'message') {
                    messageHandler.mockImplementation(handler as EventListener);
                }
            });

            const functionInfos = (playerIframe as any)[method]();

            expect(postMessageMock).toHaveBeenCalledWith(
                {action: method, data: null},
                '*'
            );

            const messageEvent = new MessageEvent('message', {
                data: {type: method, data: mock}
            });

            messageHandler(messageEvent);

            await expect(functionInfos).resolves.toEqual(mock);
        });
    });
});
