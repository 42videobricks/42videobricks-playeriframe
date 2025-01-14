# 42Videobricks Player

A lightweight JavaScript library for controlling 42Videobricks video player iframes. This library provides a simple interface for video playback control, event handling, and player state management.

## Installation

```bash
npm install @42videobricks/42videobricks-playeriframe@latest
```

Or via CDN:
```html
<script src="https://unpkg.com/@42videobricks/42videobricks-playeriframe/dist/index.min.js"></script>
```

## Quick Start

```html
<iframe 
    id="myPlayer"
    src="https://stream.42videobricks.com/WWhUSEJqbHRLeVR5MlVPOA==/player"
    width="640" 
    height="360"    
    allow="autoplay; fullscreen"
    allowfullscreen>
</iframe>

<script>
    const iframe = document.getElementById('myPlayer');
    const player = new Api42Videobricks(iframe);

    player.onReady(() => {
        player.play();
    });
</script>
```

## Usage

### Initialize Player

```javascript
const player = new Api42Videobricks(iframeElement, {
    origin: '*' // Use '*' for development
});
```

### Basic Controls

```javascript
// Playback
player.play();
player.pause();

// Volume
player.mute();
player.unmute();
player.setSound(0.5); // 0 to 1

// Navigation
player.rewind(10); // Rewind 10 seconds
player.forward(10); // Forward 10 seconds

// Fullscreen if the user interacted with the player beforehand
player.enterFullscreen();
player.leaveFullscreen();
```

### Event Handling

```javascript
player.onReady(() => {
    console.log('Player is ready');
});

player.on('videoPlaying', () => {
    console.log('Video started playing');
});

player.on('videoPaused', () => {
    console.log('Video paused');
});

player.on('videoEnded', () => {
    console.log('Video ended');
});
```

### Async Methods

```javascript
async function getPlayerInfo() {
    const videoInfo = await player.getVideoInfos();
    const currentTime = await player.getCurrentTime();
    const quality = await player.getQuality();
    const volume = await player.getSound();
}
```

## API Reference

### Constructor

```javascript
new Api42Videobricks(element, options)
```

- `element`: HTMLIFrameElement
- `options`: Object
    - `origin`: string (default: '*')

### Methods

#### Player Controls
- `play()`: Start playback
- `pause()`: Pause playback
- `mute()`: Mute audio
- `unmute()`: Unmute audio
- `setSound(value)`: Set volume (0-1)
- `setLoop(value)`: Set loop state
- `enterFullscreen()`: Enter fullscreen
- `leaveFullscreen()`: Exit fullscreen
- `rewind(duration)`: Rewind video
- `forward(duration)`: Forward video

#### Event Handling
- `onReady(callback)`: Register ready callback
- `on(eventName, callback)`: Add event listener
- `off(eventName, callback)`: Remove event listener

#### Async Getters
- `getVideoInfos()`
- `getCurrentTime()`
- `getLoop()`
- `getSound()`
- `getQuality()`
- `getQualities()`

### Events

- `canPlay`: Video can playing
- `error`: Video on error
- `qualityChange`: Quality changes
- `timeUpdate`: Playback position changes
- `videoEnded`: Video playback ends
- `videoPaused`: Video is paused
- `videoPlaying`: Video start playing
- `volumeChange`: Volume changes


## Known Limitations

### Autoplay & Unmute
On some browsers (like Chrome), trying to unmute (`unmute()`) without user interaction can automatically pause the video. Refer to [the official documentation](https://goo.gl/xX8pDD) for more details.

### Fullscreen
Entering fullscreen mode (`enterFullscreen()`) requires an explicit user gesture (e.g., click or key press). Otherwise, the following error will be thrown:  
`Failed to execute ‘requestFullscreen’ on ‘Element’: API can only be initiated by a user gesture.`


## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT © Alchimie

