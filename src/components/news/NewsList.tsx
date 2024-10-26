import React, {useEffect, useState} from 'react';
import NewsCard from './NewsCard';
import {News} from "../../types";
import useToken from "../../hooks/useToken";
import axiosInstance from "../../configuration/axiosConfig";
import {decryptNews, getPrivateKey} from "../../utils/cryptoUtils";

interface NewsListProps {
    url: string;
    refreshKey: number;
}

const NewsList: React.FC<NewsListProps> = ({ url, refreshKey }) => {
    const [newsList, setNewsList] = useState<News[]>([]);
    const { tokenData } = useToken();

    const fetchNews = async () => {
        try {
            const receivedNews = await axiosInstance.get<News[]>(url).then(response => response.data);
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
    };

    useEffect(() => {
        if (tokenData) {
            fetchNews();
        }
    }, [tokenData, url, refreshKey]);

    return (
        <div className="news-list-container">
            {newsList.length === 0 ? (
                <p>No news found. Send new invitations!</p>
            ) : (
                newsList.map(news => (
                    <NewsCard key={news.id} news={news} onDelete={fetchNews} />
                ))
            )}
        </div>
    );
};

export default NewsList;
