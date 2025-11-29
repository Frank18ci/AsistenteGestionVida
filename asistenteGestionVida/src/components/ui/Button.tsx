import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

export const Button = ({ title, onPress, variant = 'primary', isLoading }: ButtonProps) => {
  const backgroundColor = variant === 'primary' ? '#2f95dc' : '#e0e0e0';
  const textColor = variant === 'primary' ? '#fff' : '#333';

  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor }]} 
      onPress={onPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});