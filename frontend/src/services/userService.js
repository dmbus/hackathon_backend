import { api } from './api';

// Get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get current user profile
export const getUserProfile = async () => {
    const response = await api.get('/users/me', {
        headers: getAuthHeaders()
    });
    return response.data;
};

// Update user profile (name)
export const updateUserProfile = async (data) => {
    const response = await api.put('/users/me', data, {
        headers: getAuthHeaders()
    });
    return response.data;
};

// Get user settings
export const getUserSettings = async () => {
    const response = await api.get('/users/me/settings', {
        headers: getAuthHeaders()
    });
    return response.data;
};

// Update user settings
export const updateUserSettings = async (settings) => {
    const response = await api.put('/users/me/settings', settings, {
        headers: getAuthHeaders()
    });
    return response.data;
};

// Get user notifications
export const getUserNotifications = async () => {
    const response = await api.get('/users/me/notifications', {
        headers: getAuthHeaders()
    });
    return response.data;
};

// Mark notification as read
export const markNotificationRead = async (notificationId, read = true) => {
    const response = await api.put(`/users/me/notifications/${notificationId}`, 
        { read },
        { headers: getAuthHeaders() }
    );
    return response.data;
};

// Mark all notifications as read
export const markAllNotificationsRead = async () => {
    const response = await api.put('/users/me/notifications/mark-all-read', {}, {
        headers: getAuthHeaders()
    });
    return response.data;
};
