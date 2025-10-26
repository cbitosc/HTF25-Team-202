import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Modal as RNModal,
    ScrollView,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { Button } from './Button';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
  primaryButtonLoading?: boolean;
  size?: 'small' | 'medium' | 'large' | 'full';
  style?: ViewStyle;
  headerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  contentStyle?: ViewStyle;
  footerStyle?: ViewStyle;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryPress,
  onSecondaryPress,
  primaryButtonLoading = false,
  size = 'medium',
  style,
  headerStyle,
  titleStyle,
  contentStyle,
  footerStyle,
}) => {
  return (
    <RNModal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, styles[size], style]}>
          {/* Header */}
          {(title || showCloseButton) && (
            <View style={[styles.header, headerStyle]}>
              {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
              {showCloseButton && (
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#000000" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Content */}
          <ScrollView
            style={[styles.content, contentStyle]}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {/* Footer */}
          {(primaryButtonText || secondaryButtonText) && (
            <View style={[styles.footer, footerStyle]}>
              {secondaryButtonText && (
                <Button
                  title={secondaryButtonText}
                  onPress={onSecondaryPress || onClose}
                  variant="outline"
                  style={styles.footerButton}
                />
              )}
              {primaryButtonText && (
                <Button
                  title={primaryButtonText}
                  onPress={onPrimaryPress || onClose}
                  loading={primaryButtonLoading}
                  style={styles.footerButton}
                />
              )}
            </View>
          )}
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    maxHeight: '80%',
    width: '100%',
  },
  small: {
    maxWidth: 300,
  },
  medium: {
    maxWidth: 400,
  },
  large: {
    maxWidth: 600,
  },
  full: {
    maxWidth: '100%',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 12,
  },
  footerButton: {
    minWidth: 100,
  },
});

export default Modal;