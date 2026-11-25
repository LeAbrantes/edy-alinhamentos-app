import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Field from '../components/Field';
import SectionTitle from '../components/SectionTitle';
import { colors, fonts, radius } from '../config/theme';
import { SERVICES, SLOTS } from '../constants/services';
import { useAppointments } from '../context/AppointmentsContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  createAppointment,
  updateAppointment,
} from '../services/appointmentService';
import { scheduleReminder, sendConfirmationNotification } from '../services/notificationService';
import { getTakenSlots } from '../utils/appointments';
import { buildDateOptions, todayISO } from '../utils/dates';
import { maskPhone, maskPlate } from '../utils/masks';
import { validateAppointment } from '../utils/validation';

export default function NewAppointmentScreen({ navigation }) {
  const { appointments } = useAppointments();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [car, setCar] = useState('');
  const [plate, setPlate] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(todayISO());
  const [services, setServices] = useState([]);
  const [slot, setSlot] = useState(null);
  const [saving, setSaving] = useState(false);

  const dateOptions = useMemo(() => buildDateOptions(new Date(), 14), []);
  const takenSlots = useMemo(() => getTakenSlots(appointments, date), [appointments, date]);

  function toggleService(id) {
    setServices((cur) => (cur.includes(id) ? cur.filter((s) => s !== id) : [...cur, id]));
  }

  function selectDate(iso) {
    setDate(iso);
    setSlot(null); // o horário escolhido pode estar ocupado no novo dia
  }

  function resetForm() {
    setName('');
    setPhone('');
    setCar('');
    setPlate('');
    setNotes('');
    setServices([]);
    setSlot(null);
  }

  async function handleSave() {
    const error = validateAppointment({ name, phone, car, date, services, slot });
    if (error) return showToast(`⚠️ ${error}`);

    setSaving(true);
    try {
      const apt = await createAppointment({
        name: name.trim(),
        phone: phone.trim(),
        car: car.trim(),
        plate: plate.trim(),
        notes: notes.trim(),
        date,
        slot,
        service: services,
        criadoPor: user ? user.email : null,
      });

      // Notificações não podem impedir o agendamento de ser salvo
      try {
        await sendConfirmationNotification(apt);
        const reminderId = await scheduleReminder(apt);
        if (reminderId) await updateAppointment(apt.id, { lembreteId: reminderId });
      } catch (e) {
        console.warn('Falha ao agendar notificação:', e.message);
      }

      resetForm();
      showToast('✅ Agendamento confirmado!');
      navigation.navigate('Detalhes', { id: apt.id });
    } catch (e) {
      showToast(`⚠️ ${e.message || 'Erro ao salvar o agendamento.'}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <SectionTitle>Novo agendamento</SectionTitle>

      <Field label="NOME DO CLIENTE" value={name} onChangeText={setName} placeholder="Ex: João Silva" />
      <Field
        label="TELEFONE / WHATSAPP"
        value={phone}
        onChangeText={(v) => setPhone(maskPhone(v))}
        placeholder="(00) 00000-0000"
        keyboardType="phone-pad"
      />
      <Field label="VEÍCULO" value={car} onChangeText={setCar} placeholder="Ex: Fiat Uno Branco" />
      <Field
        label="PLACA"
        value={plate}
        onChangeText={(v) => setPlate(maskPlate(v))}
        placeholder="ABC-1234"
        autoCapitalize="characters"
      />
      <Field label="OBSERVAÇÕES" value={notes} onChangeText={setNotes} placeholder="Algum detalhe importante..." />

      <SectionTitle small>Data</SectionTitle>
      <FlatList
        horizontal
        data={dateOptions}
        keyExtractor={(d) => d.iso}
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 18 }}
        renderItem={({ item }) => {
          const selected = item.iso === date;
          return (
            <Pressable
              testID={`date-${item.iso}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => selectDate(item.iso)}
              style={[styles.dateChip, selected && styles.chipSelected]}
            >
              <Text style={[styles.dateWeek, selected && styles.textSelected]}>{item.weekday}</Text>
              <Text style={[styles.dateDay, selected && styles.textSelected]}>{item.day}</Text>
              <Text style={[styles.dateMonth, selected && styles.textSelected]}>{item.month}</Text>
            </Pressable>
          );
        }}
      />

      <SectionTitle small>Serviço</SectionTitle>
      <View style={styles.grid}>
        {SERVICES.map((s) => {
          const selected = services.includes(s.id);
          return (
            <Pressable
              key={s.id}
              testID={`service-${s.id}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => toggleService(s.id)}
              style={[styles.serviceCard, selected && styles.serviceSelected]}
            >
              <Text style={styles.serviceIcon}>{s.icon}</Text>
              <Text style={styles.serviceName}>{s.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <SectionTitle small>Horário</SectionTitle>
      <View style={styles.slots}>
        {SLOTS.map((s) => {
          const taken = takenSlots.includes(s);
          const selected = slot === s && !taken;
          return (
            <Pressable
              key={s}
              testID={`slot-${s}`}
              accessibilityRole="button"
              accessibilityState={{ disabled: taken, selected }}
              disabled={taken}
              onPress={() => setSlot(s)}
              style={[styles.slot, taken && styles.slotTaken, selected && styles.chipSelected]}
            >
              <Text style={[styles.slotText, taken && styles.slotTextTaken, selected && styles.textSelected]}>{s}</Text>
            </Pressable>
          );
        })}
      </View>

      <Button title="✔ Confirmar agendamento" onPress={handleSave} loading={saving} testID="btn-confirmar" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.black },
  content: { padding: 20, paddingBottom: 40 },
  dateChip: {
    backgroundColor: colors.dark2,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 62,
  },
  dateWeek: { color: colors.gray, fontFamily: fonts.bodyBold, fontSize: 11 },
  dateDay: { color: colors.white, fontFamily: fonts.title, fontSize: 24, lineHeight: 28 },
  dateMonth: { color: colors.gray, fontFamily: fonts.body, fontSize: 11 },
  chipSelected: { backgroundColor: colors.orange, borderColor: colors.orange },
  textSelected: { color: '#000' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  serviceCard: {
    width: '47.5%',
    backgroundColor: colors.dark2,
    borderColor: colors.border,
    borderWidth: 2,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  serviceSelected: { borderColor: colors.orange, backgroundColor: colors.orangeSoft },
  serviceIcon: { fontSize: 26, marginBottom: 4 },
  serviceName: { color: colors.light, fontFamily: fonts.bodyBold, fontSize: 13 },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 22 },
  slot: {
    backgroundColor: colors.dark2,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  slotTaken: { backgroundColor: '#1e1e1e', borderColor: '#2a2a2a' },
  slotText: { color: colors.light, fontFamily: fonts.bodyBold, fontSize: 14 },
  slotTextTaken: { color: '#444', textDecorationLine: 'line-through' },
});
