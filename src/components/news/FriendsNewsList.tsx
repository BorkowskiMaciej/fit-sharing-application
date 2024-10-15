import React, { useState, useEffect } from 'react';
import { News } from '../../types';
import NewsCard from './NewsCard';
import axiosInstance from "../../axiosConfig";

interface FriendsNewsListProps {
    friendFsUserId: string;
}

const FriendsNewsList: React.FC<FriendsNewsListProps> = ({friendFsUserId}) => {
    const [newsList, setNewsList] = useState<News[]>([]);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await axiosInstance.get(`/news/received/${friendFsUserId}`);
                setNewsList(response.data);
            } catch (error) {
                console.error('Failed to fetch news:', error);
            }
        };

        fetchNews();
    }, [friendFsUserId]);

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
