import React, { useState } from 'react';
import { createNews, getFriends } from '../../services/NewsService';
import { CreateNewsRequest } from '../../types';

const NewsCreateComponent: React.FC = () => {
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
        } catch (error) {
            console.error('Failed to create news:', error);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="newsData">News Data:</label>
                <input
                    type="text"
                    id="newsData"
                    value={newsData}
                    onChange={(e) => setNewsData(e.target.value)}
                    required
                />
                <button type="submit">Upload News</button>
            </form>
        </div>
    );
};

export default NewsCreateComponent;
