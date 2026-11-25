import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Field from '../components/Field';
import { colors, fonts } from '../config/theme';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    setLoading(true);
    try {
      await signIn({ email, senha });
      // ao logar, o AppNavigator troca automaticamente para as telas internas
    } catch (e) {
      setError(e.message || 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Image source={require('../../assets/logo.png')} style={styles.logo} />
          <Text style={styles.brand}>EDY</Text>
          <Text style={styles.subtitle}>Alinhamentos & Serviços</Text>

          <View style={styles.form}>
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
              placeholder="Sua senha"
              secureTextEntry
              autoCapitalize="none"
              onSubmitEditing={handleLogin}
            />

            {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}

            <Button title="Entrar" onPress={handleLogin} loading={loading} testID="btn-entrar" />
            <Button
              title="Criar conta"
              variant="outline"
              onPress={() => navigation.navigate('Cadastro')}
              style={{ marginTop: 12 }}
              testID="btn-criar-conta"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  content: { padding: 24, alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  logo: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: colors.orange },
  brand: { color: colors.white, fontFamily: fonts.title, fontSize: 44, letterSpacing: 6, marginTop: 12 },
  subtitle: { color: colors.orange, fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2, marginBottom: 28 },
  form: { width: '100%', maxWidth: 420 },
  error: { color: colors.danger, fontFamily: fonts.bodyBold, fontSize: 13, marginBottom: 12 },
});
