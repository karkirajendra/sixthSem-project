// src/utils/contactApi.js
import { API_URL } from '../config';

export const submitContactForm = async (formData) => {
  try {
    const response = await fetch(`${API_URL}/api/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      let data = null;
      try {
        data = await response.json();
      } catch {
        // ignore
      }

      return {
        success: false,
        status: response.status,
        message: data?.message || `HTTP error! status: ${response.status}`,
        errors: data?.errors || [],
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return { success: false, message: error.message };
  }
};

export const getContacts = async () => {
  try {
    const response = await fetch(`${API_URL}/api/contacts`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return { success: false, error: error.message };
  }
};