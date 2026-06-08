// Appelle aux apis Client et tweet
// Peut-être séparé ?

import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:3333",
    timeout: 5000,
});

export const createNewTweet = async (content) => {
    try {
        const response = await apiClient.post("/api/tweet",{
            idUser: "1234abc",
            content: content,
        } );
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des produits :", error);
        throw error;
    }
};