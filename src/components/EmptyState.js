import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../config/theme';

export default function EmptyState({ icon = '📭', message }) {
  return (
    <View style={styles.box}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.msg}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', paddingVertical: 48 },
  icon: { fontSize: 44, marginBottom: 8 },
  msg: { color: colors.gray, fontFamily: fonts.body, fontSize: 14, textAlign: 'center' },
});
