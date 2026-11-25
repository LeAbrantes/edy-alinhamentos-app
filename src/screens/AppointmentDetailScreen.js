import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import { colors, fonts, radius } from '../config/theme';
import { SERVICES, STATUS, STATUS_LABEL } from '../constants/services';
import { useAppointments } from '../context/AppointmentsContext';
import { useToast } from '../context/ToastContext';
import { getAppointmentById, updateAppointmentStatus } from '../services/appointmentService';
import { cancelReminder } from '../services/notificationService';
import { getServiceIds } from '../utils/appointments';
import { formatDate, formatTime, getReminderDate } from '../utils/dates';

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function AppointmentDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { appointments } = useAppointments();
  const { showToast } = useToast();
  const fromList = appointments.find((a) => a.id === id);
  const [fetched, setFetched] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);

  // Se o agendamento ainda não chegou na lista (ex.: acabou de ser criado), busca direto no Firestore
  useEffect(() => {
    if (fromList) return;
    let active = true;
    getAppointmentById(id)
      .then((a) => {
        if (!active) return;
        if (a) setFetched(a);
        else setNotFound(true);
      })
      .catch(() => active && setNotFound(true));
    return () => {
      active = false;
    };
  }, [id, fromList]);

  const apt = fromList || fetched;

  async function changeStatus(status) {
    setBusy(true);
    try {
      await updateAppointmentStatus(id, status);
      // o lembrete deixa de fazer sentido depois de concluir/cancelar
      try {
        await cancelReminder(apt.lembreteId);
      } catch (e) {
        /* sem lembrete agendado */
      }
      showToast(status === STATUS.CONCLUIDO ? '✅ Marcado como concluído!' : '❌ Agendamento cancelado!');
      navigation.goBack();
    } catch (e) {
      showToast(`⚠️ ${e.message || 'Não foi possível atualizar.'}`);
    } finally {
      setBusy(false);
    }
  }

  function confirmCancel() {
    Alert.alert('Cancelar agendamento', 'Deseja realmente cancelar este agendamento?', [
      { text: 'Voltar', style: 'cancel' },
      { text: 'Cancelar agendamento', style: 'destructive', onPress: () => changeStatus(STATUS.CANCELADO) },
    ]);
  }

  if (!apt) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.muted}>{notFound ? 'Agendamento não encontrado.' : 'Carregando...'}</Text>
      </View>
    );
  }

  const status = apt.status || STATUS.CONFIRMADO;
  const serviceLabel = getServiceIds(apt)
    .map((sid) => {
      const s = SERVICES.find((x) => x.id === sid);
      return s ? `${s.icon} ${s.name}` : sid;
    })
    .join(' + ');

  // Aviso mostrando quando a notificação de lembrete vai tocar (só se ela foi agendada)
  const reminderText =
    status === STATUS.CONFIRMADO && apt.lembreteId
      ? `🔔 Lembrete programado para ${formatTime(getReminderDate(apt.date, apt.slot))} de ${formatDate(apt.date)}`
      : null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {reminderText ? (
        <View style={styles.reminder} testID="aviso-lembrete">
          <Text style={styles.reminderText}>{reminderText}</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Row label="Cliente" value={apt.name} />
        <Row label="Telefone" value={apt.phone} />
        <Row label="Veículo" value={apt.car} />
        {apt.plate ? <Row label="Placa" value={apt.plate} /> : null}
        <Row label="Serviço(s)" value={serviceLabel} />
        <Row label="Data" value={formatDate(apt.date, true)} />
        <Row label="Horário" value={apt.slot} />
        {apt.notes ? <Row label="Obs" value={apt.notes} /> : null}
        <Row label="Status" value={STATUS_LABEL[status]} />
      </View>

      {status !== STATUS.CONCLUIDO && status !== STATUS.CANCELADO ? (
        <View style={styles.actions}>
          <Button title="✔ Concluído" onPress={() => changeStatus(STATUS.CONCLUIDO)} loading={busy} testID="btn-concluir" />
          <Button title="✕ Cancelar" variant="danger" onPress={confirmCancel} disabled={busy} testID="btn-cancelar" />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.black },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingBottom: 40 },
  muted: { color: colors.gray, fontFamily: fonts.body },
  reminder: {
    backgroundColor: colors.orangeSoft,
    borderColor: colors.orange,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 16,
  },
  reminderText: { color: colors.light, fontFamily: fonts.bodyBold, fontSize: 13, textAlign: 'center' },
  card: {
    backgroundColor: colors.dark2,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 12,
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { color: colors.orange, fontFamily: fonts.bodyBold, fontSize: 12 },
  rowValue: { color: colors.white, fontFamily: fonts.body, fontSize: 14, flexShrink: 1, textAlign: 'right' },
  actions: { gap: 12 },
});
