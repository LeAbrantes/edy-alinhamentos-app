import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors, fonts } from '../config/theme';

export default function SectionTitle({ children, small = false }) {
  return <Text style={[styles.title, small && styles.small]}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    color: colors.orange,
    fontFamily: fonts.title,
    fontSize: 26,
    letterSpacing: 2,
    borderLeftWidth: 4,
    borderLeftColor: colors.orange,
    paddingLeft: 12,
    marginBottom: 18,
  },
  small: { fontSize: 18, marginBottom: 12 },
});
