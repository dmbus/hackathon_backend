/**
 * Pronunciation practice service for API interactions.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Get authentication headers from localStorage.
 */
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (token) {
        return {
            'Authorization': `Bearer ${token}`
        };
    }
    return {};
};

/**
 * Extract error message from response or error object
 */
const getErrorMessage = (error, defaultMessage) => {
    if (!error) {
        return defaultMessage;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (error && typeof error === 'object') {
        if (error.detail) {
            if (typeof error.detail === 'string') {
                return error.detail;
            }
            if (Array.isArray(error.detail) && error.detail.length > 0) {
                const firstError = error.detail[0];
                return firstError.msg || firstError.message || JSON.stringify(firstError);
            }
            if (typeof error.detail === 'object') {
                return error.detail.msg || error.detail.message || JSON.stringify(error.detail);
            }
        }
        return error.message || error.error || defaultMessage;
    }
    return defaultMessage;
};

export const pronunciationService = {
    /**
     * Get all pronunciation modules with user progress.
     * @param {string} difficulty - Optional difficulty filter (beginner, intermediate, advanced)
     * @returns {Promise<Array>} - Array of pronunciation modules
     */
    getModules: async (difficulty = null) => {
        try {
            let url = `${API_URL}/pronunciation/modules`;
            if (difficulty) {
                url += `?difficulty=${encodeURIComponent(difficulty)}`;
            }

            const response = await fetch(url, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Session expired. Please log in again.');
                }
                const errorData = await response.json().catch(() => null);
                throw new Error(getErrorMessage(errorData, 'Failed to fetch modules'));
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching pronunciation modules:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(getErrorMessage(error, 'Failed to fetch modules'));
        }
    },

    /**
     * Get a specific pronunciation module with all exercises.
     * @param {string} soundId - The sound module ID
     * @returns {Promise<Object>} - The module with exercises
     */
    getModule: async (soundId) => {
        try {
            const response = await fetch(
                `${API_URL}/pronunciation/modules/${encodeURIComponent(soundId)}`,
                { headers: getAuthHeaders() }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Session expired. Please log in again.');
                }
                if (response.status === 404) {
                    throw new Error('Module not found');
                }
                const errorData = await response.json().catch(() => null);
                throw new Error(getErrorMessage(errorData, 'Failed to fetch module'));
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching pronunciation module:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(getErrorMessage(error, 'Failed to fetch module'));
        }
    },

    /**
     * Get a specific exercise with benchmark audio.
     * @param {string} soundId - The sound module ID
     * @param {number} index - The exercise index
     * @returns {Promise<Object>} - Exercise with benchmark audio URL
     */
    getExercise: async (soundId, index) => {
        try {
            const response = await fetch(
                `${API_URL}/pronunciation/modules/${encodeURIComponent(soundId)}/exercises/${index}`,
                { headers: getAuthHeaders() }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Session expired. Please log in again.');
                }
                if (response.status === 404) {
                    throw new Error('Exercise not found');
                }
                const errorData = await response.json().catch(() => null);
                throw new Error(getErrorMessage(errorData, 'Failed to fetch exercise'));
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching exercise:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(getErrorMessage(error, 'Failed to fetch exercise'));
        }
    },

    /**
     * Submit a pronunciation recording for analysis.
     * @param {Blob} audioBlob - The recorded audio blob
     * @param {string} soundId - The sound module ID
     * @param {number} exerciseIndex - The exercise index
     * @returns {Promise<Object>} - Analysis result with score, feedback, etc.
     */
    analyzePronunciation: async (audioBlob, soundId, exerciseIndex) => {
        try {
            const formData = new FormData();

            // Append audio file
            const mimeType = audioBlob.type || 'audio/webm';
            const extension = mimeType.includes('webm') ? 'webm' : 'mp3';
            formData.append('audio', audioBlob, `recording.${extension}`);

            // Append metadata
            formData.append('sound_id', soundId);
            formData.append('exercise_index', exerciseIndex.toString());

            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const response = await fetch(`${API_URL}/pronunciation/analyze`, {
                method: 'POST',
                headers: headers,
                body: formData
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Session expired. Please log in again.');
                }
                const errorData = await response.json().catch(() => null);
                throw new Error(getErrorMessage(errorData, 'Failed to analyze pronunciation'));
            }

            return await response.json();
        } catch (error) {
            console.error("Error analyzing pronunciation:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(getErrorMessage(error, 'Failed to analyze pronunciation'));
        }
    },

    /**
     * Get pronunciation practice history.
     * @param {number} skip - Number of records to skip
     * @param {number} limit - Maximum records to return
     * @param {string} soundId - Optional filter by sound module
     * @returns {Promise<Array>} - Array of history items
     */
    getHistory: async (skip = 0, limit = 20, soundId = null) => {
        try {
            let url = `${API_URL}/pronunciation/history?skip=${skip}&limit=${limit}`;
            if (soundId) {
                url += `&sound_id=${encodeURIComponent(soundId)}`;
            }

            const response = await fetch(url, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Session expired. Please log in again.');
                }
                const errorData = await response.json().catch(() => null);
                throw new Error(getErrorMessage(errorData, 'Failed to fetch history'));
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching pronunciation history:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(getErrorMessage(error, 'Failed to fetch history'));
        }
    },

    /**
     * Get overall pronunciation statistics.
     * @returns {Promise<Object>} - Stats including total sessions, avg score, weak sounds
     */
    getStats: async () => {
        try {
            const response = await fetch(
                `${API_URL}/pronunciation/stats`,
                { headers: getAuthHeaders() }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Session expired. Please log in again.');
                }
                const errorData = await response.json().catch(() => null);
                throw new Error(getErrorMessage(errorData, 'Failed to fetch stats'));
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching pronunciation stats:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(getErrorMessage(error, 'Failed to fetch stats'));
        }
    },

    /**
     * Get recommended modules based on user's weak areas.
     * @param {number} limit - Maximum modules to return
     * @returns {Promise<Array>} - Array of recommended modules
     */
    getRecommended: async (limit = 3) => {
        try {
            const response = await fetch(
                `${API_URL}/pronunciation/recommended?limit=${limit}`,
                { headers: getAuthHeaders() }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Session expired. Please log in again.');
                }
                const errorData = await response.json().catch(() => null);
                throw new Error(getErrorMessage(errorData, 'Failed to fetch recommendations'));
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching recommendations:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(getErrorMessage(error, 'Failed to fetch recommendations'));
        }
    },

    /**
     * Get available difficulty levels.
     * @returns {Promise<string[]>} - Array of difficulty levels
     */
    getDifficultyLevels: async () => {
        try {
            const response = await fetch(
                `${API_URL}/pronunciation/difficulty-levels`,
                { headers: getAuthHeaders() }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(getErrorMessage(errorData, 'Failed to fetch difficulty levels'));
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching difficulty levels:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(getErrorMessage(error, 'Failed to fetch difficulty levels'));
        }
    }
};

export default pronunciationService;
