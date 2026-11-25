import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import AppointmentCard from '../components/AppointmentCard';
import EmptyState from '../components/EmptyState';
import { colors, fonts, radius } from '../config/theme';
import { FILTERS } from '../constants/services';
import { useAppointments } from '../context/AppointmentsContext';
import { filterAppointments } from '../utils/appointments';

export default function AgendaScreen({ navigation }) {
  const { appointments, loading, error } = useAppointments();
  const [filter, setFilter] = useState('todos');
  const [search, setSearch] = useState('');

  const data = useMemo(
    () => filterAppointments(appointments, { filter, search }),
    [appointments, filter, search],
  );

  const header = (
    <View>
      <View style={styles.filters}>
        {FILTERS.map((f) => {
          const active = f.id === filter;
          return (
            <Pressable
              key={f.id}
              testID={`filter-${f.id}`}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setFilter(f.id)}
              style={[styles.filterBtn, active && styles.filterActive]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <TextInput
        testID="input-busca"
        accessibilityLabel="Buscar cliente ou placa"
        style={styles.search}
        value={search}
        onChangeText={setSearch}
        placeholder="🔍 Buscar cliente, carro ou placa..."
        placeholderTextColor="#666"
        selectionColor={colors.orange}
      />
      {error ? <Text style={styles.error}>⚠️ {error}</Text> : null}
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        testID="lista-agenda"
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AppointmentCard
            appointment={item}
            onPress={(a) => navigation.navigate('Detalhes', { id: a.id })}
          />
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState
            message={loading ? 'Carregando agendamentos...' : 'Nenhum agendamento encontrado.'}
          />
        }
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.black },
  content: { padding: 16, paddingBottom: 32 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  filterBtn: {
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  filterActive: { backgroundColor: colors.orange, borderColor: colors.orange },
  filterText: { color: colors.gray, fontFamily: fonts.bodyBold, fontSize: 12 },
  filterTextActive: { color: '#000' },
  search: {
    backgroundColor: colors.dark2,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radius.sm,
    color: colors.white,
    fontFamily: fonts.body,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  error: { color: colors.danger, fontFamily: fonts.bodyBold, marginBottom: 12 },
});
