const OpenAI = require('openai');
const axios = require('axios');

class ImageGenerationService {
  constructor() {
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    }) : null;
  }

  async generateImage(prompt, options = {}) {
    const { style = 'children-book-illustration', size = '1024x1024' } = options;
    
    // Try different services in order of preference
    try {
      if (this.openai) {
        return await this.generateWithDALLE(prompt, size);
      } else {
        return await this.generateWithStabilityAI(prompt, style);
      }
    } catch (error) {
      console.error('Primary image generation failed, trying fallback:', error);
      return await this.generateFallbackImage(prompt);
    }
  }

  async generateWithDALLE(prompt, size) {
    try {
      const enhancedPrompt = `Children's book illustration: ${prompt}. Colorful, friendly, safe for children, high quality digital art style.`;
      
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: size,
        quality: "standard",
        response_format: "url"
      });

      return {
        url: response.data[0].url,
        service: 'dall-e-3',
        prompt: enhancedPrompt
      };
    } catch (error) {
      console.error('DALL-E generation error:', error);
      throw error;
    }
  }

  async generateWithStabilityAI(prompt, style) {
    if (!process.env.STABILITY_AI_API_KEY) {
      throw new Error('Stability AI API key not configured');
    }
    try {
      const styleMap = {
        'children-book-illustration': 'enhance',
        'watercolor': 'enhance',
        'cartoon': 'enhance',
        'realistic': 'photographic'
      };

      const response = await axios.post(
        'https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image',
        {
          text_prompts: [
            {
              text: `${prompt}, children's book illustration, colorful, friendly, safe content`,
              weight: 1
            }
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 20,
          style_preset: styleMap[style] || 'enhance'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${process.env.STABILITY_AI_API_KEY}`
          }
        }
      );

      if (response.data.artifacts && response.data.artifacts.length > 0) {
        const image = response.data.artifacts[0];
        if (image.finishReason === 'SUCCESS') {
          return {
            url: `data:image/png;base64,${image.base64}`,
            service: 'stability-ai',
            prompt: prompt
          };
        } else {
           throw new Error(`Stability AI generation failed with reason: ${image.finishReason}`);
        }
      } else {
        throw new Error('No image artifacts returned from Stability AI');
      }
    } catch (error) {
      console.error('Stability AI generation error:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  async generateFallbackImage(prompt) {
    // Generate a placeholder image with text
    const placeholderUrl = `https://via.placeholder.com/1024x1024/87CEEB/000000?text=${encodeURIComponent(prompt.substring(0, 50))}`;
    
    return {
      url: placeholderUrl,
      service: 'placeholder',
      prompt: prompt,
      isPlaceholder: true
    };
  }

  async generateBatch(prompts, options = {}) {
    const results = [];
    
    for (let i = 0; i < prompts.length; i++) {
      try {
        console.log(`Generating image ${i + 1}/${prompts.length}`);
        const result = await this.generateImage(prompts[i], options);
        results.push(result);
        
        // Add delay to avoid rate limiting
        if (i < prompts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Failed to generate image ${i + 1}:`, error);
        results.push(await this.generateFallbackImage(prompts[i]));
      }
    }
    
    return results;
  }
}

module.exports = new ImageGenerationService();
