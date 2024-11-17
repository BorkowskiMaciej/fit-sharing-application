import React, { useState } from 'react';
import { News } from '../../types';
import axiosInstance from "../../configuration/axiosConfig";
import { useAuth } from "../../provider/authProvider";
import moment from 'moment';
import { useNavigate } from "react-router-dom";
import '../../styles/news-card-styles.css';
import { DEFAULT_USER_PHOTO } from "../../constants";

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
        return { category: "", content: "", kcal: 0, time: "00:00", distance: 0 };
    }
};

const NewsCard: React.FC<NewsCardProps> = ({ news, onDelete }) => {
    const { tokenData } = useAuth();
    const { category, content, kcal, time, distance } = parseNewsData(news.data);
    const [isLiked, setIsLiked] = useState(news.isLiked);
    const [showActions, setShowActions] = useState(false);
    const navigate = useNavigate();

    const convertMinutesToTime = (totalMinutes: number): string => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const handleDelete = async () => {
        try {
            await axiosInstance
                .delete(`/news/${news.id}`)
                .then(() => {
                    onDelete();
                    window.dispatchEvent(new CustomEvent('showMessage', {
                        detail: { message: 'Deleted successfully.', type: 'green' }
                    }));
                });
        } catch (error) {
            window.dispatchEvent(new CustomEvent('showMessage', {
                detail: { message: 'Failed to delete.', type: 'red' }
            }));
        }
    };

    const toggleLike = async () => {
        try {
            await axiosInstance.patch(`/news/${news.id}/like`);
            setIsLiked(!isLiked);
        } catch (error) {
            window.dispatchEvent(new CustomEvent('showMessage', {
                detail: { message: 'Failed to like the post.', type: 'red' }
            }));
        }
    };

    return (
        <div className="news-card">
            <div className="news-header">
                <div className="news-sender" onClick={() => {
                    if (news.publisherFsUserId === tokenData?.fsUserId) {
                        navigate('/me');
                    } else {
                        navigate(`/user/${news.publisherFsUserId}`);
                    }
                }}>
                    <img src={news.publisherProfilePicture ? news.publisherProfilePicture : DEFAULT_USER_PHOTO} alt="" className="user-mini-mini-photo" />
                    <h4>{news.publisherUsername}</h4>
                </div>
                <p className="news-category">{category}</p>
                <p className="news-date">{moment(news.createdAt).fromNow()}</p>
            </div>
            <p className="news-content">{content}</p>
            <div className="news-details">
                <p><strong>Time:</strong> {convertMinutesToTime(time)}</p>
                <p><strong>Kcal:</strong> {kcal}</p>
                {distance > 0 && <p><strong>Distance:</strong> {distance} km</p>}
            </div>
            <div className="news-actions">
                {news.publisherFsUserId === tokenData?.fsUserId ? (
                        <>
                            <p className="likes-counter">
                                {news.likes} {news.likes === 1 ? 'Like' : 'Likes'}
                            </p>
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
                        </>
                    ) :
                    <button className={`like-button ${isLiked ? 'liked' : ''}`} onClick={toggleLike}>
                        {isLiked ? '❤️ Liked' : '🤍 Like'}
                    </button>}
            </div>
        </div>
    );
};

export default NewsCard;
