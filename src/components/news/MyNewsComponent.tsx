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

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!newsData.trim()) return;
        const data = `${selectedCategory}-${newsData}`;

        try {
            const myPublicKey = await importPublicKey((await axiosInstance.get('/keys')).data.publicKey);
            const encryptedReferenceNewsData = await encryptData(myPublicKey, data);
            const referenceNewsId = await axiosInstance.post('/news/reference', {
                data: encryptedReferenceNewsData
            }).then(response => response.data.referenceNewsId);

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
                    className="create-news-textarea"
                    value={newsData}
                    onChange={(e) => setNewsData(e.target.value)}
                    placeholder="Post some news..."
                    required
                />
                <div>
                    <select
                        className="create-news-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as SportCategory)}>
                        {Object.values(SportCategory).map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                    <button type="submit" className="submit-news-btn">Post</button>
                </div>
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
        fetchNews();
    }, [tokenData?.fsUserId]);

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
