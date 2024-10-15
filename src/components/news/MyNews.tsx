import React, { useState, useEffect } from 'react';
import {CreateNewsRequest, News} from '../../types';
import NewsCard from './NewsCard';
import axiosInstance from "../../axiosConfig";
import {createNews, getFriends} from "../../services/NewsService";

interface CreateNewsComponentProps {
    onSubmit: () => void;
}

const CreateNewsComponent: React.FC<CreateNewsComponentProps> = ({ onSubmit }) => {
    const [newsData, setNewsData] = useState<string>('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!newsData.trim()) return;

        try {
            const friendIds = await getFriends();
            const createNewsPromises = friendIds.map((friendId) => {
                const newsRequest: CreateNewsRequest = {
                    receiverFsUserId: friendId,
                    data: newsData
                };
                return createNews(newsRequest);
            });
            const createdNewsResponses = await Promise.all(createNewsPromises);
            console.log('News Created for all friends:', createdNewsResponses);
            setNewsData('');
            onSubmit();
        } catch (error) {
            console.error('Failed to create news:', error);
        }
    };

    return (
        <div className="create-news-container">
            <form onSubmit={handleSubmit} className="create-news-form">
                <textarea
                    id="newsData"
                    value={newsData}
                    onChange={(e) => setNewsData(e.target.value)}
                    placeholder="Post some news..."
                    required
                />
                <button type="submit" className="submit-news-btn">Post</button>
            </form>
        </div>
    );
};

const MyNews = () => {
    const [newsList, setNewsList] = useState<News[]>([]);

    const fetchNews = async () => {
        try {
            const response = await axiosInstance.get(`/news/published`);
            setNewsList(response.data);
        } catch (error) {
            console.error('Failed to fetch news:', error);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    return (
        <>
            <CreateNewsComponent onSubmit={fetchNews}/>
            <div className="news-list">
                {newsList.length === 0 ? (
                    <p>No published news. Send your first post!</p>
                ) : (
                    newsList.map(news => (
                        <NewsCard key={news.id} news={news} onDelete={fetchNews}/>
                    ))
                )}
            </div>
        </>

    );
};

export default MyNews;
