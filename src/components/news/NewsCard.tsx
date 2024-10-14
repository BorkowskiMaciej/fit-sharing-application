import React from 'react';
import { News } from '../../types';

interface NewsCardProps {
    news: News;
}

const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
    return (
        <div className="news-card">
            <div className="news-sender">Sent by: {news.publisherFsUserId}</div>
            <div className="news-content">{news.data}</div>
        </div>
);
};

export default NewsCard;
