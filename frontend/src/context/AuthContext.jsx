import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cyclone_user');
    return saved ? JSON.parse(saved) : {
      id: 1,
      name: "NDRF Director Sharma",
      phone_number: "9876543210",
      role: "admin",
      preferred_language: "english",
      district: "Visakhapatnam"
    };
  });
  const [token, setToken] = useState(() => localStorage.getItem('cyclone_token') || 'demo-jwt-token');

  const login = async (phone_number, password) => {
    try {
      const res = await api.login({ phone_number, password });
      setUser(res.data.user);
      setToken(res.data.access_token);
      localStorage.setItem('cyclone_user', JSON.stringify(res.data.user));
      localStorage.setItem('cyclone_token', res.data.access_token);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.detail || "Login failed" 
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.register(userData);
      setUser(res.data.user);
      setToken(res.data.access_token);
      localStorage.setItem('cyclone_user', JSON.stringify(res.data.user));
      localStorage.setItem('cyclone_token', res.data.access_token);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.detail || "Registration failed" 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cyclone_user');
    localStorage.removeItem('cyclone_token');
  };

  const switchDemoRole = (roleName) => {
    const roleProfiles = {
      admin: {
        id: 1,
        name: "NDRF Director Sharma",
        phone_number: "9876543210",
        role: "admin",
        preferred_language: "english",
        district: "Visakhapatnam"
      },
      analyst: {
        id: 2,
        name: "Dr. Radhakrishnan (IMD Analyst)",
        phone_number: "9876543211",
        role: "analyst",
        preferred_language: "english",
        district: "Visakhapatnam"
      },
      citizen: {
        id: 3,
        name: "Praveen Kumar (Coastal Fisherfolk)",
        phone_number: "9876543212",
        role: "citizen",
        preferred_language: "telugu",
        district: "Visakhapatnam"
      }
    };
    const selected = roleProfiles[roleName] || roleProfiles.admin;
    setUser(selected);
    localStorage.setItem('cyclone_user', JSON.stringify(selected));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
