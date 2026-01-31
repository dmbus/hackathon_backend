
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

export const wordService = {
    getDecks: async () => {
        try {
            const response = await fetch(`${API_URL}/words/`);
            if (!response.ok) throw new Error('Failed to fetch decks');
            return await response.json();
        } catch (error) {
            console.error("Error fetching decks:", error);
            // Return null to indicate error
            return null;
        }
    },

    getWordsByLevel: async (level) => {
        try {
            const response = await fetch(`${API_URL}/words/${level}`);
            if (!response.ok) throw new Error('Failed to fetch words');
            return await response.json();
        } catch (error) {
            console.error("Error fetching words:", error);
            return [];
        }
    },

    getFlashcardSession: async (level) => {
        try {
            const response = await fetch(`${API_URL}/flashcards/${level}/session`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch flashcard session');
            return await response.json();
        } catch (error) {
            console.error("Error fetching flashcard session:", error);
            return null;
        }
    },

    updateFlashcardProgress: async (level, currentIndex) => {
        try {
            const response = await fetch(`${API_URL}/flashcards/${level}/progress`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ current_index: currentIndex })
            });
            if (!response.ok) throw new Error('Failed to update progress');
            return await response.json();
        } catch (error) {
            console.error("Error updating progress:", error);
        }
    },

    resetFlashcardSession: async (level) => {
        try {
            const response = await fetch(`${API_URL}/flashcards/${level}/reset`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Failed to reset session');
            return await response.json();
        } catch (error) {
            console.error("Error resetting session:", error);
        }
    }
};
