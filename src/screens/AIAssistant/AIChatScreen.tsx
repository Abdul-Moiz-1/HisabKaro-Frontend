import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MicrophoneIcon, PaperPlaneTiltIcon, SparkleIcon } from 'phosphor-react-native';
import Toast from 'react-native-toast-message';
import { NavigationProps } from '../../types';
import { useTheme } from '../../store/hooks';
import { Container, AILogo, HeaderNavigation } from '../../components/common';
import { aiApi, AIQueryResponse } from '../../services/api';

/**
 * Message interface for chat messages
 */
interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  intent?: string;
  confidence?: number;
  data?: Record<string, any>;
}

/**
 * Suggested prompts for quick user interaction
 */
interface SuggestedPrompt {
  id: string;
  text: string;
  category?: 'balance' | 'sales' | 'receivables' | 'payables' | 'general';
}

const AIChatScreen: React.FC<NavigationProps<'AIChat'>> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  
  // State management for chat functionality
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Refs for scroll and input management
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // Get chatId from route params if navigating to existing chat
  const chatId = route?.params?.chatId;

  // Suggested prompts - loaded from API
  const defaultPrompts: SuggestedPrompt[] = [
    {
      id: '1',
      text: "What's my cash balance?",
      category: 'balance',
    },
    {
      id: '2',
      text: 'Show outstanding receivables',
      category: 'receivables',
    },
    {
      id: '3',
      text: 'Sales summary this month',
      category: 'sales',
    },
    {
      id: '4',
      text: 'Who owes me money?',
      category: 'receivables',
    },
  ];

  // Load suggestions from API
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const apiSuggestions = await aiApi.getSuggestions();
        setSuggestions(apiSuggestions);
      } catch (error) {
        console.error('Failed to load suggestions:', error);
      }
    };
    loadSuggestions();
  }, []);

  // Load existing chat messages if chatId is provided
  useEffect(() => {
    if (chatId) {
      loadChatHistory(chatId);
    }
  }, [chatId]);

  // Load chat history from backend
  const loadChatHistory = async (id: string) => {
    try {
      setIsLoading(true);
      // TODO: Implement chat history API
      console.log(`Loading chat history for chat ID: ${id}`);
      setShowSuggestions(false);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  /**
   * Send message to AI chatbot using our AI API
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
    scrollToBottom();

    try {
      // Call our AI API
      const conversationHistory = messages.map(m => ({
        role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: m.text,
      }));

      const response: AIQueryResponse = await aiApi.query({
        query: messageText.trim(),
        conversationHistory,
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        sender: 'ai',
        timestamp: new Date(),
        intent: response.intent,
        confidence: response.confidence,
        data: response.data,
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update suggestions based on response
      if (response.suggestions) {
        setSuggestions(response.suggestions);
      }

      scrollToBottom();
    } catch (error: any) {
      console.error('Failed to send message:', error);

      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to get AI response',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggested prompt selection
  const handleSuggestedPrompt = (prompt: SuggestedPrompt | string) => {
    const text = typeof prompt === 'string' ? prompt : prompt.text;
    sendMessage(text);
  };

  // Handle send button press
  const handleSend = () => {
    sendMessage(inputText);
  };

  // Handle input submission
  const handleSubmitEditing = () => {
    handleSend();
  };

  // Quick action handlers
  const handleQuickCash = async () => {
    try {
      setIsLoading(true);
      const data = await aiApi.getQuickCashBalance();
      const response = `💰 Cash Position:\n• Cash in Hand: Rs. ${data.cash.toLocaleString()}\n• Bank Balance: Rs. ${data.bank.toLocaleString()}\n• Total: Rs. ${data.total.toLocaleString()}`;
      
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date(),
        intent: 'get_cash_balance',
        data,
      };
      setMessages(prev => [...prev, aiMessage]);
      setShowSuggestions(false);
      scrollToBottom();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to fetch cash balance' });
    } finally {
      setIsLoading(false);
    }
  };

  // Render individual chat message
  const renderMessage = (message: ChatMessage) => {
    const isUser = message.sender === 'user';

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.aiAvatar}>
            <SparkleIcon size={16} color={theme.colors.primary} weight="fill" />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userMessageBubble : styles.aiMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.aiMessageText,
            ]}
          >
            {message.text}
          </Text>
          {message.confidence !== undefined && message.confidence < 0.7 && (
            <Text style={styles.lowConfidenceText}>
              (I'm not fully sure about this)
            </Text>
          )}
        </View>
      </View>
    );
  };

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Render suggested prompts
  const renderSuggestedPrompts = () => {
    if (!showSuggestions || messages.length > 0) return null;

    return (
      <View style={styles.suggestionsContainer}>
        <View style={styles.aiLogoContainer}>
          <AILogo size="medium" />
        </View>

        <Text style={styles.welcomeText}>
          Hi! I'm your HisabKaro AI assistant.{'\n'}
          Ask me anything about your business!
        </Text>

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={handleQuickCash}
            activeOpacity={0.7}
          >
            <Text style={styles.quickActionIcon}>💰</Text>
            <Text style={styles.quickActionText}>Cash Balance</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => sendMessage('Show outstanding receivables')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickActionIcon}>📊</Text>
            <Text style={styles.quickActionText}>Receivables</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => sendMessage("What's my profit this month?")}
            activeOpacity={0.7}
          >
            <Text style={styles.quickActionIcon}>📈</Text>
            <Text style={styles.quickActionText}>Profit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.promptsContainer}>
          {defaultPrompts.map(prompt => (
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

  // Render follow-up suggestions
  const renderFollowUpSuggestions = () => {
    if (messages.length === 0 || isLoading || suggestions.length === 0) return null;

    return (
      <View style={styles.followUpContainer}>
        <Text style={styles.followUpTitle}>Try asking:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {suggestions.slice(0, 3).map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.followUpChip}
              onPress={() => handleSuggestedPrompt(suggestion)}
              activeOpacity={0.7}
            >
              <Text style={styles.followUpText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <Container safeArea edges={['top']} style={styles.container}>
      {/* Header */}
      <HeaderNavigation
        title="AI Assistant"
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
              <View style={styles.aiAvatar}>
                <SparkleIcon size={16} color={theme.colors.primary} weight="fill" />
              </View>
              <View style={styles.loadingBubble}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Thinking...</Text>
              </View>
            </View>
          )}

          {renderFollowUpSuggestions()}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder="Ask about your business..."
              placeholderTextColor={theme.colors.text.secondary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSubmitEditing}
              multiline
              maxLength={500}
              returnKeyType="send"
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                inputText.trim()
                  ? styles.sendButtonActive
                  : styles.sendButtonInactive,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
            >
              <PaperPlaneTiltIcon 
                size={20} 
                color={inputText.trim() ? '#FFFFFF' : theme.colors.text.disabled}
                weight="fill"
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
};

