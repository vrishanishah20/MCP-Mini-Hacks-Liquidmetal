import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import './Chatbot.css';

const QUICK_REPLY_NEIGHBORHOODS = [
  'Logan Square',
  'Wicker Park',
  'Lincoln Park',
  'Hyde Park',
  'Pilsen'
];

const Chatbot = ({ selectedNeighborhood, onNeighborhoodMention, onHousingResults }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! Which Chicago neighborhood are you interested in? Or ask about affordable housing, like "2 bed 1 bath affordable housing"'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText = null) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend) {
      console.log('Cannot send empty message');
      return;
    }

    if (isLoading) {
      console.log('Already sending message, please wait');
      return;
    }

    const userMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      console.log('Sending message with sessionId:', sessionId);
      const response = await chatAPI.sendMessage(textToSend, sessionId);

      // Store session ID from response
      if (response.sessionId) {
        setSessionId(response.sessionId);
      }

      // Extract text response - backend returns { message, sessionId, citations }
      const textResponse = response.message || 'I received your message, but the response format was unexpected.';

      // Extract housing data from response if present
      const housingData = response.data || response;

      // Build assistant message
      let assistantContent = textResponse;

      // If housing data exists, add summary to message
      if (housingData && housingData.housing && Array.isArray(housingData.housing)) {
        const count = housingData.housing.length;
        assistantContent += `\n\n📍 Found ${count} propert${count === 1 ? 'y' : 'ies'}. Click the markers on the map to see details!`;
      }

      const assistantMessage = {
        role: 'assistant',
        content: assistantContent
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Extract and pass housing data to parent
      if (housingData && housingData.housing && Array.isArray(housingData.housing)) {
        if (onHousingResults) {
          onHousingResults(housingData);
        }
      }

      // Check if a neighborhood was mentioned
      if (response.neighborhood) {
        onNeighborhoodMention(response.neighborhood);
      }
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);

      let errorMessage = 'Unknown error occurred';

      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout - backend is taking too long (try again, first request can take 30s)';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error - check if backend URL is accessible and CORS is enabled';
      } else if (error.response) {
        errorMessage = error.response.data?.error || `Server error: ${error.response.status}`;
      } else {
        errorMessage = error.message || 'Network error';
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}. Please wait 30 seconds for the backend to warm up on the first request.`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (neighborhood) => {
    const message = `Tell me about ${neighborhood}`;
    sendMessage(message);
    onNeighborhoodMention(neighborhood);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && inputValue.trim()) {
        sendMessage();
      }
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h3>Chat Assistant</h3>
        {selectedNeighborhood && (
          <span className="neighborhood-badge">{selectedNeighborhood}</span>
        )}
      </div>

      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-content typing">
              <span className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reply Buttons - Show on initial message or when no neighborhood selected */}
      {messages.length === 1 && (
        <div className="quick-replies">
          <p className="quick-replies-label">Quick select:</p>
          <div className="quick-reply-chips">
            {QUICK_REPLY_NEIGHBORHOODS.map((neighborhood) => (
              <button
                key={neighborhood}
                className="quick-reply-chip"
                onClick={() => handleQuickReply(neighborhood)}
              >
                {neighborhood}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="chatbot-input">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about neighborhoods, housing, safety..."
          rows={2}
          disabled={isLoading}
        />
        <button 
          onClick={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          disabled={isLoading || !inputValue.trim()}
          className="send-button"
          type="button"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
