import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Field from '../components/Field';
import SectionTitle from '../components/SectionTitle';
import { colors, fonts } from '../config/theme';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError('');
    setLoading(true);
    try {
      await signUp({ nome, email, senha, confirmar });
    } catch (e) {
      setError(e.message || 'Não foi possível criar a conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <SectionTitle>Criar conta</SectionTitle>
          <View>
            <Field label="NOME" value={nome} onChangeText={setNome} placeholder="Seu nome" />
            <Field
              label="E-MAIL"
              value={email}
              onChangeText={setEmail}
              placeholder="voce@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Field
              label="SENHA"
              value={senha}
              onChangeText={setSenha}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
              autoCapitalize="none"
            />
            <Field
              label="CONFIRMAR SENHA"
              value={confirmar}
              onChangeText={setConfirmar}
              placeholder="Repita a senha"
              secureTextEntry
              autoCapitalize="none"
            />

            {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}

            <Button title="Cadastrar" onPress={handleRegister} loading={loading} testID="btn-cadastrar" />
            <Button
              title="Já tenho conta"
              variant="outline"
              onPress={() => navigation.goBack()}
              style={{ marginTop: 12 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  content: { padding: 24, flexGrow: 1, justifyContent: 'center' },
  error: { color: colors.danger, fontFamily: fonts.bodyBold, fontSize: 13, marginBottom: 12 },
});