// Helper function to create styles with theme
const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
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
      flexGrow: 1,
    },
    suggestionsContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
    },
    aiLogoContainer: {
      marginBottom: theme.spacing.lg,
    },
    welcomeText: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
      lineHeight: 22,
    },
    quickActionsRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    quickActionButton: {
      alignItems: 'center',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      minWidth: 90,
    },
    quickActionIcon: {
      fontSize: 24,
      marginBottom: theme.spacing.xs,
    },
    quickActionText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    promptsContainer: {
      width: '100%',
      gap: theme.spacing.sm,
    },
    promptButton: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    promptText: {
      ...theme.typography.body,
      color: theme.colors.text.primary,
    },
    messageContainer: {
      marginBottom: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    userMessageContainer: {
      justifyContent: 'flex-end',
    },
    aiMessageContainer: {
      justifyContent: 'flex-start',
    },
    aiAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: `${theme.colors.primary}20`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.xs,
    },
    messageBubble: {
      maxWidth: '80%',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
    },
    userMessageBubble: {
      backgroundColor: theme.colors.primary,
      borderBottomRightRadius: 4,
    },
    aiMessageBubble: {
      backgroundColor: theme.colors.surface,
      borderBottomLeftRadius: 4,
    },
    messageText: {
      ...theme.typography.body,
      lineHeight: 22,
    },
    userMessageText: {
      color: '#FFFFFF',
    },
    aiMessageText: {
      color: theme.colors.text.primary,
    },
    lowConfidenceText: {
      fontSize: 11,
      color: theme.colors.text.disabled,
      fontStyle: 'italic',
      marginTop: theme.spacing.xs,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginBottom: theme.spacing.md,
    },
    loadingBubble: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    loadingText: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
    },
    followUpContainer: {
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
    },
    followUpTitle: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.sm,
    },
    followUpChip: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      marginRight: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    followUpText: {
      fontSize: 13,
      color: theme.colors.text.primary,
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
      width: 40,
      height: 40,
      borderRadius: 20,
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
  });

export default AIChatScreen;
