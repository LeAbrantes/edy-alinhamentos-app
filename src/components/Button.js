import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius } from '../config/theme';

// variant: 'primary' (laranja) | 'outline' | 'danger'
export default function Button({ title, onPress, variant = 'primary', loading = false, disabled = false, style, testID }) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'outline' && styles.outline,
        variant === 'danger' && styles.danger,
        pressed && { opacity: 0.8 },
        (disabled || loading) && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#000' : colors.orange} />
      ) : (
        <Text style={[styles.text, isPrimary ? styles.textPrimary : variant === 'danger' ? styles.textDanger : styles.textOutline]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.sm,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  primary: { backgroundColor: colors.orange },
  outline: { borderWidth: 1.5, borderColor: colors.orange, backgroundColor: 'transparent' },
  danger: { borderWidth: 1.5, borderColor: colors.danger, backgroundColor: 'transparent' },
  text: { fontFamily: fonts.title, fontSize: 18, letterSpacing: 2, textTransform: 'uppercase' },
  textPrimary: { color: '#000' },
  textOutline: { color: colors.orange },
  textDanger: { color: colors.danger },
});
