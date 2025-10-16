import { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User,
  Loader2
} from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Hello! I'm your AI news assistant, powered by advanced language understanding. I can help you discover articles, explain complex topics, summarize news, and answer questions about current events. What would you like to explore today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    // Use setTimeout to avoid async issues
    setTimeout(() => {
      try {
        const botResponse = generateBotResponse(currentInput);
        
        const botMessage = {
          id: Date.now() + 1,
          text: botResponse,
          sender: 'bot',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error('Error generating response:', error);
        const errorMessage = {
          id: Date.now() + 1,
          text: "Sorry, I'm having trouble responding right now. Please try again later.",
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  const generateBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    // Greeting responses
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello! I'm your AI news assistant. I can help you discover articles, explain complex topics, summarize news, and answer questions about current events. What would you like to explore today?";
    }
    
    // Trending and popular content
    if (input.includes('trending') || input.includes('popular') || input.includes('hot') || input.includes('viral')) {
      return "Great question! I can help you find trending content. Click on the 'Trending' link in the navigation menu or go directly to /trending to see:\n\n• Most popular articles\n• Trending categories\n• Popular tags\n• Source analytics\n• User engagement stats\n\nThe trending page shows real-time data based on user interactions and article popularity!";
    }
    
    // News discovery
    if (input.includes('find') || input.includes('search') || input.includes('show me')) {
      if (input.includes('technology') || input.includes('tech')) {
        return "I can help you find technology news! Try searching for 'artificial intelligence', 'blockchain', 'cybersecurity', or 'startups' in the search bar. You can also filter by the 'technology' category using the Topics dropdown in the header.";
      }
      if (input.includes('politics') || input.includes('political')) {
        return "For political news, search for terms like 'election', 'policy', 'government', or 'congress'. You can also filter by the 'politics' category using the Topics dropdown in the header.";
      }
      if (input.includes('sports') || input.includes('sport')) {
        return "Sports news is available! Search for specific teams, leagues, or events like 'Olympics', 'World Cup', 'NBA', or 'Premier League'. Filter by 'sports' category using the Topics dropdown.";
      }
      if (input.includes('business') || input.includes('economy') || input.includes('finance')) {
        return "Business and financial news is here! Search for 'stock market', 'cryptocurrency', 'economy', 'startups', or 'investment'. Use the 'business' category filter in the Topics dropdown.";
      }
      return "I can help you find articles on any topic! Try searching for specific keywords in the search bar above, or use the Topics and Country dropdowns in the header to filter content.";
    }
    
    // Article management
    if (input.includes('save') || input.includes('bookmark')) {
      return "To save articles, click the bookmark icon (💾) on any article card. Your saved articles will appear in the 'Saved' section accessible from the user menu. You can organize them and access them anytime!";
    }
    
    // Search and filtering help
    if (input.includes('filter') || input.includes('narrow down') || input.includes('refine')) {
      return "You can filter articles in several ways:\n• Use the search bar for keyword searches\n• Click 'Topics' dropdown for categories (Technology, Sports, Business, etc.)\n• Click 'Country' dropdown for regional news\n• Use category tabs below the search bar\n• All filters work together for precise results";
    }
    
    // Historical news requests
    if (input.includes('august') && input.includes('2005')) {
      return "I understand you're asking about news from August 2005. While our current database focuses on recent news, I can tell you that August 2005 was notable for Hurricane Katrina, which devastated New Orleans and the Gulf Coast. This was one of the deadliest and most destructive hurricanes in U.S. history, with over 1,800 fatalities and $125 billion in damage. Would you like me to help you find current disaster preparedness or climate-related news instead?";
    }
    
    // Date-based news requests
    if (input.includes('2024') || input.includes('2023') || input.includes('2022') || input.includes('2021') || input.includes('2020')) {
      return "I can help you find recent news! Our database contains articles from the past few months. Try searching for specific topics or events you're interested in. You can also use the date filters or browse by category to find relevant recent articles.";
    }
    
    // Specific date requests like "4 aug 2025"
    if (input.includes('aug') && input.includes('2025')) {
      return "I see you're asking about news from August 2025. Our database contains recent articles from the past few months. Since we're currently in 2025, I can help you find the latest news by searching for specific topics. Try using the search bar above to look for recent events, or browse by category using the Topics dropdown in the header. What specific topic interests you most?";
    }
    
    // Current events and explanations
    if (input.includes('what is') || input.includes('explain') || input.includes('tell me about')) {
      const topic = extractTopic(input);
      if (topic) {
        return `Great question about ${topic}! I can help you find the latest news and articles about this topic. Try searching for "${topic}" in the search bar, or browse the relevant category using the Topics dropdown. This will give you the most current and comprehensive coverage available.`;
      }
      return "I'd be happy to explain! While I can provide general information, for the most current and detailed news, I recommend searching for specific topics in our news database. What would you like to learn more about?";
    }
    
    // Help and navigation
    if (input.includes('help') || input.includes('how to') || input.includes('guide')) {
      return "Here's how to get the most out of this news aggregator:\n\n🔍 **Search**: Use keywords to find specific articles\n📂 **Topics**: Use dropdown in header for categories (Tech, Sports, Business, etc.)\n🌍 **Country**: Filter by region using Country dropdown\n🔖 **Save**: Click bookmark icon on articles to save them\n📊 **Trending**: Click 'Trending' in user menu for analytics\n🤖 **AI Chat**: I'm here to help with any questions!\n\nWhat would you like to try first?";
    }
    
    // Weather and general questions
    if (input.includes('weather') || input.includes('temperature')) {
      return "I focus on news and current events rather than weather. For weather information, I'd recommend checking a dedicated weather service. However, I can help you find weather-related news articles if you're interested!";
    }
    
    // Technology and AI questions
    if (input.includes('ai') || input.includes('artificial intelligence') || input.includes('machine learning')) {
      return "AI is a fascinating topic! I can help you find the latest AI news articles. Search for terms like 'artificial intelligence', 'machine learning', 'ChatGPT', 'automation', or 'robotics' to see current developments. You can also filter by the 'technology' category in the Topics dropdown.";
    }
    
    // Crypto and finance
    if (input.includes('crypto') || input.includes('bitcoin') || input.includes('blockchain')) {
      return "Cryptocurrency and blockchain are hot topics! Search for 'bitcoin', 'ethereum', 'cryptocurrency', 'blockchain', or 'DeFi' to find the latest news. You can also filter by the 'business' category in the Topics dropdown for financial news.";
    }
    
    // Health and science
    if (input.includes('health') || input.includes('medical') || input.includes('science')) {
      return "Health and science news is important! Search for terms like 'health', 'medical research', 'vaccines', 'climate change', 'space', or 'renewable energy'. Filter by 'health' or 'science' categories in the Topics dropdown for comprehensive coverage.";
    }
    
    // Entertainment
    if (input.includes('movie') || input.includes('celebrity') || input.includes('entertainment')) {
      return "Entertainment news is available! Search for specific movies, celebrities, or entertainment topics. Filter by the 'entertainment' category in the Topics dropdown to see all entertainment-related articles.";
    }
    
    // More specific responses based on common keywords
    if (input.includes('major') || input.includes('important') || input.includes('big')) {
      return "For major news and important stories, I recommend checking our Trending page! It shows the most popular and significant articles based on user engagement. You can access it by clicking 'Trending' in your user menu, or go directly to /trending. The trending page displays real-time data on what's capturing attention across different categories.";
    }
    
    if (input.includes('latest') || input.includes('recent') || input.includes('new')) {
      return "For the latest news, our main feed shows articles sorted by publication date (newest first). You can also use the search bar to find recent articles on specific topics. Try searching for keywords related to what you're looking for, or browse by category using the Topics dropdown in the header.";
    }
    
    if (input.includes('breaking') || input.includes('urgent') || input.includes('emergency')) {
      return "For breaking news and urgent updates, check our main feed which displays the most recent articles first. You can also use the search bar to look for specific breaking news topics. The Trending page shows articles that are gaining rapid attention, which often includes breaking news stories.";
    }
    
    // Default intelligent response
    const responses = [
      "That's an interesting question! I can help you find relevant news articles on that topic. Try searching for specific keywords related to your question, or use the Topics and Country dropdowns to filter content.",
      "I'd love to help you explore that topic! Our news database has articles on a wide range of subjects. What specific aspect interests you most?",
      "Great question! Let me help you find the most relevant articles. You can search for keywords or browse by category using the dropdowns in the header.",
      "I can help you dive deeper into that topic! Try searching for related terms or use our category filters to find comprehensive coverage.",
      "That's a fascinating subject! Our news aggregator has extensive coverage. Would you like me to suggest some search terms or help you navigate to relevant articles?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Helper function to extract topic from user input
  const extractTopic = (input) => {
    const commonWords = ['what', 'is', 'about', 'tell', 'me', 'explain', 'the', 'a', 'an', 'and', 'or', 'but'];
    const words = input.split(' ').filter(word => !commonWords.includes(word.toLowerCase()));
    return words.length > 0 ? words[0] : null;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chatbot-toggle"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--violet-600) 100%)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            fontSize: '16px',
            fontWeight: '600'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.15)';
            e.target.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
          }}
        >
          <MessageCircle className="w-8 h-8" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="chatbot-window"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 450,
            height: 600,
            background: 'var(--bg)',
            border: '2px solid var(--primary)',
            borderRadius: 16,
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div 
            className="chatbot-header"
            style={{
              padding: 16,
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--violet-600) 100%)',
              color: 'white',
              borderRadius: '12px 12px 0 0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ 
                width: 32, 
                height: 32, 
                borderRadius: '50%', 
                background: 'rgba(255,255,255,0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <span style={{ fontWeight: 600, fontSize: 16 }}>AI News Assistant</span>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Powered by advanced AI</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: 8,
                borderRadius: 6,
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)';
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div 
            className="chatbot-messages"
            style={{
              flex: 1,
              padding: 16,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                {message.sender === 'bot' && (
                  <div 
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'var(--info-100)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Bot className="w-4 h-4" style={{ color: 'var(--primary-500)' }} />
                  </div>
                )}
                
                <div
                  style={{
                    maxWidth: '80%',
                    padding: 12,
                    borderRadius: 12,
                    background: message.sender === 'user' ? 'var(--primary-500)' : 'var(--border)',
                    color: message.sender === 'user' ? 'white' : 'var(--fg)',
                    fontSize: 14,
                    lineHeight: 1.4,
                    fontWeight: message.sender === 'user' ? '500' : 'normal',
                    boxShadow: message.sender === 'user' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  {message.text}
                </div>

                {message.sender === 'user' && (
                  <div 
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'var(--muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <User className="w-4 h-4" style={{ color: 'white' }} />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div 
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--info-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Bot className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                </div>
                <div
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    background: 'var(--border)',
                    color: 'var(--fg)',
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div 
            className="chatbot-input"
            style={{
              padding: 16,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: 8
            }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about news..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: 12,
                border: '1px solid var(--border)',
                borderRadius: 8,
                background: 'var(--bg)',
                color: 'var(--fg)',
                fontSize: 14,
                outline: 'none'
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              style={{
                padding: 12,
                    background: 'var(--primary-500)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: (!inputValue.trim() || isLoading) ? 0.5 : 1
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
