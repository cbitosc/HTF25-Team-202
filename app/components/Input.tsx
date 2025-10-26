import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
  helperText,
  style,
  secureTextEntry,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const shouldShowPasswordToggle = secureTextEntry && !rightIcon;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={error ? '#FF3B30' : isFocused ? '#007AFF' : '#8E8E93'}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#C7C7CC"
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {shouldShowPasswordToggle && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.rightIcon}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#8E8E93"
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !shouldShowPasswordToggle && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
          >
            <Ionicons name={rightIcon} size={20} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: 12,
  },
  inputContainerFocused: {
    borderColor: '#007AFF',
    backgroundColor: '#FFFFFF',
  },
  inputContainerError: {
    borderColor: '#FF3B30',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    paddingVertical: 12,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
});

export default Input;