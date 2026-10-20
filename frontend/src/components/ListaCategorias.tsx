import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Categoria } from '../types';

interface Props {
  categorias: Categoria[];
}

export function ListaCategorias({ categorias }: Props) {
  return (
    <View style={styles.tabela}>
      <View style={[styles.linha, styles.cabecalho]}>
        <Text style={[styles.celula, styles.celulaCabecalho]}>ID</Text>
        <Text style={[styles.celula, styles.celulaCabecalho, { flex: 2 }]}>Nome</Text>
      </View>
      <FlatList
        data={categorias}
        keyExtractor={(c) => String(c.id)}
        renderItem={({ item }) => (
          <View style={styles.linha}>
            <Text style={styles.celula}>{item.id}</Text>
            <Text style={[styles.celula, { flex: 2 }]}>{item.nome}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabela: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6 },
  linha: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', padding: 8 },
  cabecalho: { backgroundColor: '#f5f5f5' },
  celula: { flex: 1 },
  celulaCabecalho: { fontWeight: '600' },
});