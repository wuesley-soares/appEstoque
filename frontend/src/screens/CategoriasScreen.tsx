import { useEffect, useState, useLayoutEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Categoria } from '../types';
import { categoriaApi } from '../api/api';
import { ListaCategorias } from '../components/ListaCategorias';
import { FormularioCategoria } from '../components/FormularioCategoria';
import { BotaoSair } from '../components/BotaoSair';

export function CategoriasScreen() {
  const navigation = useNavigation();
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useLayoutEffect(() => {
    navigation.setOptions({ headerRight: () => <BotaoSair /> });
  }, [navigation]);

  async function carregar() {
    setCategorias(await categoriaApi.listar());
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View>
        <ListaCategorias categorias={categorias} />
        <FormularioCategoria onCategoriaCriada={carregar} />
      </View>
    </ScrollView>
  );
}