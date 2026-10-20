
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
import { produtoApi, movimentacaoApi } from '../api/api';
import { Produto, Movimentacao, TipoMovimentacao } from '../types';

export function MovimentacoesScreen() {
  const navigation = useNavigation();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [produtoId, setProdutoId] = useState<number | undefined>();
  const [tipo, setTipo] = useState<TipoMovimentacao>('ENTRADA');
  const [quantidade, setQuantidade] = useState('');
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
      const [listaProdutos, listaMovimentacoes] = await Promise.all([
        produtoApi.listar(),
        movimentacaoApi.listar(),
      ]);

      setProdutos(listaProdutos);
      setMovimentacoes(listaMovimentacoes);

      setProdutoId((atual) => {
        if (listaProdutos.some((p) => p.id === atual)) {
          return atual;
        }
        return listaProdutos[0]?.id;
      });
    } catch {
      setErro('Não foi possível carregar os dados.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function handleSubmit() {
    const quantidadeNumero = Number(quantidade);

    if (
      produtoId === undefined ||
      quantidade.trim() === '' ||
      !tipo
    ) {
      setErro('Preencha todos os campos do formulário.');
      return;
    }

    if (!Number.isInteger(quantidadeNumero) || quantidadeNumero <= 0) {
      setErro('A quantidade deve ser um número inteiro maior que zero.');
      return;
    }

    const produtoSelecionado = produtos.find(
      (produto) => produto.id === produtoId
    );

    if (!produtoSelecionado) {
      setErro('Selecione um produto válido.');
      return;
    }

    if (
      tipo === 'SAIDA' &&
      quantidadeNumero > produtoSelecionado.quantidade
    ) {
      setErro(
        `Estoque insuficiente. Disponível: ${produtoSelecionado.quantidade} unidade(s).`
      );
      return;
    }

    setErro('');
    setSalvando(true);

    try {
      await movimentacaoApi.criar({
        produtoId,
        tipo,
        quantidade: quantidadeNumero,
      });

      setQuantidade('');
      await carregarDados();

      Alert.alert('Sucesso', 'Movimentação registrada com sucesso!');
    } catch (e: unknown) {
      const mensagem =
        typeof e === 'object' &&
        e !== null &&
        'response' in e &&
        typeof e.response === 'object' &&
        e.response !== null &&
        'data' in e.response &&
        typeof e.response.data === 'object' &&
        e.response.data !== null &&
        'message' in e.response.data &&
        typeof e.response.data.message === 'string'
          ? e.response.data.message
          : 'Não foi possível registrar a movimentação.';

      setErro(mensagem);
    } finally {
      setSalvando(false);
    }
  }

  function formatarData(data: string) {
    const dataConvertida = new Date(data);

    if (Number.isNaN(dataConvertida.getTime())) {
      return 'Data indisponível';
    }

    return dataConvertida.toLocaleString('pt-BR');
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.titulo}>Movimentações</Text>
      <Text style={styles.subtitulo}>
        Registre entradas e saídas e consulte o histórico do estoque.
      </Text>

      <View style={styles.card}>
        <Text style={styles.tituloCard}>Nova movimentação</Text>

        <Text style={styles.label}>Produto *</Text>
        <View style={styles.seletor}>
          <Picker
            selectedValue={produtoId}
            onValueChange={(valor) => setProdutoId(valor)}
            enabled={produtos.length > 0}
          >
            {produtos.length === 0 ? (
              <Picker.Item
                label="Nenhum produto cadastrado"
                value={undefined}
              />
            ) : (
              produtos.map((produto) => (
                <Picker.Item
                  key={produto.id}
                  label={`${produto.nome} - Estoque: ${produto.quantidade}`}
                  value={produto.id}
                />
              ))
            )}
          </Picker>
        </View>

        <Text style={styles.label}>Tipo de movimentação *</Text>
        <View style={styles.seletor}>
          <Picker
            selectedValue={tipo}
            onValueChange={(valor) => setTipo(valor)}
          >
            <Picker.Item label="Entrada" value="ENTRADA" />
            <Picker.Item label="Saída" value="SAIDA" />
          </Picker>
        </View>

        <Text style={styles.label}>Quantidade *</Text>
        <TextInput
          style={styles.input}
          placeholder="Informe a quantidade"
          value={quantidade}
          onChangeText={setQuantidade}
          keyboardType="number-pad"
        />

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <TouchableOpacity
          style={[
            styles.botao,
            salvando && styles.botaoDesabilitado,
          ]}
          onPress={handleSubmit}
          disabled={salvando || produtos.length === 0}
        >
          <Text style={styles.textoBotao}>
            {salvando ? 'Registrando...' : 'Registrar movimentação'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.tituloLista}>Histórico de movimentações</Text>

      {carregando ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : movimentacoes.length === 0 ? (
        <Text style={styles.vazio}>
          Nenhuma movimentação registrada.
        </Text>
      ) : (
        movimentacoes.map((movimentacao) => (
          <View key={movimentacao.id} style={styles.movimentacao}>
            <View style={styles.linhaTopo}>
              <Text style={styles.nomeProduto}>
                {movimentacao.produto.nome}
              </Text>

              <View
                style={[
                  styles.etiqueta,
                  movimentacao.tipo === 'ENTRADA'
                    ? styles.etiquetaEntrada
                    : styles.etiquetaSaida,
                ]}
              >
                <Text
                  style={[
                    styles.textoEtiqueta,
                    movimentacao.tipo === 'ENTRADA'
                      ? styles.textoEntrada
                      : styles.textoSaida,
                  ]}
                >
                  {movimentacao.tipo === 'ENTRADA' ? 'Entrada' : 'Saída'}
                </Text>
              </View>
            </View>

            <Text style={styles.detalhe}>
              Data: {formatarData(movimentacao.criadoEm)}
            </Text>

            <Text
              style={[
                styles.quantidade,
                movimentacao.tipo === 'ENTRADA'
                  ? styles.textoEntrada
                  : styles.textoSaida,
              ]}
            >
              {movimentacao.tipo === 'ENTRADA' ? '+' : '-'}
              {movimentacao.quantidade} unidade(s)
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
  movimentacao: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  linhaTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  nomeProduto: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  etiqueta: {
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  etiquetaEntrada: {
    backgroundColor: '#dcfce7',
  },
  etiquetaSaida: {
    backgroundColor: '#fee2e2',
  },
  textoEtiqueta: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  textoEntrada: {
    color: '#15803d',
  },
  textoSaida: {
    color: '#b91c1c',
  },
  detalhe: {
    color: '#64748b',
    marginTop: 3,
  },
  quantidade: {
    fontWeight: 'bold',
    marginTop: 8,
  },
});
