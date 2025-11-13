import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NavigationProps } from '../../types';
import { theme } from '../../constants/theme';
import { Container, AILogo, Button, Avatar } from '../../components/common';
import { useAppSelector } from '../../store/hooks';
import { ROUTES } from '../../constants/routes';

interface ChatHistoryItem {
  id: string;
  preview: string;
  timestamp: string;
}

const AIAssistantScreen: React.FC<NavigationProps<'AIAssistant'>> = ({ navigation }) => {
  const user = useAppSelector((state) => state.user.user);
  
  // Mock chat history data
  const chatHistory: ChatHistoryItem[] = [
    {
      id: '1',
      preview: 'Can you recommend investment strate...',
      timestamp: '2 hours ago',
    },
    {
      id: '2', 
      preview: 'What are some tips for building an eme...',
      timestamp: '1 day ago',
    },
    {
      id: '3',
      preview: 'Can you provide me investment recom...',
      timestamp: '3 days ago',
    },
  ];

  const handleNewChat = () => {
    navigation.navigate(ROUTES.AI_CHAT);
  };

  const handleChatHistoryPress = (chatId: string) => {
    // Navigate to specific chat with ID
    navigation.navigate(ROUTES.AI_CHAT, { chatId });
  };

  return (
    <Container safeArea style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar
            firstName={user?.firstName || 'Farida'}
            lastName={user?.lastName || 'Orujova'}
            size={40}
          />
          <Text style={styles.userName}>
            {user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.name || 'Farida Orujova'}
          </Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.iconText}>🌙</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.iconText}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* AI Logo and Welcome */}
        <View style={styles.welcomeSection}>
          <AILogo size="large" />
          <Text style={styles.welcomeTitle}>Welcome to{'\n'}AI Chat</Text>
          <Text style={styles.welcomeSubtitle}>Start chatting with AI Chat now.</Text>
        </View>

        {/* New Chat Button */}
        <Button
          title="New Chat"
          onPress={handleNewChat}
          variant="primary"
          size="large"
          style={styles.newChatButton}
        />

        {/* Previous Chats */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Previous 7 days</Text>
          
          <View style={styles.chatHistoryContainer}>
            {chatHistory.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                style={styles.chatHistoryItem}
                onPress={() => handleChatHistoryPress(chat.id)}
                activeOpacity={0.7}
              >
                <View style={styles.chatIcon}>
                  <Text style={styles.chatIconText}>💬</Text>
                </View>
                <View style={styles.chatContent}>
                  <Text style={styles.chatPreview}>{chat.preview}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  userName: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    marginBottom: theme.spacing.lg,
  },
  welcomeTitle: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    fontSize: 32,
  },
  welcomeSubtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  newChatButton: {
    marginBottom: theme.spacing.xxl,
  },
  historySection: {
    marginBottom: theme.spacing.xl,
  },
  historyTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '500',
    marginBottom: theme.spacing.lg,
  },
  chatHistoryContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
  },
  chatHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  chatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  chatIconText: {
    fontSize: 16,
  },
  chatContent: {
    flex: 1,
  },
  chatPreview: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
});

export default AIAssistantScreen;
