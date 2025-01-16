# Text-to-Speech

A userscript that adds text-to-speech functionality to any webpage. Select text to have it read aloud.

## Features

- Automatically detects text selection
- Uses browser's preferred language
- Play/Pause/Resume controls

## Technical Notes

### SpeechSynthesisUtterance API

The script utilizes the Javascript Web Speech API's [SpeechSynthesisUtterance](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance) interface for text-to-speech functionality. Here's a detailed breakdown of the key components:

#### Core Objects

```javascript
const speech = window.speechSynthesis;
const utterance = new SpeechSynthesisUtterance(text);
```

#### Utterance Properties

- `utterance.text`: The text to be spoken
- `utterance.lang`: Language of the speech (e.g., "en-US", "es-ES")
- `utterance.voice`: The SpeechSynthesisVoice to use
- `utterance.volume`: Volume from 0 to 1 (default: 1)
- `utterance.rate`: Speech rate from 0.1 to 10 (default: 1)
- `utterance.pitch`: Pitch from 0 to 2 (default: 1)

#### Event Handlers

```javascript
utterance.onstart = () => { /* Speech starts */ }
utterance.onend = () => { /* Speech ends */ }
utterance.onpause = () => { /* Speech is paused */ }
utterance.onresume = () => { /* Speech resumes */ }
utterance.onerror = (event) => { /* Error occurs */ }
```

### Voice Selection

The script implements a sophisticated voice selection system:

```javascript
const voices = speechSynthesis.getVoices();
const preferredVoice = voices.find(voice => 
  voice.lang.toLowerCase() === preferredLanguage.toLowerCase()
);
```

1. First attempts exact language match
2. Falls back to base language match
3. Defaults to system voice if no match found

## Browser Compatibility

The Web Speech API is supported in:
- Chrome 33+
- Edge 14+
- Safari 7+
- Firefox 49+
- Opera 21+

## Known Limitations

1. Speech synthesis quality varies by browser and the host system
2. Voice availability depends on system language packs
3. Some browsers limit speech duration
4. Mobile browser support may be limited

## Troubleshooting

Common issues and solutions:

1. **No Sound**
   - Check system volume
   - Verify browser permissions
   - Ensure voice pack is installed

2. **Wrong Language**
   - Check browser language settings
   - Install appropriate language pack
   - Verify voice availability

3. **Performance Issues**
   - Reduce text selection size
   - Adjust speech rate
   - Check browser load

