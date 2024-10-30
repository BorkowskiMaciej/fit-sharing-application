import React, { useState } from 'react';
import { News } from '../../types';
import axiosInstance from "../../configuration/axiosConfig";
import {useAuth} from "../../provider/authProvider";
import moment from 'moment';
import {useNavigate} from "react-router-dom";
import '../../styles/news-card-styles.css';

interface NewsCardProps {
    news: News;
    onDelete: () => void;
}

const parseNewsData = (data: string) => {
    try {
        const parsedData = JSON.parse(data);
        return {
            category: parsedData.category,
            content: parsedData.content,
            kcal: parsedData.kcal,
            time: parsedData.time,
            distance: parsedData.distance
        };
    } catch (error) {
        console.error("Failed to parse news data:", error);
        return { category: "", content: "", kcal: 0, time: "00:00", distance: 0 };
    }
};

const NewsCard: React.FC<NewsCardProps> = ({ news, onDelete }) => {
    const { tokenData } = useAuth();
    const { category, content, kcal, time, distance } = parseNewsData(news.data);
    const [showActions, setShowActions] = useState(false);
    const navigate = useNavigate();

    const handleDelete = async () => {
        try {
            const response = await axiosInstance.delete(`/news/${news.id}`);
            if (response.status === 204) {
                onDelete();
                window.dispatchEvent(new CustomEvent('showMessage', {
                    detail: { message: 'Deleted successfully.', type: 'green' }
                }));
            } else {
                window.dispatchEvent(new CustomEvent('showMessage', {
                    detail: { message: 'Failed to delete.', type: 'red' }
                }));
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const defaultPhoto = '/user-photo.jpg';

    return (
        <div className="news-card">
            <div className="news-header">
                <div className="news-sender" onClick={() => {
                    if (news.publisherFsUserId === tokenData?.fsUserId) {
                        navigate('/me');
                    } else {
                        navigate(`/user/${news.publisherFsUserId}`);
                    }}}>
                    <img src={news.publisherProfilePicture ? news.publisherProfilePicture : defaultPhoto} alt="" className="user-mini-mini-photo" />
                    <h4>{news.publisherUsername}</h4>
                </div>
                <p className="news-category">{category}</p>
                <p className="news-date">{moment(news.createdAt).fromNow()}</p>
            </div>
            <p className="news-content">{content}</p>
            <div className="news-details">
                <p><strong>Time:</strong> {time}</p>
                <p><strong>Kcal:</strong> {kcal}</p>
                {distance > 0 && <p><strong>Distance:</strong> {distance} meters</p>}
            </div>
            {news.publisherFsUserId === tokenData?.fsUserId && (
                <div className="action-container">
                    <div onClick={() => setShowActions(!showActions)}>
                        <svg viewBox="0 0 24 6" fill="currentColor">
                            <circle cx="3" cy="3" r="2.5" />
                            <circle cx="12" cy="3" r="2.5" />
                            <circle cx="21" cy="3" r="2.5" />
                        </svg>
                    </div>
                    {showActions && (
                        <ul className="actions-list">
                            <li onClick={handleDelete}>Delete news</li>
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default NewsCard;
