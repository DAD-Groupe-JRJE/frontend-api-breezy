// Appelle aux apis Client et tweet
// Peut-être séparé ?

import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:8080",
    timeout: 5000,
});

// Intercepteur pour injecter automatiquement le token JWT s'il existe
apiClient.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("breezy_jwt");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Helper pour récupérer l'idUser depuis le localStorage s'il existe
export const getStoredUserId = () => {
    if (typeof window !== "undefined") {
        try {
            const userStr = localStorage.getItem("breezy_user");
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user && (user.userId || user.id)) {
                    return user.userId || user.id;
                }
            }
        } catch (e) {
            console.error("Error reading breezy_user from localStorage:", e);
        }
    }
    return null; // Plus d'identifiant en dur !
};

export const createNewTweet = async (content, belongTo = null) => {
    try {
        const userId = getStoredUserId();
        const payload = {
            idUser: userId,
            content: content,
        };
        if (belongTo) {
            payload.belongTo = belongTo;
        }
        const response = await apiClient.post("/api/tweet", payload);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la création du tweet :", error);
        throw error;
    }
};

export const getAllTweets = async () => {
    try {
        const response = await apiClient.get("/api/tweet");
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des tweets :", error);
        throw error;
    }
}

export const getOneTweet = async (idTweet) => {
    try {
        const response = await apiClient.get("/api/tweet/" + idTweet);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération du tweet :", error);
        throw error;
    }
}

export const getTweetsResponse = async (idTweet) => {
    try {
        const response = await apiClient.get("/api/tweet/" + idTweet + '/response');
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des réponses :", error);
        throw error;
    }
}

export const getTweetsByUser = async (userId) => {
    try {
        const response = await apiClient.get("/api/tweet/user/" + userId);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des tweets de l'utilisateur :", error);
        return [];
    }
}

export const likeTweet = async (tweetId) => {
    try {
        const userId = getStoredUserId();
        const response = await apiClient.post("/api/tweet/" + tweetId + '/like', {
            idUser: userId,
        });
        return response.data;
    } catch (error) {
        console.error("Erreur lors du like :", error);
        throw error;
    }
}

export const unlikeTweet = async (tweetId) => {
    try {
        const userId = getStoredUserId();
        const response = await apiClient.delete("/api/tweet/" + tweetId + '/like', {
            data: {
                idUser: userId,
            }
        });
        return response.data;
    } catch (error) {
        console.error("Erreur lors du unlike :", error);
        throw error;
    }
}

export const login = async (emailOrUsername, password) => {
    try {
        const payload = {};
        if (emailOrUsername.includes("@")) {
            payload.email = emailOrUsername;
        } else {
            payload.userName = emailOrUsername;
        }
        payload.password = password;

        const response = await apiClient.post("/api/auth/login", payload);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        throw error;
    }
};

export const register = async (email, username, password, displayName) => {
    try {
        const response = await apiClient.post("/api/auth/register", {
            email: email,
            userName: username,
            password: password,
            userDisplayName: displayName
        });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de l'inscription :", error);
        throw error;
    }
};

export const getUserById = async (userId) => {
    try {
        const response = await apiClient.get("/api/users/" + userId);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
        return null;
    }
};

export const getConnectedUserInfo = async () => {
    try {
        const response = await apiClient.get("/api/users/me");
        return response.data.user;
    } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
        return null;
    }
};

export const getAllUsers = async () => {
    try {
        const response = await apiClient.get("/api/users");
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération de tous les utilisateurs :", error);
        throw error;
    }
};

export const suspendUser = async (userId) => {
    try {
        const response = await apiClient.post(`/api/users/${userId}/suspend`);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la suspension de l'utilisateur :", error);
        throw error;
    }
};

export const unsuspendUser = async (userId) => {
    try {
        const response = await apiClient.post(`/api/users/${userId}/unsuspend`);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la réactivation de l'utilisateur :", error);
        throw error;
    }
};

