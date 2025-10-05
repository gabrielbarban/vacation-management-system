import { AuthResponse, LoginRequest } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const api = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    return response.json();
  },

  async getUsers() {
    const response = await fetch(`${API_URL}/users`, {
      headers: { ...getAuthHeader() },
    });

    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async createUser(data: { email: string; password: string; name: string; role: string; managerId: string | null }) {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader() 
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  },

  async deleteUser(id: number) {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });

    if (!response.ok) throw new Error('Failed to delete user');
  },

  async getVacations() {
    const response = await fetch(`${API_URL}/vacations`, {
      headers: { ...getAuthHeader() },
    });

    if (!response.ok) throw new Error('Failed to fetch vacations');
    return response.json();
  },

  async createVacation(data: { startDate: string; endDate: string }) {
    const response = await fetch(`${API_URL}/vacations`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader() 
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to create vacation');
    return response.json();
  },

  async approveVacation(id: number) {
    const response = await fetch(`${API_URL}/vacations/${id}/approve`, {
      method: 'PUT',
      headers: { ...getAuthHeader() },
    });

    if (!response.ok) throw new Error('Failed to approve vacation');
    return response.json();
  },

  async rejectVacation(id: number) {
    const response = await fetch(`${API_URL}/vacations/${id}/reject`, {
      method: 'PUT',
      headers: { ...getAuthHeader() },
    });

    if (!response.ok) throw new Error('Failed to reject vacation');
    return response.json();
  },

  async deleteVacation(id: number) {
    const response = await fetch(`${API_URL}/vacations/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });

    if (!response.ok) throw new Error('Failed to delete vacation');
  },
};