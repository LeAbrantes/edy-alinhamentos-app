import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../config/theme';
import { SERVICES, STATUS_LABEL } from '../constants/services';
import { formatDate } from '../utils/dates';
import { getServiceIds } from '../utils/appointments';

const STATUS_COLOR = {
  confirmado: colors.orange,
  concluido: colors.success,
  cancelado: colors.danger,
};

// Item da FlatList da Agenda e do Painel
export default function AppointmentCard({ appointment: a, onPress }) {
  const status = a.status || 'confirmado';
  const tags = getServiceIds(a)
    .map((id) => SERVICES.find((s) => s.id === id))
    .filter(Boolean);

  return (
    <Pressable
      testID={`apt-card-${a.id}`}
      accessibilityRole="button"
      accessibilityLabel={`Agendamento de ${a.name}`}
      onPress={() => onPress && onPress(a)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.timeBlock}>
        <Text style={styles.time}>{a.slot}</Text>
        <Text style={styles.date}>{formatDate(a.date)}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{a.name}</Text>
        <Text style={styles.car} numberOfLines={1}>
          🚗 {a.car}
          {a.plate ? ` • ${a.plate}` : ''}
        </Text>
        <View style={styles.tags}>
          {tags.map((s) => (
            <Text key={s.id} style={styles.tag}>{s.icon} {s.name}</Text>
          ))}
        </View>
      </View>

      <View style={[styles.badge, { borderColor: STATUS_COLOR[status] }]}>
        <Text style={[styles.badgeText, { color: STATUS_COLOR[status] }]}>{STATUS_LABEL[status]}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark2,
    borderColor: colors.border,
    borderWidth: 1,
    borderLeftColor: colors.orange,
    borderLeftWidth: 4,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  timeBlock: { alignItems: 'center', minWidth: 58 },
  time: { color: colors.orange, fontFamily: fonts.title, fontSize: 24, lineHeight: 26 },
  date: { color: colors.gray, fontFamily: fonts.body, fontSize: 11, marginTop: 2 },
  info: { flex: 1 },
  name: { color: colors.white, fontFamily: fonts.heading, fontSize: 18, letterSpacing: 0.5 },
  car: { color: colors.gray, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  tag: {
    color: colors.light,
    backgroundColor: colors.dark3,
    fontFamily: fonts.body,
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    overflow: 'hidden',
  },
  badge: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 10 },
});
