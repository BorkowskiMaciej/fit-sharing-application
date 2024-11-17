import React, { useState } from 'react';
import { SportCategory } from '../../types';
import axiosInstance from "../../configuration/axiosConfig";
import { encryptData, importPublicKey } from "../../utils/cryptoUtils";
import '../../styles/create-news-styles.css';

interface CreateNewsComponentProps {
    onSubmit: () => void;
}

interface responseData {
    publicKey: string;
    fsUserId: string;
    deviceId: string;
}

const CreateNewsComponent: React.FC<CreateNewsComponentProps> = ({ onSubmit }) => {
    const [newsData, setNewsData] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState(SportCategory.RUNNING);
    const [time, setTime] = useState<string>('');
    const [kcal, setKcal] = useState<number | null>(null);
    const [distance, setDistance] = useState<number | null>(null);

    const convertTimeToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!time || kcal === null) {
            alert('Time and Kcal are required.');
            return;
        }

        const minutes = convertTimeToMinutes(time);

        const data = JSON.stringify({
            category: selectedCategory,
            content: newsData,
            kcal,
            time: minutes,
            distance: distance || 0,
        });

        try {
            const myPublicKey = await importPublicKey((await axiosInstance.get('/keys/my')).data.publicKey);
            const encryptedReferenceNewsData = await encryptData(myPublicKey, data);

            const referenceNewsId = await axiosInstance
                .post('/news/reference', {
                    data: encryptedReferenceNewsData,
                })
                .then((response) => response.data.id);

            const createNewsPromises = (
                await axiosInstance
                    .get(`/relationships/friends`)
                    .then((response) => response.data)
            ).map(async (responseData: responseData) => {
                const publicKey = await importPublicKey(responseData.publicKey);
                const encryptedNewsData = await encryptData(publicKey, data);
                return axiosInstance.post(`/news`, {
                    referenceNewsId: referenceNewsId,
                    receiverFsUserId: responseData.fsUserId,
                    receiverDeviceId: responseData.deviceId,
                    data: encryptedNewsData,
                });
            });
            await Promise.all(createNewsPromises);

            setNewsData('');
            setKcal(null);
            setTime('');
            setDistance(null);
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
                            {Object.values(SportCategory).map((category) => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-wrapper">
                        <label htmlFor="time-input">Time</label>
                        <input
                            type="text"
                            id="time-input"
                            className="create-news-time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            pattern="^\d{2}:\d{2}$"
                            placeholder="HH:MM"
                            required
                        />
                    </div>
                    <div className="input-wrapper">
                        <label htmlFor="kcal-input">Kcal</label>
                        <input
                            type="number"
                            id="kcal-input"
                            className="create-news-kcal"
                            value={kcal ?? ''}
                            onChange={(e) => setKcal(Number(e.target.value))}
                            placeholder="Calories burned (kcal)"
                            min="0"
                            max="9999"
                            required
                        />
                    </div>
                    {['RUNNING', 'WALKING', 'CYCLING'].includes(selectedCategory) && (
                        <div className="input-wrapper">
                            <label htmlFor="distance-input">Distance</label>
                            <input
                                type="number"
                                id="distance-input"
                                className="create-news-distance"
                                value={distance ?? ''}
                                onChange={(e) => setDistance(Number(e.target.value))}
                                placeholder="Distance in kilometers"
                                min="0"
                                max="9999"
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
                />
                <button type="submit" className="submit-news-btn">
                    Post
                </button>
            </form>
        </div>
    );
};

export default CreateNewsComponent;
