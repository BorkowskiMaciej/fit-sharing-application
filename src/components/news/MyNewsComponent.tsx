import React, { useState, useEffect } from 'react';
import {CreateNewsRequest, News, SportCategory} from '../../types';
import NewsCard from './NewsCard';
import axiosInstance from "../../configuration/axiosConfig";
import {createNews, getFriends} from "../../services/NewsService";
import {decryptNews, encryptData, getPrivateKey, importPublicKey} from "../../utils/cryptoUtils";
import useToken from "../../hooks/useToken";

interface CreateNewsComponentProps {
    onSubmit: () => void;
}

interface responseData {
    publicKey: string;
    fsUserId: string;
}

const CreateNewsComponent: React.FC<CreateNewsComponentProps> = ({ onSubmit }) => {
    const [newsData, setNewsData] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState(SportCategory.RUNNING);
    const [time, setTime] = useState<string>('00:00');
    const [kcal, setKcal] = useState<number>(0);
    const [distance, setDistance] = useState<number>(0);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const data = JSON.stringify({
            category: selectedCategory,
            content: newsData,
            kcal: kcal,
            time: time,
            distance: distance
        });

        try {
            const myPublicKey = await importPublicKey((await axiosInstance.get('/keys')).data.publicKey);
            const encryptedReferenceNewsData = await encryptData(myPublicKey, data);
            const referenceNewsId = await axiosInstance.post('/news/reference', {
                data: encryptedReferenceNewsData
            }).then(response => response.data.id);

            const createNewsPromises = (await getFriends()).map(async (responseData: responseData) => {
                const publicKey = await importPublicKey(responseData.publicKey);
                const encryptedNewsData = await encryptData(publicKey, data);

                const newsRequest: CreateNewsRequest = {
                    referenceNewsId: referenceNewsId,
                    receiverFsUserId: responseData.fsUserId,
                    data: encryptedNewsData
                };
                return createNews(newsRequest);
            });

            await Promise.all(createNewsPromises);
            setNewsData('');
            setKcal(0);
            setTime('00:00');
            setDistance(0);
            onSubmit();
        } catch (error) {
            console.error('Failed to create news:', error);
        }
    };

    return (
        <div className="create-news-container">
            <form onSubmit={handleSubmit} className="create-news-form">
                <div className="input-group">
                    <div className="input-wrapper">
                        <label htmlFor="category-select">Category</label>
                        <select
                            id="category-select"
                            className="create-news-select"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value as SportCategory)}>
                            {Object.values(SportCategory).map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-wrapper">
                        <label htmlFor="time-input">Time (HH:MM)</label>
                        <input
                            type="text"
                            id="time-input"
                            className="create-news-time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            pattern="^\d{2}:\d{2}$"
                            required
                        />
                    </div>
                    <div className="input-wrapper">
                        <label htmlFor="kcal-input">Kcal</label>
                        <input
                            type="number"
                            id="kcal-input"
                            className="create-news-kcal"
                            value={kcal}
                            onChange={(e) => setKcal(Number(e.target.value))}
                            placeholder="Calories burned (kcal)"
                            min="0"
                            required
                        />
                    </div>
                    {['RUNNING', 'WALKING', 'CYCLING'].includes(selectedCategory) && (
                        <div className="input-wrapper">
                            <label htmlFor="distance-input">Distance (km)</label>
                            <input
                                type="number"
                                id="distance-input"
                                className="create-news-distance"
                                value={distance}
                                onChange={(e) => setDistance(Number(e.target.value))}
                                min="0"
                                required
                            />
                        </div>
                    )}
                </div>
                <textarea
                    className="create-news-textarea"
                    value={newsData}
                    onChange={(e) => setNewsData(e.target.value)}
                    placeholder="Add some comment..."
                    required
                />
                <button type="submit" className="submit-news-btn">Post</button>
            </form>
        </div>
    );
};

const MyNewsComponent = () => {
    const [newsList, setNewsList] = useState<News[]>([]);
    const { tokenData } = useToken();

    const fetchNews = async () => {
        try {
            const publishedNews = await axiosInstance.get(`/news/reference`).then(response => response.data);
            const privateKey = await getPrivateKey(tokenData?.fsUserId);
            if (privateKey) {
                const decryptedNews = await decryptNews(publishedNews, privateKey);
                setNewsList(decryptedNews);
            } else {
                setNewsList(publishedNews);
            }
        } catch (error) {
            console.error('Failed to fetch news:', error);
        }
    };

    useEffect(() => {
        if (tokenData) {
            fetchNews();
        }
    }, [tokenData]);

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

export default MyNewsComponent;
