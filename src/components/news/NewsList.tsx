import React, {useEffect, useState} from 'react';
import NewsCard from './NewsCard';
import {News} from "../../types";
import {useAuth} from "../../provider/authProvider";
import axiosInstance from "../../configuration/axiosConfig";
import {decryptNews, getPrivateKey} from "../../utils/cryptoUtils";

interface NewsListProps {
    url: string;
    refreshKey: number;
    onDelete: () => void;
}

const NewsList: React.FC<NewsListProps> = ({ url, refreshKey, onDelete }) => {
    const [newsList, setNewsList] = useState<News[]>([]);
    const { tokenData } = useAuth();

    const fetchNews = async () => {
        try {
            const receivedNews = await axiosInstance
                .get(url)
                .then(response => response.data);
            const privateKey = await getPrivateKey(tokenData?.fsUserId);
            if (privateKey) {
                const decryptedNews = await decryptNews(receivedNews, privateKey);
                setNewsList(decryptedNews);
            } else {
                setNewsList(receivedNews);
            }
        } catch (error) {
            console.error('Failed to fetch news:', error);
        }
        onDelete();
    };

    useEffect(() => {
        if (tokenData) {
            fetchNews();
        }
    }, [tokenData, url, refreshKey]);

    return (
        <div className="list-container">
            {newsList.length === 0 ? (
                <p>No news found.</p>
            ) : (
                newsList.map(news => (
                    <NewsCard key={news.id} news={news} onDelete={fetchNews} />
                ))
            )}
        </div>
    );
};

export default NewsList;
