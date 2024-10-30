import React, {useState} from 'react';
import {SportCategory} from '../../types';
import axiosInstance from "../../configuration/axiosConfig";
import {encryptData, importPublicKey} from "../../utils/cryptoUtils";
import '../../styles/create-news-styles.css';

interface CreateNewsComponentProps {
    onSubmit: () => void;
}

interface responseData {
    publicKey: string;
    fsUserId: string;
    deviceId: string;
}

const CreateNewsComponent: React.FC<CreateNewsComponentProps> = ({onSubmit}) => {
    const [newsData, setNewsData] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState(SportCategory.RUNNING);
    const [time, setTime] = useState<string>('00:00');
    const [kcal, setKcal] = useState<number>(0);
    const [distance, setDistance] = useState<number>(0);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const data = JSON.stringify({
            category: selectedCategory,
            content: newsData,
            kcal: kcal,
            time: time,
            distance: distance
        });

        try {
            const myPublicKey = await importPublicKey((await axiosInstance.get('/keys/my')).data.publicKey);
            const encryptedReferenceNewsData = await encryptData(myPublicKey, data);

            const referenceNewsId = await axiosInstance
                .post('/news/reference', {
                    data: encryptedReferenceNewsData
                })
                .then(response => response.data.id);

            const createNewsPromises = (
                await axiosInstance
                    .get(`/relationships/friends`)
                    .then(response => response.data)
                ).map(async (responseData: responseData) => {
                    const publicKey = await importPublicKey(responseData.publicKey);
                    const encryptedNewsData = await encryptData(publicKey, data);
                    return axiosInstance
                        .post(`/news`, {
                            referenceNewsId: referenceNewsId,
                            receiverFsUserId: responseData.fsUserId,
                            receiverDeviceId: responseData.deviceId,
                            data: encryptedNewsData
                        })
                        .then(response => response.data)
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

export default CreateNewsComponent;