const { GoogleGenerativeAI } = require('@google/generative-ai');

// Updated Gemini service for story generation
class GeminiService {
  constructor() {
    this.apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    
    if (!this.apiKey || this.apiKey === 'your-gemini-api-key-here') {
      console.warn('⚠️  GOOGLE_GEMINI_API_KEY not configured. Story generation will use mock data.');
      this.genAI = null;
      this.model = null;
    } else {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
  }

  async generateStory(prompt, options = {}) {
    try {
      const {
        pages = 8,
        ageGroup = 'children',
        genre = 'adventure',
        artStyle = 'colorful illustration'
      } = options;

      // If no API key, return mock story
      if (!this.model) {
        return this.generateMockStory(prompt, pages, ageGroup, genre, artStyle);
      }

      const systemPrompt = this.buildStoryPrompt(prompt, pages, ageGroup, genre, artStyle);
      
      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseStoryResponse(text);
    } catch (error) {
      console.error('Error generating story:', error);
      
      // If API call fails, fallback to mock story
      if (error.message.includes('API_KEY') || error.message.includes('INVALID_ARGUMENT')) {
        console.warn('API error detected, falling back to mock story');
        const { pages = 8, ageGroup = 'children', genre = 'adventure', artStyle = 'colorful illustration' } = options;
        return this.generateMockStory(prompt, pages, ageGroup, genre, artStyle);
      }
      
      throw new Error(`Story generation failed: ${error.message}`);
    }
  }

  buildStoryPrompt(userPrompt, pages, ageGroup, genre, artStyle) {
    return `You are a professional children's book author. Create an engaging ${genre} story for ${ageGroup} based on this prompt: "${userPrompt}"

REQUIREMENTS:
1. Generate exactly ${pages} pages.
2. Each page should have 2-4 sentences of story text.
3. Create a compelling narrative arc with a clear beginning, middle, and end.
4. Use age-appropriate language and themes.
5. Include positive messages and character growth.

OUTPUT FORMAT (JSON):
Provide a single, valid JSON object. Do not include any text or markdown formatting before or after the JSON block.

{
  "title": "Story Title Here",
  "pages": [
    {
      "pageNumber": 1,
      "title": "Page Title",
      "text": "Story text for this page...",
      "imagePrompt": "Detailed description for a ${artStyle} illustration showing [scene details, character descriptions, setting, mood, lighting]. Make it vivid and specific for an AI image generator."
    }
  ],
  "metadata": {
    "genre": "${genre}",
    "ageGroup": "${ageGroup}",
    "mood": "appropriate mood",
    "themes": ["theme1", "theme2"]
  }
}

Make sure each imagePrompt is detailed and specific, describing characters, settings, colors, and artistic style. The story should flow naturally from page to page.`;
  }

  parseStoryResponse(text) {
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const storyData = JSON.parse(jsonMatch[0]);
      
      // Validate the structure
      if (!storyData.title || !storyData.pages || !Array.isArray(storyData.pages)) {
        throw new Error('Invalid story structure');
      }
      
      return storyData;
    } catch (error) {
      console.error('Error parsing story response:', error);
      throw new Error('Failed to parse story data');
    }
  }

  async enhanceImagePrompt(originalPrompt, artStyle = 'children book illustration') {
    try {
      if (!this.model) {
        // Return enhanced prompt without API call
        return `${artStyle} of ${originalPrompt}, vibrant colors, child-friendly, detailed illustration, warm lighting, storybook art style`;
      }

      const enhancePrompt = `Enhance this image generation prompt for a children's storybook illustration in ${artStyle} style: "${originalPrompt}"

Make it more detailed and specific for AI image generation. Include:
- Character descriptions (age, appearance, clothing)
- Setting details (location, time of day, atmosphere)
- Artistic style specifications
- Color palette suggestions
- Composition and framing

Keep it concise but vivid. Output only the enhanced prompt, nothing else.`;

      const result = await this.model.generateContent(enhancePrompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error enhancing image prompt:', error);
      return originalPrompt; // Fallback to original
    }
  }

  generateMockStory(prompt, pages = 8, ageGroup = 'children', genre = 'adventure', artStyle = 'colorful illustration') {
    const storyPages = [];
    const title = `The Adventure of ${prompt.substring(0, 20)}...`;
    
    // Generate mock pages based on the prompt
    for (let i = 1; i <= pages; i++) {
      storyPages.push({
        pageNumber: i,
        title: `Page ${i}`,
        text: this.generateMockPageText(i, pages, prompt, genre),
        imagePrompt: `${artStyle} showing ${this.generateMockImageDescription(i, prompt, genre)}, vibrant colors, child-friendly, detailed storybook illustration`
      });
    }

    return {
      title,
      pages: storyPages,
      metadata: {
        genre,
        ageGroup,
        mood: 'cheerful and adventurous',
        themes: ['friendship', 'courage', 'discovery']
      }
    };
  }

  generateMockPageText(pageNum, totalPages, prompt, genre) {
    const beginning = [
      `Once upon a time, there was a wonderful adventure waiting to begin with ${prompt}.`,
      `The story started on a bright sunny day when everything seemed possible.`,
      `Our tale begins in a magical place where dreams come true.`
    ];

    const middle = [
      `As the adventure continued, exciting things started to happen.`,
      `Along the way, there were challenges to overcome and friends to meet.`,
      `The journey led through amazing places filled with wonder and discovery.`,
      `Each step of the adventure brought new surprises and lessons.`,
      `The characters learned important things about courage and friendship.`
    ];

    const ending = [
      `And so the adventure came to a happy ending.`,
      `Everyone learned something special and made wonderful memories.`,
      `The end of this adventure was really just the beginning of many more to come.`
    ];

    if (pageNum <= 2) {
      return beginning[pageNum - 1] || beginning[0];
    } else if (pageNum >= totalPages - 1) {
      return ending[Math.min(pageNum - totalPages + 1, ending.length - 1)] || ending[0];
    } else {
      return middle[(pageNum - 3) % middle.length];
    }
  }

  generateMockImageDescription(pageNum, prompt, genre) {
    const scenes = [
      `the beginning of an adventure with ${prompt}`,
      `characters exploring a magical world`,
      `an exciting discovery in a beautiful landscape`,
      `friends working together to solve a problem`,
      `a moment of triumph and celebration`,
      `the happy conclusion of the adventure`
    ];
    
    return scenes[Math.min(pageNum - 1, scenes.length - 1)] || scenes[0];
  }
}

module.exports = new GeminiService();
