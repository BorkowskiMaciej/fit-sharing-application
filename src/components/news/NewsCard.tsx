import React from 'react';
import { News } from '../../types';
import axiosInstance from "../../axiosConfig";
import useToken from "../../useToken";

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
                console.log('Deleted successfully');
            } else {
                console.error('Failed to delete');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="news-card">
            <div className="news-sender">Sent by: {news.publisherFsUserId}</div>
            <div className="news-content">{news.data}</div>
            {news.publisherFsUserId === tokenData?.fsUserId && (
                <div className="icon-container" onClick={handleDelete} style={{ cursor: 'pointer' }}>
                    <svg className="w-6 h-6 text-gray-800 dark:text-white navbar-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
                    </svg>
                    <span>Delete</span>
                </div>
            )}
        </div>
    );
};

export default NewsCard;
