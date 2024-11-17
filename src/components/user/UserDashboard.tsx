import React, {useEffect, useState} from 'react';
import {LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,} from 'recharts';
import axiosInstance from '../../configuration/axiosConfig';
import {useAuth} from '../../provider/authProvider';
import {decryptNews, getPrivateKey} from '../../utils/cryptoUtils';
import {News} from '../../types';
import {format, parseISO} from 'date-fns';
import _ from 'lodash';

interface UserDashboardProps {
    url: string;
    refreshKey: number;
}

const COLORS = ['#4CAF50', '#FF9800', '#2196F3', '#9C27B0', '#FFC107', '#03A9F4', '#E91E63', '#673AB7'];

const UserDashboard: React.FC<UserDashboardProps> = ({url, refreshKey}) => {
    const {tokenData} = useAuth();
    const [newsData, setNewsData] = useState<News[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [categories, setCategories] = useState<string[]>(['All']);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await axiosInstance.get(url);
                const privateKey = await getPrivateKey(tokenData?.fsUserId);
                const decryptedNews = privateKey
                    ? await decryptNews(response.data, privateKey)
                    : response.data;

                setNewsData(decryptedNews);

                const uniqueCategories = _.uniq(
                    decryptedNews.map((news: News) => JSON.parse(news.data).category)
                ) as string[];
                setCategories(['All', ...uniqueCategories]);
            } catch (error) {
                console.error('Error fetching news:', error);
            }
        };
        fetchNews();
    }, [tokenData, refreshKey]);

    const parsedNewsData = newsData.map((news) => {
        const data = JSON.parse(news.data);
        return {
            ...data,
            createdAt: format(parseISO(news.createdAt), 'yyyy-MM-dd'),
        };
    });

    const filteredNewsData =
        selectedCategory === 'All'
            ? parsedNewsData
            : parsedNewsData.filter((news) => news.category === selectedCategory);

    const groupedByDate = _.groupBy(filteredNewsData, 'createdAt');
    const totalDistanceByDate = Object.keys(groupedByDate)
        .map((date) => ({
            date,
            distance: _.sumBy(groupedByDate[date], 'distance'),
        }))
        .filter((entry) => entry.distance > 0)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


    const totalKcalByDate = Object.keys(groupedByDate)
        .map((date) => ({
            date,
            kcal: _.sumBy(groupedByDate[date], 'kcal'),
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const totalTimeByDate = Object.keys(groupedByDate)
        .map((date) => ({
            date,
            time: _.sumBy(groupedByDate[date], 'time'),
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const activityTypeData = Object.entries(_.countBy(parsedNewsData, 'category')).map(([name, value]) => ({
        name,
        value,
    }));

    const totalTimeByCategory = _.map(
        _.groupBy(filteredNewsData, 'category'),
        (activities, category) => ({
            category,
            time: _.sumBy(activities, 'time'),
        })
    );

    const totalKcal = _.sumBy(filteredNewsData, 'kcal');
    const totalTime = _.sumBy(filteredNewsData, 'time');
    const totalPosts = filteredNewsData.length;
    const averageKcalPerDay = filteredNewsData.length
        ? (totalKcal / Object.keys(groupedByDate).length).toFixed(0)
        : '0';
    const averageTimePerDay = filteredNewsData.length
        ? ((totalTime / Object.keys(groupedByDate).length) / 60).toFixed(1)
        : '0.0';
    const averageDistancePerDay = filteredNewsData.length
        ? ((_.sumBy(filteredNewsData, 'distance') / Object.keys(groupedByDate).length) || 0).toFixed(1)
        : '0.0';

    return (
        <div className="dashboard-wrapper" style={{display: 'flex', gap: '20px'}}>
            <div className="dashboard-container" style={{flex: 3}}>
                {totalPosts !== 0 ? (
                    <>
                        <div className="filter-container">
                            <label htmlFor="category"
                                   style={{fontSize: '14px', marginBottom: '8px', marginRight: '8px'}}>
                                Select activity category:
                            </label>
                            <select
                                id="category"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                style={{padding: '5px', borderRadius: '4px', fontSize: '14px'}}
                            >
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="chart-row">
                            <div className="chart-container">
                                <h4 style={{fontSize: '16px', marginBottom: '10px'}}>Kcal burned per day</h4>
                                <ResponsiveContainer width="95%" height={200}>
                                    <LineChart data={totalKcalByDate}>
                                        <CartesianGrid strokeDasharray="3 3"/>
                                        <XAxis dataKey="date" style={{fontSize: '12px'}}/>
                                        <YAxis style={{fontSize: '12px'}}/>
                                        <Tooltip/>
                                        <Line
                                            type="monotone"
                                            dataKey="kcal"
                                            stroke="#8884d8"
                                            activeDot={{r: 6}}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="chart-container">
                                <h4 style={{fontSize: '16px', marginBottom: '10px'}}>Training time per day</h4>
                                <ResponsiveContainer width="95%" height={200}>
                                    <LineChart data={totalTimeByDate}>
                                        <CartesianGrid strokeDasharray="3 3"/>
                                        <XAxis dataKey="date" style={{fontSize: '12px'}}/>
                                        <YAxis style={{fontSize: '12px'}}/>
                                        <Tooltip/>
                                        <Line
                                            type="monotone"
                                            dataKey="time"
                                            stroke="#82ca9d"
                                            activeDot={{r: 6}}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="chart-row">
                            {selectedCategory === 'All' ? (
                                <>
                                    <div className="chart-container">
                                        <h4 style={{fontSize: '16px', marginBottom: '10px'}}>Time spent on
                                            activities</h4>
                                        <ResponsiveContainer width="95%" height={200}>
                                            <PieChart>
                                                <Pie
                                                    data={totalTimeByCategory}
                                                    dataKey="time"
                                                    nameKey="category"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={70}
                                                    label
                                                >
                                                    {totalTimeByCategory.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={COLORS[index % COLORS.length]}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip/>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="chart-container">
                                        <h4 style={{fontSize: '16px', marginBottom: '10px'}}>Activity types
                                            distribution</h4>
                                        <ResponsiveContainer width="95%" height={200}>
                                            <PieChart>
                                                <Pie
                                                    data={activityTypeData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={70}
                                                    label
                                                >
                                                    {activityTypeData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={COLORS[index % COLORS.length]}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip/>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </>
                            ) : null}
                        </div>

                        {['RUNNING', 'WALKING', 'CYCLING'].includes(selectedCategory) && (
                            <div className="chart-row">
                                <div className="chart-container">
                                    <h4 style={{fontSize: '16px', marginBottom: '10px'}}>Distance covered per day</h4>
                                    <ResponsiveContainer width="95%" height={200}>
                                        <LineChart data={totalDistanceByDate}>
                                            <CartesianGrid strokeDasharray="3 3"/>
                                            <XAxis dataKey="date" style={{fontSize: '12px'}}/>
                                            <YAxis style={{fontSize: '12px'}}/>
                                            <Tooltip/>
                                            <Line type="monotone" dataKey="distance" stroke="#FF9800"
                                                  activeDot={{r: 6}}/>
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </>
                ) : <p>No activity found to show.</p>}
            </div>


            <div className="statistics-container">
                <div className="stat-box">
                    <p className="stat-title">
                        Total posts
                    </p>
                    <p className="stat-value">
                        {totalPosts}
                    </p>
                </div>
                <div className="stat-box">
                    <p className="stat-title">
                        Average Kcal burned per day
                    </p>
                    <p className="stat-value">
                        {averageKcalPerDay} kcal
                    </p>
                </div>
                <div className="stat-box">
                    <p className="stat-title">
                        Average time spent per day
                    </p>
                    <p className="stat-value">
                        {averageTimePerDay} hours
                    </p>
                </div>
                {['RUNNING', 'WALKING', 'CYCLING'].includes(selectedCategory) && (
                    <div className="stat-box">
                        <p className="stat-title">Average distance per day</p>
                        <p className="stat-value">{averageDistancePerDay} km</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;