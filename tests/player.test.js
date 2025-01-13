// tests/player.test.js
const PlayerIframe = require('../src');


describe('PlayerIframe test private functions', () => {
    let iframe;
    let playerIframe;

    beforeEach(() => {
        // Créer un élément iframe simulé
        iframe = document.createElement('iframe');
        postMessageMock = jest.fn();

        // Simuler contentWindow avec postMessage
        Object.defineProperty(iframe, 'contentWindow', {
            value: {
                postMessage: postMessageMock
            },
            writable: true
        });

        // Initialiser PlayerIframe avec l'iframe simulé
        playerIframe = new PlayerIframe(iframe, {origin: '*'});
    });

    test('should call postMessage with type CHECK_READY when iframe loads', () => {
        // Simuler le chargement de l'iframe
        const loadEvent = new Event('load');
        iframe.dispatchEvent(loadEvent);

        // Vérifier que postMessage a été appelé avec les bons arguments
        expect(postMessageMock).toHaveBeenCalledWith(
            {type: 'CHECK_READY'},
            '*'
        );
    });
});

describe('PlayerIframe Event', () => {
    let player;
    let postMessageMock;
    let iframe

    beforeEach(() => {
        iframe = document.createElement('iframe');
        postMessageMock = jest.fn();

        // Simuler contentWindow avant l'initialisation
        Object.defineProperty(iframe, 'contentWindow', {
            value: {
                postMessage: postMessageMock
            },
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

    test('should throw an error onReady', () => {

        expect(() => {
            player.onReady("test");
        }).toThrow('Callback must be a function');
    });

    test('should throw an error on', () => {
        expect(() => {
            player.on("play", "test");
        }).toThrow('Callback must be a function');
    });


    test('should handle event subscription', () => {
        const callback = jest.fn();
        const event = new Event('message');

        Object.defineProperty(event, 'data', {
            value: {type: 'play', data: {}}
        });

        player.on('play', callback);
        window.dispatchEvent(event);

        expect(callback).toHaveBeenCalled();
    });


});


describe('PlayerIframe Action', () => {
    let player;
    let postMessageMock;
    let iframe

    beforeEach(() => {
        iframe = document.createElement('iframe');
        postMessageMock = jest.fn();

        // Simuler contentWindow avant l'initialisation
        Object.defineProperty(iframe, 'contentWindow', {
            value: {
                postMessage: postMessageMock
            },
            writable: true
        });

        player = new PlayerIframe(iframe);
    });


    const testCases = [
        {method: 'play', action: 'play'},
        {method: 'pause', action: 'pause'},
        {method: 'mute', action: 'mute'},
        {method: 'unmute', action: 'unmute'},
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
                player[method](content);
            } else {
                player[method]();
            }
            expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith(
                {action, data: data},
                '*'
            );
        });
    });

    test('should throw on setSound error', () => {
        expect(() => {
            player.setSound("test");
        }).toThrow('Volume must be a number between 0 and 1');
    });

    test('should throw on setSound negative', () => {
        expect(() => {
            player.setSound(-1);
        }).toThrow('Volume must be a number between 0 and 1');
    });

    test('should throw on setSound greater 1', () => {
        expect(() => {
            player.setSound(1.1);
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
        let div = document.createElement('div');
        expect(() => {
            new PlayerIframe(div)
        }).toThrow('Element must be an iframe');
    });
});

describe('PlayerIframe - get Infos', () => {
    let iframe;
    let postMessageMock;
    let playerIframe;

    beforeEach(() => {
        // Créer un élément iframe simulé
        iframe = document.createElement('iframe');
        postMessageMock = jest.fn();

        // Simuler contentWindow avec postMessage
        Object.defineProperty(iframe, 'contentWindow', {
            value: {
                postMessage: postMessageMock
            },
            writable: true
        });

        // Initialiser PlayerIframe avec l'iframe simulé
        playerIframe = new PlayerIframe(iframe, {origin: '*'});
    });

    const testCases = [
        {method: 'getVideoInfos', mock: {id: '123', title: 'Test Video'}},
        {method: 'getCurrentTime', mock: {currentTime: 10}},
        {method: 'getSound', mock: {volume: 0.8}},
        {method: 'getLoop', mock: {loop: true}},
        {
            method: 'getQuality', mock: {
                bandwidth: 2173000, codecs: "avc1.64001f", firstFrame: 0,
                frameRate: 25, width: 1280, height: 2275, available: true
            }
        },
    ]


    testCases.forEach(({method, mock}) => {
        test(`should resolve with ${method} information when the correct message is received`, async () => {
            // Simuler la réponse du message
            const messageHandler = jest.fn();
            window.addEventListener = jest.fn((event, handler) => {
                if (event === 'message') {
                    messageHandler.mockImplementation(handler);
                }
            });

            // Appeler getVideoInfos
            const functionInfos = playerIframe[method]();

            // Simuler l'envoi du message 'getVideoInfos'
            expect(postMessageMock).toHaveBeenCalledWith(
                {action: method, data: null},
                '*'
            );

            // Simuler un événement message avec les données attendues
            const messageEvent = new MessageEvent('message', {
                data: {type: method, data: mock}
            });

            messageHandler(messageEvent);

            // Vérifier que la promesse se résout avec les bonnes données
            await expect(functionInfos).resolves.toEqual(mock);
        });
    });
});