import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const location = useLocation();

  // Helper to safely parse JSON from localStorage
  const safeParse = (key) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  // Customer session state
  const [customerUser, setCustomerUser] = useState(() => {
    const cust = safeParse('reloop_customer_user');
    if (cust) return cust;
    const legacy = safeParse('reloop_user');
    return legacy && legacy.role === 'customer' ? legacy : null;
  });

  const [customerToken, setCustomerToken] = useState(() => {
    return (
      localStorage.getItem('reloop_customer_token') ||
      (safeParse('reloop_user')?.role === 'customer' ? localStorage.getItem('reloop_token') : null) ||
      null
    );
  });

  // Admin session state
  const [adminUser, setAdminUser] = useState(() => {
    const admin = safeParse('reloop_admin_user');
    if (admin) return admin;
    const legacy = safeParse('reloop_user');
    return legacy && legacy.role === 'admin' ? legacy : null;
  });

  const [adminToken, setAdminToken] = useState(() => {
    return (
      localStorage.getItem('reloop_admin_token') ||
      (safeParse('reloop_user')?.role === 'admin' ? localStorage.getItem('reloop_token') : null) ||
      null
    );
  });

  const [loading, setLoading] = useState(false);

  // Cross-tab synchronization via storage events
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'reloop_customer_token' || e.key === 'reloop_customer_user') {
        const u = safeParse('reloop_customer_user');
        const t = localStorage.getItem('reloop_customer_token');
        setCustomerUser(u);
        setCustomerToken(t || null);
      }
      if (e.key === 'reloop_admin_token' || e.key === 'reloop_admin_user') {
        const u = safeParse('reloop_admin_user');
        const t = localStorage.getItem('reloop_admin_token');
        setAdminUser(u);
        setAdminToken(t || null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Determine active context based on current route
  const isAdminRoute = location.pathname.startsWith('/admin');
  const user = isAdminRoute ? adminUser : customerUser;
  const token = isAdminRoute ? adminToken : customerToken;
  const isAdmin = Boolean(adminUser && adminUser.role === 'admin');

  const login = (userData, userToken) => {
    if (userData?.role === 'admin') {
      setAdminUser(userData);
      setAdminToken(userToken);
      localStorage.setItem('reloop_admin_user', JSON.stringify(userData));
      localStorage.setItem('reloop_admin_token', userToken);
    } else {
      setCustomerUser(userData);
      setCustomerToken(userToken);
      localStorage.setItem('reloop_customer_user', JSON.stringify(userData));
      localStorage.setItem('reloop_customer_token', userToken);
      // Legacy fallback
      localStorage.setItem('reloop_user', JSON.stringify(userData));
      localStorage.setItem('reloop_token', userToken);
    }
  };

  const logout = (scope) => {
    const shouldLogoutAdmin = scope === 'admin' || (!scope && isAdminRoute) || scope === 'all';
    const shouldLogoutCustomer = scope === 'customer' || (!scope && !isAdminRoute) || scope === 'all';

    if (shouldLogoutAdmin) {
      setAdminUser(null);
      setAdminToken(null);
      localStorage.removeItem('reloop_admin_user');
      localStorage.removeItem('reloop_admin_token');
    }

    if (shouldLogoutCustomer) {
      setCustomerUser(null);
      setCustomerToken(null);
      localStorage.removeItem('reloop_customer_user');
      localStorage.removeItem('reloop_customer_token');
      localStorage.removeItem('reloop_user');
      localStorage.removeItem('reloop_token');
    }
  };

  const setUser = (newUserData) => {
    if (isAdminRoute) {
      setAdminUser(newUserData);
      if (newUserData) localStorage.setItem('reloop_admin_user', JSON.stringify(newUserData));
      else localStorage.removeItem('reloop_admin_user');
    } else {
      setCustomerUser(newUserData);
      if (newUserData) {
        localStorage.setItem('reloop_customer_user', JSON.stringify(newUserData));
        localStorage.setItem('reloop_user', JSON.stringify(newUserData));
      } else {
        localStorage.removeItem('reloop_customer_user');
        localStorage.removeItem('reloop_user');
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin,
        adminUser,
        adminToken,
        customerUser,
        customerToken,
        loading,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

