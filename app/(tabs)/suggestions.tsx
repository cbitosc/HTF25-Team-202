import React, { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Define types for our messages
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I can help you with outfit suggestions. You can upload photos and ask for better combinations.',
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState<string>('');

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setInputText('');
      
      // Simulate AI response after a delay
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'll analyze your outfit and suggest improvements. You can also upload photos for more specific advice!",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageBubble,
      item.isUser ? styles.userBubble : styles.aiBubble
    ]}>
      <Text style={[
        styles.messageText,
        item.isUser ? styles.userText : styles.aiText
      ]}>
        {item.text}
      </Text>
      <Text style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Outfit Assistant</Text>
        <Text style={styles.subtitle}>AI-powered fashion suggestions</Text>
      </View>

      {/* Chat Messages */}
      <View style={styles.chatContainer}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Upload Photo Section */}
      <View style={styles.uploadSection}>
        <Text style={styles.uploadTitle}>Upload Outfit Photos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.uploadScroll}>
          <TouchableOpacity style={styles.uploadCard}>
            <View style={styles.uploadPlaceholder}>
              <Text style={styles.uploadIcon}>📷</Text>
              <Text style={styles.uploadText}>Take Photo</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadCard}>
            <View style={styles.uploadPlaceholder}>
              <Text style={styles.uploadIcon}>🖼️</Text>
              <Text style={styles.uploadText}>From Gallery</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadCard}>
            <View style={styles.uploadPlaceholder}>
              <Text style={styles.uploadIcon}>👔</Text>
              <Text style={styles.uploadText}>Current Outfit</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Input Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask for outfit suggestions..."
            placeholderTextColor="#8E8E93"
            multiline
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesList: {
    paddingVertical: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginVertical: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#000000',
  },
  timestamp: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  uploadSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  uploadScroll: {
    flexDirection: 'row',
  },
  uploadCard: {
    marginRight: 12,
  },
  uploadPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  uploadIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: '#F2F2F7',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginLeft: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});