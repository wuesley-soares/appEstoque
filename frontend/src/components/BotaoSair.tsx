import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

export function BotaoSair() {
  const { logout } = useAuth();
  return (
    <TouchableOpacity onPress={logout} style={styles.botao}>
      <Text style={styles.texto}>Sair</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: { marginRight: 16 },
  texto: { color: '#2563eb', fontWeight: '600' },
});