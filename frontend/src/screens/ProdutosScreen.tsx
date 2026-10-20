
import { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { BotaoSair } from '../components/BotaoSair';
import { produtoApi, categoriaApi } from '../api/api';
import { Produto, Categoria } from '../types';

export function ProdutosScreen() {
  const navigation = useNavigation();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | undefined>();
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <BotaoSair />,
    });
  }, [navigation]);

  async function carregarDados() {
    try {
      const [listaProdutos, listaCategorias] = await Promise.all([
        produtoApi.listar(),
        categoriaApi.listar(),
      ]);

      setProdutos(listaProdutos);
      setCategorias(listaCategorias);

      setCategoriaId((atual) => {
        if (listaCategorias.some((c) => c.id === atual)) {
          return atual;
        }
        return listaCategorias[0]?.id;
      });
    } catch {
      setErro('Não foi possível carregar os produtos e as categorias.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function handleSubmit() {
    const nomeLimpo = nome.trim();
    const precoNumero = Number(preco.replace(',', '.'));
    const quantidadeNumero = Number(quantidade);

    if (
      !nomeLimpo ||
      preco.trim() === '' ||
      quantidade.trim() === '' ||
      categoriaId === undefined
    ) {
      setErro('Preencha todos os campos do formulário.');
      return;
    }

    if (!Number.isFinite(precoNumero) || precoNumero <= 0) {
      setErro('Informe um preço válido maior que zero.');
      return;
    }

    if (
      !Number.isInteger(quantidadeNumero) ||
      quantidadeNumero < 0
    ) {
      setErro('A quantidade deve ser um número inteiro igual ou maior que zero.');
      return;
    }

    setErro('');
    setSalvando(true);

    try {
      await produtoApi.criar({
        nome: nomeLimpo,
        preco: precoNumero,
        quantidade: quantidadeNumero,
        categoriaId,
      });

      setNome('');
      setPreco('');
      setQuantidade('');
      await carregarDados();

      Alert.alert('Sucesso', 'Produto cadastrado com sucesso!');
    } catch {
      setErro('Não foi possível cadastrar o produto.');
    } finally {
      setSalvando(false);
    }
  }

  const moeda = (valor: number) =>
    valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.titulo}>Produtos</Text>
      <Text style={styles.subtitulo}>
        Consulte o estoque e cadastre novos produtos.
      </Text>

      <View style={styles.card}>
        <Text style={styles.tituloCard}>Cadastrar produto</Text>

        <Text style={styles.label}>Nome do produto *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: Suco de Uva"
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>Preço (R$) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: 6,00"
          value={preco}
          onChangeText={setPreco}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Quantidade inicial *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: 10"
          value={quantidade}
          onChangeText={setQuantidade}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Categoria *</Text>
        <View style={styles.seletor}>
          <Picker
            selectedValue={categoriaId}
            onValueChange={(valor) => setCategoriaId(valor)}
            enabled={categorias.length > 0}
          >
            {categorias.length === 0 ? (
              <Picker.Item
                label="Nenhuma categoria cadastrada"
                value={undefined}
              />
            ) : (
              categorias.map((categoria) => (
                <Picker.Item
                  key={categoria.id}
                  label={categoria.nome}
                  value={categoria.id}
                />
              ))
            )}
          </Picker>
        </View>

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <TouchableOpacity
          style={[
            styles.botao,
            salvando && styles.botaoDesabilitado,
          ]}
          onPress={handleSubmit}
          disabled={salvando || categorias.length === 0}
        >
          <Text style={styles.textoBotao}>
            {salvando ? 'Cadastrando...' : 'Cadastrar produto'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.tituloLista}>Produtos cadastrados</Text>

      {carregando ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : produtos.length === 0 ? (
        <Text style={styles.vazio}>Nenhum produto cadastrado.</Text>
      ) : (
        produtos.map((produto) => (
          <View key={produto.id} style={styles.produto}>
            <Text style={styles.nomeProduto}>
              {produto.id} - {produto.nome}
            </Text>
            <Text style={styles.detalhe}>
              Categoria: {produto.categoria?.nome ?? 'Sem categoria'}
            </Text>
            <Text style={styles.detalhe}>
              Preço: {moeda(produto.preco)}
            </Text>
            <Text style={styles.estoque}>
              Estoque: {produto.quantidade} unidade(s)
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  conteudo: {
    padding: 16,
    paddingBottom: 32,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitulo: {
    color: '#64748b',
    marginTop: 6,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  tituloCard: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1e293b',
  },
  label: {
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    padding: 10,
    marginBottom: 14,
    backgroundColor: '#fff',
  },
  seletor: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    marginBottom: 14,
  },
  botao: {
    backgroundColor: '#2563eb',
    padding: 13,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
  },
  erro: {
    color: '#dc2626',
    marginBottom: 8,
  },
  tituloLista: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  vazio: {
    color: '#64748b',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  produto: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  nomeProduto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 6,
  },
  detalhe: {
    color: '#475569',
    marginTop: 3,
  },
  estoque: {
    color: '#166534',
    fontWeight: '600',
    marginTop: 6,
  },
});
