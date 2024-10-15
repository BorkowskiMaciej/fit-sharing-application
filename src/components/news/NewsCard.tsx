import React from 'react';
import { News } from '../../types';
import axiosInstance from "../../axiosConfig";
import useToken from "../../useToken";
import moment from 'moment';

interface NewsCardProps {
    news: News;
    onDelete: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, onDelete }) => {
    const { tokenData } = useToken();

    const handleDelete = async () => {
        try {
            const response = await axiosInstance.delete(`/news/${news.id}`);
            if (response.status === 204) {
                onDelete();
                window.dispatchEvent(new CustomEvent('showMessage',
                    { detail: { message: 'Deleted successfully.', type: 'green' } }));
            } else {
                window.dispatchEvent(new CustomEvent('showMessage',
                    { detail: { message: 'Failed to delete.', type: 'red' } }));
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="news-card">
            <div className="news-header">
                <h4 className="news-sender">{news.publisherUsername}</h4>
                <p className="news-date">{moment(news.createdAt).fromNow()}</p>
            </div>
            <p className="news-content">{news.data}</p>
            {news.publisherFsUserId === tokenData?.fsUserId && (
                <div className="icon-container" onClick={handleDelete} style={{ cursor: 'pointer' }}>
                    <svg className="w-6 h-6 text-gray-800 dark:text-white navbar-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
                    </svg>
                    <span>Delete</span>
                </div>
            )}
        </div>
    );
};

export default NewsCard;
