import React, { useState, useEffect } from 'react';
import { News } from '../../types';
import NewsCard from './NewsCard';
import axiosInstance from "../../axiosConfig";
import {decryptNews, getPrivateKey} from "../../utils/cryptoUtils";
import useToken from "../../useToken";

interface FriendsNewsListProps {
    friendFsUserId: string;
}

const FriendsNewsList: React.FC<FriendsNewsListProps> = ({friendFsUserId}) => {
    const [newsList, setNewsList] = useState<News[]>([]);
    const { tokenData } = useToken();

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const receivedNews = await axiosInstance.get<News[]>(`/news/received/${friendFsUserId}`).then(response => response.data);
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
        <div className="news-list">
            {newsList.length === 0 ? (
                <p>To see this user's posts you must be friends!</p>
            ) : (
                newsList.map(news => (
                    <NewsCard key={news.id} news={news} onDelete={() => null}/>
                ))
            )}
        </div>
    );
};

export default FriendsNewsList;
