const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class AudioService {
  constructor() {
    this.client = null;
    this.initializeClient();
  }

  async initializeClient() {
    try {
      if (process.env.GOOGLE_CLOUD_TTS_KEY_FILE && process.env.GOOGLE_CLOUD_PROJECT_ID) {
        this.client = new textToSpeech.TextToSpeechClient({
          keyFilename: process.env.GOOGLE_CLOUD_TTS_KEY_FILE,
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
        });
      }
    } catch (error) {
      console.error('Failed to initialize Google Cloud TTS client:', error);
      this.client = null;
    }
  }

  async generateAudio(text, options = {}) {
    const {
      voice = 'en-US-Wavenet-F', // Female voice good for children's stories
      speed = 0.9,
      language = 'en-US'
    } = options;

    try {
      if (this.client) {
        return await this.generateWithGoogleTTS(text, voice, speed, language);
      } else {
        return await this.generateFallbackAudio(text);
      }
    } catch (error) {
      console.error('Audio generation failed:', error);
      return await this.generateFallbackAudio(text);
    }
  }

  async generateWithGoogleTTS(text, voice, speed, language) {
    try {
      const request = {
        input: { text: text },
        voice: {
          languageCode: language,
          name: voice,
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: speed,
          pitch: 0,
          volumeGainDb: 0
        }
      };

      const [response] = await this.client.synthesizeSpeech(request);
      
      // Save to temporary file
      const fileName = `audio_${uuidv4()}.mp3`;
      const filePath = path.join(__dirname, '../temp', fileName);
      
      // Ensure temp directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      
      await fs.writeFile(filePath, response.audioContent, 'binary');
      
      return {
        filePath: filePath,
        fileName: fileName,
        service: 'google-tts',
        duration: this.estimateDuration(text)
      };
    } catch (error) {
      console.error('Google TTS error:', error);
      throw error;
    }
  }

  async generateFallbackAudio(text) {
    // For now, return a placeholder. In a real app, you might:
    // 1. Use a different TTS service
    // 2. Generate a silent audio file
    // 3. Use browser's Web Speech API on frontend
    
    return {
      filePath: null,
      fileName: null,
      service: 'fallback',
      duration: this.estimateDuration(text),
      placeholder: true,
      message: 'Audio generation not available - using fallback'
    };
  }

  async generateBatch(textArray, options = {}) {
    const results = [];
    
    for (let i = 0; i < textArray.length; i++) {
      try {
        console.log(`Generating audio ${i + 1}/${textArray.length}`);
        const result = await this.generateAudio(textArray[i], options);
        results.push(result);
        
        // Add delay to avoid rate limiting
        if (i < textArray.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Failed to generate audio ${i + 1}:`, error);
        results.push(await this.generateFallbackAudio(textArray[i]));
      }
    }
    
    return results;
  }

  estimateDuration(text) {
    // Rough estimation: average reading speed is about 150 words per minute
    const wordCount = text.split(' ').length;
    const wordsPerSecond = 150 / 60; // 2.5 words per second
    return Math.ceil(wordCount / wordsPerSecond);
  }

  async cleanupTempFiles(filePaths) {
    for (const filePath of filePaths) {
      try {
        if (filePath && !filePath.includes('placeholder')) {
          await fs.unlink(filePath);
        }
      } catch (error) {
        console.error('Error cleaning up temp file:', filePath, error);
      }
    }
  }

  getVoiceOptions() {
    return [
      { name: 'en-US-Wavenet-F', language: 'en-US', gender: 'FEMALE', description: 'Warm female voice' },
      { name: 'en-US-Wavenet-C', language: 'en-US', gender: 'FEMALE', description: 'Clear female voice' },
      { name: 'en-US-Wavenet-B', language: 'en-US', gender: 'MALE', description: 'Friendly male voice' },
      { name: 'en-GB-Wavenet-A', language: 'en-GB', gender: 'FEMALE', description: 'British female voice' },
      { name: 'en-AU-Wavenet-A', language: 'en-AU', gender: 'FEMALE', description: 'Australian female voice' }
    ];
  }
}

module.exports = new AudioService();
