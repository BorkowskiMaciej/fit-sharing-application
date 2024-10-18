import React, { useState } from 'react';
import { News } from '../../types';
import axiosInstance from "../../configuration/axiosConfig";
import useToken from "../../hooks/useToken";
import moment from 'moment';

interface NewsCardProps {
    news: News;
    onDelete: () => void;
}

const parseNewsData = (data: string) => {
    const [category, ...contentParts] = data.split('-');
    return { category, content: contentParts.join('-') };
};

const NewsCard: React.FC<NewsCardProps> = ({ news, onDelete }) => {
    const { tokenData } = useToken();
    const { category, content } = parseNewsData(news.data);
    const [showActions, setShowActions] = useState(false);

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

    return (
        <div className="news-card">
            <div className="news-header">
                <h4 className="news-sender">{news.publisherUsername}</h4>
                <p className="news-category">{category}</p>
                <p className="news-date">{moment(news.createdAt).fromNow()}</p>
            </div>
            <p className="news-content">{content}</p>
            {news.publisherFsUserId === tokenData?.fsUserId && (
                <div className="action-container">
                    <div className="action-icon-container" onClick={() => setShowActions(!showActions)}>
                        <svg className="action-icon" viewBox="0 0 24 6" fill="currentColor">
                            <circle cx="3" cy="3" r="2.5" />
                            <circle cx="12" cy="3" r="2.5" />
                            <circle cx="21" cy="3" r="2.5" />
                        </svg>
                    </div>
                    {showActions && (
                        <ul className="actions-list">
                            <li onClick={handleDelete}>Delete</li>
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default NewsCard;
