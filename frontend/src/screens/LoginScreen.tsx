import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit() {
    setErro('');
    setCarregando(true);
    try {
      await login(email, senha);
      
    } catch (err: any) {
      setErro(err.response?.data?.message ?? 'Erro ao fazer login');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.titulo}>Controle de Estoque</Text>
        <Text style={styles.subtitulo}>Entre com suas credenciais</Text>

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput style={styles.input} value={senha} onChangeText={setSenha} secureTextEntry />

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <TouchableOpacity style={styles.botao} onPress={handleSubmit} disabled={carregando}>
          <Text style={styles.botaoTexto}>{carregando ? 'Entrando...' : 'Entrar'}</Text>
        </TouchableOpacity>

        <Text style={styles.dica}>Use professor@ifpr.edu.br / 123456 (usuário mockado)</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  card: { padding: 24, borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  subtitulo: { color: '#666', marginBottom: 16 },
  label: { marginTop: 8, marginBottom: 4, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10 },
  erro: { color: 'red', marginTop: 8 },
  botao: { backgroundColor: '#2563eb', padding: 12, borderRadius: 6, marginTop: 16 },
  botaoTexto: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  dica: { fontSize: 12, color: '#999', marginTop: 16 },
});