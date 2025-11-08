import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { NavigationProps } from '../../types';
import { theme } from '../../constants/theme';
import { Container, AILogo, HeaderNavigation } from '../../components/common';

/**
 * Message interface for chat messages
 * This structure should be compatible with your future chatbot API
 */
interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  // Future properties for enhanced functionality:
  // type?: 'text' | 'image' | 'file' | 'quick_reply';
  // metadata?: {
  //   confidence?: number;
  //   intent?: string;
  //   entities?: any[];
  // };
  // isTyping?: boolean;
  // error?: boolean;
}

/**
 * Suggested prompts for quick user interaction
 * These can be dynamically loaded from your backend in the future
 */
interface SuggestedPrompt {
  id: string;
  text: string;
  category?: 'savings' | 'investment' | 'budgeting' | 'general';
}

const AIChatScreen: React.FC<NavigationProps<'AIChat'>> = ({ navigation, route }) => {
  // State management for chat functionality
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  // Refs for scroll and input management
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // Get chatId from route params if navigating to existing chat
  const chatId = route?.params?.chatId;

  /**
   * Suggested prompts for new users
   * TODO: In production, fetch these from your backend API
   * API endpoint: GET /api/chat/suggested-prompts
   */
  const suggestedPrompts: SuggestedPrompt[] = [
    {
      id: '1',
      text: 'Help me set a monthly savings goal',
      category: 'savings',
    },
    {
      id: '2',
      text: 'Can you recommend investment strategies for long-term growth?',
      category: 'investment',
    },
    {
      id: '3',
      text: "What's the best way to save for a major purchase?",
      category: 'budgeting',
    },
  ];

  /**
   * Load existing chat messages if chatId is provided
   * TODO: Implement API call to fetch chat history
   */
  useEffect(() => {
    if (chatId) {
      loadChatHistory(chatId);
    }
  }, [chatId]);

  /**
   * Load chat history from backend
   * TODO: Replace with actual API call
   * API endpoint: GET /api/chat/{chatId}/messages
   */
  const loadChatHistory = async (id: string) => {
    try {
      setIsLoading(true);
      // const response = await fetch(`/api/chat/${id}/messages`);
      // const chatHistory = await response.json();
      // setMessages(chatHistory.messages);
      
      // Mock implementation for now
      console.log(`Loading chat history for chat ID: ${id}`);
      setShowSuggestions(false);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Send message to AI chatbot
   * TODO: Integrate with your AI service (OpenAI, Claude, etc.)
   */
  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    // Create user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setShowSuggestions(false);
    setIsLoading(true);

    // Scroll to bottom after adding message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      /**
       * TODO: Replace with actual AI API integration
       * 
       * Example integration with OpenAI:
       * 
       * const response = await fetch('/api/chat/send', {
       *   method: 'POST',
       *   headers: {
       *     'Content-Type': 'application/json',
       *     'Authorization': `Bearer ${API_KEY}`,
       *   },
       *   body: JSON.stringify({
       *     message: messageText,
       *     chatId: chatId || null,
       *     context: {
       *       userId: user.id,
       *       financialData: userFinancialData, // Pass relevant user data
       *     }
       *   }),
       * });
       * 
       * const aiResponse = await response.json();
       */

      // Mock AI response for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: `I understand you're asking about "${messageText}". As your AI financial assistant, I'd be happy to help you with financial advice, budgeting tips, investment strategies, and savings goals. However, I'm currently in development mode. In the future, I'll provide personalized financial insights based on your transaction history and financial goals.`,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Scroll to bottom after AI response
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        text: 'Sorry, I encountered an error. Please try again later.',
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle suggested prompt selection
   */
  const handleSuggestedPrompt = (prompt: SuggestedPrompt) => {
    sendMessage(prompt.text);
  };

  /**
   * Handle send button press
   */
  const handleSend = () => {
    sendMessage(inputText);
  };

  /**
   * Handle input submission
   */
  const handleSubmitEditing = () => {
    handleSend();
  };

  /**
   * Render individual chat message
   */
  const renderMessage = (message: ChatMessage) => {
    const isUser = message.sender === 'user';
    
    return (
      <View key={message.id} style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.aiMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isUser ? styles.userMessageBubble : styles.aiMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.aiMessageText
          ]}>
            {message.text}
          </Text>
        </View>
      </View>
    );
  };

  /**
   * Render suggested prompts
   */
  const renderSuggestedPrompts = () => {
    if (!showSuggestions || messages.length > 0) return null;

    return (
      <View style={styles.suggestionsContainer}>
        <View style={styles.aiLogoContainer}>
          <AILogo size="medium" />
        </View>
        
        <View style={styles.promptsContainer}>
          {suggestedPrompts.map((prompt) => (
            <TouchableOpacity
              key={prompt.id}
              style={styles.promptButton}
              onPress={() => handleSuggestedPrompt(prompt)}
              activeOpacity={0.7}
            >
              <Text style={styles.promptText}>{prompt.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Container safeArea edges={['top']} style={styles.container}>
      {/* Header */}
      <HeaderNavigation
        title="AI Chat"
        onBackPress={() => navigation.goBack()}
      />

      {/* Chat Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderSuggestedPrompts()}
          
          {messages.map(renderMessage)}
          
          {isLoading && (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingBubble}>
                <Text style={styles.loadingText}>AI is typing...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder="Send a message"
              placeholderTextColor={theme.colors.text.secondary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSubmitEditing}
              multiline
              maxLength={1000}
              returnKeyType="send"
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
            >
              <Text style={styles.sendButtonText}>▶</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  suggestionsContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  aiLogoContainer: {
    marginBottom: theme.spacing.xl,
  },
  promptsContainer: {
    width: '100%',
    gap: theme.spacing.md,
  },
  promptButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  promptText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    textAlign: 'left',
  },
  messageContainer: {
    marginBottom: theme.spacing.md,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  userMessageBubble: {
    backgroundColor: theme.colors.primary,
  },
  aiMessageBubble: {
    backgroundColor: theme.colors.surface,
  },
  messageText: {
    ...theme.typography.body,
    lineHeight: 20,
  },
  userMessageText: {
    color: theme.colors.text.inverse,
  },
  aiMessageText: {
    color: theme.colors.text.primary,
  },
  loadingContainer: {
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  loadingBubble: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  inputContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 50,
  },
  textInput: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text.primary,
    maxHeight: 100,
    paddingVertical: theme.spacing.xs,
    paddingRight: theme.spacing.sm,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.xs,
  },
  sendButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  sendButtonInactive: {
    backgroundColor: theme.colors.border,
  },
  sendButtonText: {
    fontSize: 16,
    color: theme.colors.text.inverse,
  },
});

export default AIChatScreen;
