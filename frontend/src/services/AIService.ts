/**
 * AIService.ts
 * This service handles AI chat interactions using the OpenAI API
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

class AIService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';
  private model = 'gpt-3.5-turbo';

  /**
   * Initialize the AI service with an API key
   */
  public init(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Send a message to the OpenAI API and get a response
   */
  public async sendMessage(messages: ChatMessage[]): Promise<ChatMessage> {
    // For demo purposes, if no API key is set, use a simulated response
    if (!this.apiKey) {
      return this.simulateResponse(messages);
    }

    try {
      // Format messages for the OpenAI API
      const formattedMessages = messages.map(({ role, content }) => ({
        role,
        content
      }));

      // Add a system message if none exists
      if (!messages.some(msg => msg.role === 'system')) {
        formattedMessages.unshift({
          role: 'system',
          content: 'You are a helpful AI assistant that can answer questions on any topic. You have knowledge about a wide range of subjects including science, history, technology, arts, and current events. You can also help with the whiteboard application functionality and collaboration features.'
        });
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        id: data.id || `msg_${Date.now()}`,
        role: 'assistant',
        content: data.choices[0].message.content.trim(),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      
      // Fallback to simulated response on error
      return this.simulateResponse(messages);
    }
  }

  /**
   * Simulate an AI response for demo purposes when no API key is available
   */
  private simulateResponse(messages: ChatMessage[]): Promise<ChatMessage> {
    return new Promise(resolve => {
      // Add a small delay to simulate network request
      setTimeout(() => {
        const lastMessage = messages[messages.length - 1];
        const query = lastMessage.content.toLowerCase();
        
        // Start with a generic response
        let response = 'I can help you with that question. What specific aspects would you like to know more about?';
        
        // Whiteboard specific responses
        if (query.includes('whiteboard') || query.includes('draw')) {
          response = 'The whiteboard allows real-time collaboration. You can draw using different colors and brush sizes, and all participants will see your changes instantly. Try sharing the room code with others to collaborate!';
        } else if (query.includes('room') || query.includes('code') || query.includes('join')) {
          response = 'To invite others to your whiteboard session, share the room code displayed at the top of the page. They can enter this code on the main whiteboard page to join your session.';
        } else if (query.includes('save') || query.includes('export')) {
          response = 'Currently, you can take a screenshot to save your whiteboard. We\'re working on adding export functionality in a future update!';
        } else if (query.includes('clear') || query.includes('erase')) {
          response = 'To clear the whiteboard, click the "Clear" button in the toolbar. This will erase all drawings for all participants.';
        } else if (query.includes('color') || query.includes('brush')) {
          response = 'You can change colors by clicking the color circles in the toolbar. To adjust brush size, use the slider next to the colors.';
        }
        // General knowledge responses
        else if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
          response = 'Hello! I\'m your AI assistant. I can answer questions about the whiteboard, help with general knowledge, or chat about virtually any topic. What can I help you with today?';
        } else if (query.includes('thank')) {
          response = 'You\'re welcome! Feel free to ask if you need help with anything else.';
        } else if (query.includes('weather')) {
          response = 'I don\'t have access to real-time weather data in this version, but you can check weather apps or websites like Weather.com or AccuWeather for the latest forecast in your area.';
        } else if (query.includes('time') && query.includes('now')) {
          response = `The current time depends on your location. On my end, it's ${new Date().toLocaleTimeString()}.`;
        } else if (query.includes('covid') || query.includes('coronavirus') || query.includes('pandemic')) {
          response = 'COVID-19 emerged in late 2019 and became a global pandemic. For the latest information, I recommend checking the World Health Organization (WHO) or your local health authority websites as they provide the most up-to-date guidance.';
        } else if (query.includes('climate') || query.includes('global warming')) {
          response = 'Climate change is one of the most pressing global challenges. It\'s caused primarily by greenhouse gas emissions from human activities like burning fossil fuels. Scientists are working on solutions like renewable energy, carbon capture, and more sustainable practices.';
        } else if (query.includes('math') || query.includes('calculate')) {
          if (query.includes('+')){
            // Simple math calculation if it includes a plus sign
            const numbers = query.match(/\d+/g)?.map(Number) || [];
            if (numbers.length >= 2) {
              response = `The sum of those numbers is ${numbers.reduce((a, b) => a + b, 0)}.`;
            } else {
              response = 'I can help with math calculations. Please provide specific numbers to calculate.';
            }
          } else {
            response = 'I can help with mathematical questions. For more complex calculations, please provide the specific formula or equation you need help with.';
          }
        } else if (query.includes('recipe') || query.includes('cook') || query.includes('food')) {
          response = 'I can suggest recipes based on ingredients you have or dietary preferences. What kind of dish are you looking to make?';
        } else if (query.includes('movie') || query.includes('film') || query.includes('watch')) {
          response = 'There are many great movies across different genres. Popular recent films include action blockbusters, thoughtful dramas, and animated features. What genres do you typically enjoy?';
        } else if (query.includes('music') || query.includes('song')) {
          response = 'Music preferences are very personal! Popular genres include pop, rock, hip-hop, classical, jazz, and electronic music. What kind of music do you enjoy listening to?';
        } else if (query.includes('book') || query.includes('read')) {
          response = 'Reading is a wonderful hobby! There are countless great books across genres like fiction, non-fiction, fantasy, science fiction, romance, and more. What kinds of books do you typically enjoy?';
        } else if (query.includes('history')) {
          response = 'History is a vast subject spanning human civilization. Is there a specific time period, region, or historical event you\'d like to learn more about?';
        } else if (query.includes('science')) {
          response = 'Science encompasses physics, chemistry, biology, astronomy, and many other fields. Each explores different aspects of our natural world. Is there a specific scientific topic you\'re curious about?';
        } else if (query.includes('technology') || query.includes('tech')) {
          response = 'Technology is rapidly evolving with advances in AI, robotics, quantum computing, biotechnology, and more. These innovations are changing how we live, work, and interact. Is there a specific technology you\'re interested in?';
        } else if (query.includes('ai') || query.includes('artificial intelligence')) {
          response = 'Artificial Intelligence involves creating systems that can perform tasks requiring human intelligence. Modern AI uses techniques like machine learning and neural networks to recognize patterns in data. AI is used in virtual assistants, recommendations, autonomous vehicles, healthcare diagnostics, and many other applications.';
        } else if (query.includes('sport') || query.includes('game')) {
          response = 'Sports are popular worldwide, from football (soccer) and basketball to tennis, cricket, and many others. Each has its own rules, strategies, and global competitions. Which sport interests you most?';
        } else if (query.includes('what') && query.includes('your') && (query.includes('name') || query.includes('called'))) {
          response = 'I\'m an AI assistant designed to help with your questions and provide information on a wide range of topics.';
        } else if (query.includes('joke') || query.includes('funny')) {
          const jokes = [
            'Why don\'t scientists trust atoms? Because they make up everything!',
            'Why did the scarecrow win an award? Because he was outstanding in his field!',
            'Why don\'t skeletons fight each other? They don\'t have the guts!',
            'What do you call a fake noodle? An impasta!',
            'How does a penguin build its house? Igloos it together!'
          ];
          response = jokes[Math.floor(Math.random() * jokes.length)];
        }

        resolve({
          id: `sim_${Date.now()}`,
          role: 'assistant',
          content: response,
          timestamp: Date.now()
        });
      }, 1000);
    });
  }

  /**
   * Check if the service has been initialized with an API key
   */
  public isInitialized(): boolean {
    return !!this.apiKey;
  }
}

// Export a singleton instance
export const aiService = new AIService();
export default aiService; 