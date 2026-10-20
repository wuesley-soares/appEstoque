import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { categoriaApi } from '../api/api';

interface Props {
  onCategoriaCriada: () => void;
}

export function FormularioCategoria({ onCategoriaCriada }: Props) {
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');

  async function handleSubmit() {
    if (!nome) {
      setErro('Informe o nome da categoria');
      return;
    }
    setErro('');
    await categoriaApi.criar(nome);
    setNome('');
    onCategoriaCriada();
  }

  return (
    <View style={styles.form}>
      <Text style={styles.titulo}>Nova Categoria</Text>
      <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
      <TouchableOpacity style={styles.botao} onPress={handleSubmit}>
        <Text style={styles.botaoTexto}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { marginTop: 16 },
  titulo: { fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 8 },
  erro: { color: 'red', marginBottom: 8 },
  botao: { backgroundColor: '#2563eb', padding: 10, borderRadius: 6 },
  botaoTexto: { color: '#fff', textAlign: 'center', fontWeight: '600' },
});