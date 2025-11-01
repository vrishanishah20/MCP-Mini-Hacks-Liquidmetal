import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Chatbot.css';

const Chatbot = ({ selectedNeighborhood, onNeighborhoodMention }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! Which Chicago neighborhood are you interested in?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/chat', {
        message: inputValue,
        context: { neighborhood: selectedNeighborhood }
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Check if a neighborhood was mentioned
      if (response.data.neighborhood) {
        onNeighborhoodMention(response.data.neighborhood);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h3>Chat Assistant</h3>
      </div>

      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-content typing">Thinking...</div>
          </div>
        )}
      </div>

      <div className="chatbot-input">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about neighborhoods, housing, safety..."
          rows={2}
        />
        <button onClick={sendMessage} disabled={isLoading || !inputValue.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
