import { createContext, useState, useContext, useEffect } from 'react';
import { DEMO_USERS } from '../config/roles';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('apix_pap_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('apix_pap_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const user = DEMO_USERS[email];
      if (!user || user.password !== password) {
        throw new Error('Identifiants incorrects');
      }

      const token = btoa(JSON.stringify({ email, nom: user.nom, role: user.role }));
      const fullUserData = {
        email: user.email,
        nom: user.nom,
        role: user.role,
        department: user.department,
        token
      };
      setUser(fullUserData);
      localStorage.setItem('apix_pap_user', JSON.stringify(fullUserData));
      return fullUserData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('apix_pap_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
