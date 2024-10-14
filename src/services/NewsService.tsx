import axiosInstance from "../axiosConfig";
import { News, CreateNewsRequest } from '../types';

export const createNews = async (newsData: CreateNewsRequest): Promise<News> => {
    return axiosInstance.post<News>(`/news`, newsData).then(response => response.data);
};

export const getAllPublishedNews = async (): Promise<News[]> => {
    return axiosInstance.get<News[]>(`/news/published`).then(response => response.data);
};

export const getAllReceivedNews = async (): Promise<News[]> => {
    return axiosInstance.get<News[]>(`/news/received`).then(response => response.data);
};

export const deleteNews = async (id: string): Promise<void> => {
    return axiosInstance.delete(`/news/${id}`);
};

export const getFriends = async (): Promise<string[]> => {
    return axiosInstance.get<string[]>(`/relationships/friends`).then(response => response.data);
};
