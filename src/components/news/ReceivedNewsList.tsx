import React, {useEffect, useState} from 'react';
import {News} from '../../types';
import NewsCard from './NewsCard';
import axiosInstance from "../../configuration/axiosConfig";
import {decryptNews, getPrivateKey} from '../../utils/cryptoUtils';
import useToken from "../../hooks/useToken";

const ReceivedNewsList: React.FC = () => {
    const [newsList, setNewsList] = useState<News[]>([]);
    const { tokenData } = useToken();

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const receivedNews = await axiosInstance.get<News[]>(`/news/received`).then(response => response.data);
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
        fetchNews();
        // const interval = setInterval(fetchNews, 3000);
        // return () => clearInterval(interval);
    }, [tokenData?.fsUserId]);

    return (
        <div className="user-list-container">
            {newsList.length === 0 ? (
                <p>No news found. Send new invitations!</p>
            ) : (
                newsList.map(news => (
                    <NewsCard key={news.id} news={news} onDelete={() => null}/>
                ))
            )}
        </div>
    );
};

export default ReceivedNewsList;
