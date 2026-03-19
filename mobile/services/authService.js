import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

const CONDUCTOR_KEY = '@conductor_session';

// Login a conductor with email and password
export const loginConductor = async (email, password) => {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Call backend login endpoint
    const response = await axios.post(`${API_CONFIG.BASE_URL}/api/conductors/login`, {
      email: email.trim(),
      password: password.trim(),
    });

    if (response.data.success) {
      const session = {
        id: response.data.conductor.id,
        firstName: response.data.conductor.firstName,
        lastName: response.data.conductor.lastName,
        email: response.data.conductor.email,
        phone: response.data.conductor.phone,
        location: response.data.conductor.location,
        status: response.data.conductor.status,
        token: response.data.token,
        loginTime: new Date().toISOString(),
      };

      await AsyncStorage.setItem(CONDUCTOR_KEY, JSON.stringify(session));
      return session;
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Login failed';
    console.error('Login error:', errorMessage);
    throw new Error(errorMessage);
  }
};

// Logout a conductor
export const logoutConductor = async () => {
  try {
    await AsyncStorage.removeItem(CONDUCTOR_KEY);
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
};

// Get current conductor session
export const getConductorSession = async () => {
  try {
    const session = await AsyncStorage.getItem(CONDUCTOR_KEY);
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
};

// Check if conductor is logged in
export const isConductorLoggedIn = async () => {
  const session = await getConductorSession();
  return !!session;
};

// Get conductor ID from session
export const getConductorId = async () => {
  const session = await getConductorSession();
  return session?.id || null;
};
