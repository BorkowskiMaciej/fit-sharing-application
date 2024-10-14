import React, { useState, useEffect } from 'react';
import { News } from '../../types';
import { getAllReceivedNews } from '../../services/NewsService';
import NewsCard from './NewsCard';

const NewsList: React.FC = () => {
    const [newsList, setNewsList] = useState<News[]>([]);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const receivedNews = await getAllReceivedNews();
                setNewsList(receivedNews);
            } catch (error) {
                console.error('Failed to fetch news:', error);
            }
        };

        fetchNews();
    });

    return (
        <div className="user-list-container">
            {newsList.length === 0 ? (
                <p>No news found. Send new invitations!</p>
            ) : (
                newsList.map(news => (
                    <NewsCard key={news.id} news={news} />
                ))
            )}
        </div>
    );
};

export default NewsList;
