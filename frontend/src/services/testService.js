const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.stsTokenManager && user.stsTokenManager.accessToken) {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.stsTokenManager.accessToken}`
        };
    }
    return {
        'Content-Type': 'application/json'
    };
};

export const testService = {
    /**
     * Get available CEFR levels with test question counts and user's best scores.
     */
    getLevels: async () => {
        try {
            const response = await fetch(`${API_URL}/tests/levels`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch test levels');
            return await response.json();
        } catch (error) {
            console.error("Error fetching test levels:", error);
            return [];
        }
    },

    /**
     * Start a new test session for a specific CEFR level.
     * Returns 20 random questions.
     */
    startTest: async (level) => {
        try {
            const response = await fetch(`${API_URL}/tests/${level}/start`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Failed to start test');
            }
            return await response.json();
        } catch (error) {
            console.error("Error starting test:", error);
            throw error;
        }
    },

    /**
     * Submit test answers and get results.
     */
    submitTest: async (level, answers) => {
        try {
            const response = await fetch(`${API_URL}/tests/${level}/submit`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ answers })
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Failed to submit test');
            }
            return await response.json();
        } catch (error) {
            console.error("Error submitting test:", error);
            throw error;
        }
    },

    /**
     * Get the user's test history.
     */
    getHistory: async (skip = 0, limit = 20) => {
        try {
            const response = await fetch(`${API_URL}/tests/history?skip=${skip}&limit=${limit}`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch test history');
            return await response.json();
        } catch (error) {
            console.error("Error fetching test history:", error);
            return [];
        }
    }
};
