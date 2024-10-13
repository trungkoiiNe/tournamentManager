import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

interface ButtonProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'primary' | 'danger';
  onPress?: () => void;
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({ children, icon, variant = 'primary', onPress, style }) => {
  return (
    <TouchableOpacity
      style={[styles.button, styles[variant], style]}
      onPress={onPress}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.text}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  primary: {
    backgroundColor: '#2563eb',
  },
  danger: {
    backgroundColor: '#dc2626',
  },
  text: {
    color: 'white',
    fontWeight: '600',
  },
  icon: {
    marginRight: 8,
    color: 'white',
  },
});

export default Button;