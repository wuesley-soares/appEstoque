import { createDrawerNavigator } from '@react-navigation/drawer';
import { DashboardHomeScreen } from '../screens/DashboardHomeScreen';
import { CategoriasScreen } from '../screens/CategoriasScreen';
import { ProdutosScreen } from '../screens/ProdutosScreen';
import { MovimentacoesScreen } from '../screens/MovimentacoesScreen';

export type DashboardDrawerParamList = {
  Inicio: undefined;
  Categorias: undefined;
  Produtos: undefined;
  Movimentacoes: undefined;
};

const Drawer = createDrawerNavigator<DashboardDrawerParamList>();

export function DashboardDrawerNavigator() {
  return (
    <Drawer.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
      <Drawer.Screen name="Inicio" component={DashboardHomeScreen} options={{ title: 'Início' }} />
      <Drawer.Screen name="Categorias" component={CategoriasScreen} />
      <Drawer.Screen name="Produtos" component={ProdutosScreen} />
      <Drawer.Screen
        name="Movimentacoes"
        component={MovimentacoesScreen}
        options={{ title: 'Movimentações' }}
      />
    </Drawer.Navigator>
  );
}