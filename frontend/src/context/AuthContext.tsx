import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Usuario } from '../types';
import { authApi } from '../api/api';

interface AuthContextType {
  usuario: Usuario | null;
  logado: boolean;
  carregando: boolean; // true enquanto ainda estamos lendo o AsyncStorage
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Ao abrir o app, tentamos recuperar um usuário já logado
  // anteriormente, para não pedir login toda vez que o app é reaberto.
  useEffect(() => {
    async function restaurarSessao() {
      const salvo = await AsyncStorage.getItem('usuario');
      if (salvo) {
        setUsuario(JSON.parse(salvo));
      }
      setCarregando(false);
    }
    restaurarSessao();
  }, []);

  async function login(email: string, senha: string) {
    // Chama a "API" (hoje é o mock, na Parte 3 será o Axios real). Essa
    // troca não vai exigir nenhuma mudança aqui dentro.
    const resposta = await authApi.login(email, senha);
    await AsyncStorage.setItem('accessToken', resposta.accessToken);
    await AsyncStorage.setItem('usuario', JSON.stringify(resposta.usuario));
    setUsuario(resposta.usuario);
  }

  async function logout() {
    await AsyncStorage.multiRemove(['accessToken', 'usuario']);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, logado: !!usuario, carregando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}