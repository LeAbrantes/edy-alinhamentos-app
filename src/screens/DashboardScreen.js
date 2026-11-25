import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import AppointmentCard from '../components/AppointmentCard';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import SectionTitle from '../components/SectionTitle';
import { colors, fonts, radius } from '../config/theme';
import { useAppointments } from '../context/AppointmentsContext';
import { useAuth } from '../context/AuthContext';
import { computeStats, getUpcoming } from '../utils/appointments';

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen({ navigation }) {
  const { appointments } = useAppointments();
  const { user, signOut } = useAuth();

  const stats = useMemo(() => computeStats(appointments), [appointments]);
  const upcoming = useMemo(() => getUpcoming(appointments), [appointments]);

  const header = (
    <View>
      <SectionTitle>Painel geral</SectionTitle>
      {user ? <Text style={styles.hello}>Olá, {user.nome}</Text> : null}
      <View style={styles.statsRow}>
        <Stat label="Total" value={stats.total} />
        <Stat label="Hoje" value={stats.hoje} />
        <Stat label="Confirmados" value={stats.confirmados} />
        <Stat label="Concluídos" value={stats.concluidos} />
      </View>
      <SectionTitle small>Próximos agendamentos</SectionTitle>
    </View>
  );

  return (
    <FlatList
      testID="lista-proximos"
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={upcoming}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <AppointmentCard appointment={item} onPress={(a) => navigation.navigate('Detalhes', { id: a.id })} />
      )}
      ListHeaderComponent={header}
      ListEmptyComponent={<EmptyState icon="🗓️" message="Sem próximos agendamentos." />}
      ListFooterComponent={
        <Button title="Sair da conta" variant="outline" onPress={signOut} style={{ marginTop: 20 }} testID="btn-sair" />
      }
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.black },
  content: { padding: 16, paddingBottom: 32 },
  hello: { color: colors.gray, fontFamily: fonts.body, fontSize: 13, marginTop: -8, marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  stat: {
    flex: 1,
    backgroundColor: colors.dark2,
    borderColor: colors.border,
    borderWidth: 1,
    borderTopColor: colors.orange,
    borderTopWidth: 3,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statNumber: { color: colors.orange, fontFamily: fonts.title, fontSize: 32, lineHeight: 34 },
  statLabel: { color: colors.gray, fontFamily: fonts.bodyBold, fontSize: 10, marginTop: 2 },
});
