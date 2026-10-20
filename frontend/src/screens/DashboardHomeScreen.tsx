import { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { produtoApi, categoriaApi } from '../api/api';
import { Produto, Categoria } from '../types';
import { BotaoSair } from '../components/BotaoSair';

const LIMITE_ESTOQUE_BAIXO = 10;

export function DashboardHomeScreen() {
  const navigation = useNavigation();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useLayoutEffect(() => {
    navigation.setOptions({ headerRight: () => <BotaoSair /> });
  }, [navigation]);

  useEffect(() => {
    Promise.all([produtoApi.listar(), categoriaApi.listar()]).then(
      ([produtosData, categoriasData]) => {
        setProdutos(produtosData);
        setCategorias(categoriasData);
      },
    );
  }, []);

  const totalUnidadesEmEstoque = produtos.reduce((soma, p) => soma + p.quantidade, 0);
  const produtosEstoqueBaixo = produtos.filter((p) => p.quantidade < LIMITE_ESTOQUE_BAIXO);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Visão Geral</Text>

      <View style={styles.linhaCards}>
        <CardIndicador titulo="Produtos cadastrados" valor={produtos.length} />
        <CardIndicador titulo="Categorias" valor={categorias.length} />
        <CardIndicador titulo="Unidades em estoque" valor={totalUnidadesEmEstoque} />
        <CardIndicador
          titulo="Estoque baixo"
          valor={produtosEstoqueBaixo.length}
          destaque={produtosEstoqueBaixo.length > 0}
        />
      </View>

      {produtosEstoqueBaixo.length > 0 && (
        <View style={styles.secaoBaixo}>
          <Text style={styles.subtitulo}>
            Produtos com estoque baixo (abaixo de {LIMITE_ESTOQUE_BAIXO} unidades)
          </Text>
          <FlatList
            data={produtosEstoqueBaixo}
            keyExtractor={(p) => String(p.id)}
            renderItem={({ item }) => (
              <Text style={styles.itemLista}>
                {item.nome} — {item.quantidade} unidade(s)
              </Text>
            )}
          />
        </View>
      )}
    </View>
  );
}

function CardIndicador({
  titulo,
  valor,
  destaque = false,
}: {
  titulo: string;
  valor: number;
  destaque?: boolean;
}) {
  return (
    <View style={[styles.card, destaque && styles.cardDestaque]}>
      <Text style={styles.cardTitulo}>{titulo}</Text>
      <Text style={styles.cardValor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  subtitulo: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  linhaCards: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 16,
    minWidth: '45%',
    backgroundColor: '#fafafa',
  },
  cardDestaque: { backgroundColor: '#fef2f2' },
  cardTitulo: { fontSize: 13, color: '#666' },
  cardValor: { fontSize: 26, fontWeight: 'bold' },
  secaoBaixo: { marginTop: 24 },
  itemLista: { paddingVertical: 4 },
});