import React, {useEffect, useState} from 'react';
import {LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,} from 'recharts';
import axiosInstance from '../../configuration/axiosConfig';
import {useAuth} from '../../provider/authProvider';
import {decryptNews, getPrivateKey} from '../../utils/cryptoUtils';
import {News} from '../../types';
import {eachDayOfInterval, format, parseISO} from 'date-fns';
import _ from 'lodash';

interface UserDashboardProps {
    url: string;
    refreshKey: number;
}

const COLORS = ['#4CAF50', '#FF9800', '#2196F3', '#9C27B0', '#FFC107', '#03A9F4', '#E91E63', '#673AB7'];

const UserDashboard: React.FC<UserDashboardProps> = ({url, refreshKey}) => {

    const generateYearsFromData = (data: News[]): string[] => {
        const years = _.uniq(
            data.map((news) => new Date(news.createdAt).getFullYear().toString())
        ).sort((a, b) => parseInt(b) - parseInt(a));
        return ['All', ...years];
    };

    const {tokenData} = useAuth();
    const [newsData, setNewsData] = useState<News[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [categories, setCategories] = useState<string[]>(['All']);
    const [selectedYear, setSelectedYear] = useState<string>('All');
    const [selectedMonth, setSelectedMonth] = useState<string>('All');
    const [years, setYears] = useState<string[]>(['All']);
    const [viewType, setViewType] = useState<string>('Daily');

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];


    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await axiosInstance.get(url);
                const privateKey = await getPrivateKey(tokenData?.fsUserId);
                const decryptedNews = privateKey
                    ? await decryptNews(response.data, privateKey)
                    : response.data;

                setNewsData(decryptedNews);
                setYears(generateYearsFromData(decryptedNews));

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

    const fillMissingDates = <T extends { date: string }>(
        data: T[],
        key: keyof T,
        selectedYear: string,
        selectedMonth: string
    ): ({ date: string } & Record<string, number>)[] => {
        let startDate: Date;
        let endDate: Date;

        if (selectedYear !== 'All' && selectedMonth !== 'All') {
            const monthIndex = months.indexOf(selectedMonth);
            startDate = new Date(parseInt(selectedYear, 10), monthIndex, 1);
            endDate = new Date(parseInt(selectedYear, 10), monthIndex + 1, 0);
        } else if (selectedYear !== 'All') {
            startDate = new Date(parseInt(selectedYear, 10), 0, 1);
            endDate = new Date(parseInt(selectedYear, 10), 11, 31);
        } else if (data.length > 0) {
            startDate = new Date(data[0].date);
            endDate = new Date(data[data.length - 1].date);
        } else {
            return [];
        }

        const allDates = eachDayOfInterval({ start: startDate, end: endDate }).map((date) => ({
            date: format(date, 'yyyy-MM-dd'),
            [key]: 0,
        }));

        const filledData = _.merge(_.keyBy(allDates, 'date'), _.keyBy(data, 'date'));

        return Object.values(filledData).map((item) => ({
            date: item.date as string,
            [key]: (item[key] as number) || 0,
        })) as ({ date: string } & Record<string, number>)[];
    };

    const parsedNewsData = newsData.map((news) => {
        const data = JSON.parse(news.data);
        return {
            ...data,
            createdAt: format(parseISO(news.createdAt), 'yyyy-MM-dd'),
        };
    });

    const filteredNewsData = parsedNewsData.filter((news) => {
        if (selectedCategory !== 'All' && news.category !== selectedCategory) {
            return false;
        }
        if (selectedYear === 'All') {
            return true;
        }
        const newsDate = new Date(news.createdAt);
        const newsYear = newsDate.getFullYear().toString();
        const newsMonth = newsDate.getMonth();
        if (newsYear !== selectedYear) {
            return false;
        }
        return !(selectedMonth !== 'All' && newsMonth !== months.indexOf(selectedMonth));

    });

    const groupedByDate = _.groupBy(filteredNewsData, 'createdAt');
    const totalKcalByDate = fillMissingDates(
        Object.keys(groupedByDate).map(date => ({
            date,
            kcal: _.sumBy(groupedByDate[date], 'kcal'),
        })),
        'kcal',
        selectedYear,
        selectedMonth
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const totalTimeByDate = fillMissingDates(
        Object.keys(groupedByDate).map(date => ({
            date,
            time: _.sumBy(groupedByDate[date], 'time'),
        })),
        'time',
        selectedYear,
        selectedMonth
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const totalDistanceByDate = fillMissingDates(
        Object.keys(groupedByDate)
            .map(date => ({
                date,
                distance: _.sumBy(groupedByDate[date], 'distance'),
            }))
            .filter(entry => entry.distance > 0),
        'distance',
        selectedYear,
        selectedMonth
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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

    const calculateCumulativeData = <T extends { date: string } & Record<string, number>>(
        data: T[],
        key: keyof T
    ): (T & { cumulative: number })[] => {
        return data.reduce<(T & { cumulative: number })[]>((acc, curr) => {
            const lastCumulative = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
            acc.push({ ...curr, cumulative: lastCumulative + curr[key] });
            return acc;
        }, []);
    };


    const cumulativeKcalByDate = calculateCumulativeData(totalKcalByDate, 'kcal');
    const cumulativeTimeByDate = calculateCumulativeData(totalTimeByDate, 'time');
    const cumulativeDistanceByDate = calculateCumulativeData(totalDistanceByDate, 'distance');

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
                <div className="filter-container">
                    <label htmlFor="category" style={{ fontSize: '14px', marginBottom: '8px', marginRight: '8px' }}>
                        Select activity category:
                    </label>
                    <select
                        id="category"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ padding: '5px', borderRadius: '4px', fontSize: '14px' }}
                    >
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                    <label htmlFor="view-type" style={{ fontSize: '14px', marginLeft: '16px', marginRight: '8px' }}>
                        Select view type:
                    </label>
                    <select
                        id="view-type"
                        value={viewType}
                        onChange={(e) => setViewType(e.target.value)}
                        style={{ padding: '5px', borderRadius: '4px', fontSize: '14px' }}
                    >
                        <option value="Daily">Daily</option>
                        <option value="Cumulative">Cumulative</option>
                    </select>
                    <label htmlFor="year-filter" style={{ fontSize: '14px', marginLeft: '16px', marginRight: '8px' }}>
                        Select year:
                    </label>
                    <select
                        id="year-filter"
                        value={selectedYear}
                        onChange={(e) => {
                            setSelectedYear(e.target.value);
                            setSelectedMonth('All');
                        }}
                        style={{ padding: '5px', borderRadius: '4px', fontSize: '14px' }}
                    >
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                    {selectedYear !== 'All' && (
                        <>
                            <label
                                htmlFor="month-filter"
                                style={{ fontSize: '14px', marginLeft: '16px', marginRight: '8px' }}
                            >
                                Select month:
                            </label>
                            <select
                                id="month-filter"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                style={{ padding: '5px', borderRadius: '4px', fontSize: '14px' }}
                            >
                                <option value="All">All</option>
                                {months.map((month) => (
                                    <option key={month} value={month}>
                                        {month}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}
                </div>
                {totalPosts !== 0 ? (
                    <>
                        <div className="chart-row">
                            <div className="chart-container">
                                <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>
                                    {viewType === 'Daily' ? 'Kcal burned per day' : 'Cumulative Kcal burned'}
                                </h4>
                                <ResponsiveContainer width="95%" height={200}>
                                    <LineChart data={viewType === 'Daily' ? totalKcalByDate : cumulativeKcalByDate}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                                        <YAxis style={{ fontSize: '12px' }} />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey={viewType === 'Daily' ? 'kcal' : 'cumulative'}
                                            stroke="#8884d8"
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="chart-container">
                                <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>
                                    {viewType === 'Daily' ? 'Training time per day' : 'Cumulative training time'}
                                </h4>
                                <ResponsiveContainer width="95%" height={200}>
                                    <LineChart data={viewType === 'Daily' ? totalTimeByDate : cumulativeTimeByDate}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                                        <YAxis style={{ fontSize: '12px' }} />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey={viewType === 'Daily' ? 'time' : 'cumulative'}
                                            stroke="#82ca9d"
                                            activeDot={{ r: 6 }}
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
                                    <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>
                                        {viewType === 'Daily' ? 'Distance covered per day' : 'Cumulative distance covered'}
                                    </h4>
                                    <ResponsiveContainer width="95%" height={200}>
                                        <LineChart data={viewType === 'Daily' ? totalDistanceByDate : cumulativeDistanceByDate}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                                            <YAxis style={{ fontSize: '12px' }} />
                                            <Tooltip />
                                            <Line
                                                type="monotone"
                                                dataKey={viewType === 'Daily' ? 'distance' : 'cumulative'}
                                                stroke="#FF9800"
                                                activeDot={{ r: 6 }}
                                            />
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
                    <p className="stat-title">Total posts</p>
                    <p className="stat-value">{totalPosts}</p>
                </div>
                <div className="stat-box">
                    <p className="stat-title">
                        {viewType === 'Daily' ? 'Average Kcal burned per day' : 'Total Kcal burned'}
                    </p>
                    <p className="stat-value">
                        {viewType === 'Daily' ? `${averageKcalPerDay} kcal` : `${totalKcal} kcal`}
                    </p>
                </div>
                <div className="stat-box">
                    <p className="stat-title">
                        {viewType === 'Daily' ? 'Average time spent per day' : 'Total time spent'}
                    </p>
                    <p className="stat-value">
                        {viewType === 'Daily' ? `${averageTimePerDay} hours` : `${(totalTime / 60).toFixed(1)} hours`}
                    </p>
                </div>
                {['RUNNING', 'WALKING', 'CYCLING'].includes(selectedCategory) && (
                    <div className="stat-box">
                        <p className="stat-title">
                            {viewType === 'Daily' ? 'Average distance per day' : 'Total distance covered'}
                        </p>
                        <p className="stat-value">
                            {viewType === 'Daily' ? `${averageDistancePerDay} km` : `${totalDistanceByDate.reduce((acc, entry) => acc + entry.distance, 0).toFixed(1)} km`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;