// Appelle aux apis Client et tweet
// Peut-être séparé ?

import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:3333",
    timeout: 5000,
});

export const createNewTweet = async (content, belongTo = null) => {
    try {
        let response = null;
        if (belongTo) {
            response = await apiClient.post("/api/tweet",{
                idUser: "1234abc",
                content: content,
                belongTo: belongTo,
            } );
        } else {
            response = await apiClient.post("/api/tweet",{
                idUser: "1234abc",
                content: content,
            } );
        }

        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des produits :", error);
        throw error;
    }
};

export const getAllTweets = async () => {
    try {
        const response = await apiClient.get("/api/tweet");
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des produits :", error);
        throw error;
    }
}

export const getOneTweet = async (idTweet) => {
    try {
        const response = await apiClient.get("/api/tweet/" + idTweet);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des produits :", error);
        throw error;
    }
}

export const getTweetsResponse = async (idTweet) => {
    try {
        const response = await apiClient.get("/api/tweet/" + idTweet + '/response');
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des produits :", error);
        throw error;
    }
}


export const likeTweet = async (tweetId) => {
    try {
        const response = await apiClient.post("/api/tweet/" + tweetId + '/like', {
            idUser: "1234abc",
        });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des produits :", error);
        throw error;
    }
}

export const unlikeTweet = async (tweetId) => {
    try {
        const response = await apiClient.delete("/api/tweet/" + tweetId + '/like', {
            data: {
                idUser: "1234abc",
            }
        });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des produits :", error);
        throw error;
    }
}

