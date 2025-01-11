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
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
    'October', 'November', 'December'];

const Filter = ({label, value, onChange, options}: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: string[];
}) => (
    <>
        <label style={{ fontSize: '14px', marginLeft: '16px', marginRight: '8px' }}>{label}</label>
        <select value={value} onChange={onChange} style={{ padding: '5px', borderRadius: '4px', fontSize: '14px' }}>
            {options.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    </>
);

const ChartContainer = ({title, data, dataKey, color}: { title: string; data: any[]; dataKey: string; color: string; }) => (
    <div className="chart-container">
        <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>{title}</h4>
        <ResponsiveContainer width="95%" height={200}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                <YAxis style={{ fontSize: '12px' }} />
                <Tooltip />
                <Line type="monotone" dataKey={dataKey} stroke={color} activeDot={{ r: 6 }} />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

const PieChartContainer = ({title, data, dataKey}: { title: string; data: any[]; dataKey: string; }) => (
    <div className="chart-container">
        <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>{title}</h4>
        <ResponsiveContainer width="95%" height={200}>
            <PieChart>
                <Pie data={data} dataKey={dataKey} nameKey="category" cx="50%" cy="50%" outerRadius={70} label>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    </div>
);

const StatBox = ({title, value}: { title: string; value: any; })  => (
    <div className="stat-box">
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
    </div>
);

const UserDashboard: React.FC<UserDashboardProps> = ({url, refreshKey}) => {
    const { tokenData } = useAuth();
    const [newsData, setNewsData] = useState<News[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [categories, setCategories] = useState<string[]>(['All']);
    const [selectedYear, setSelectedYear] = useState<string>('All');
    const [selectedMonth, setSelectedMonth] = useState<string>('All');
    const [years, setYears] = useState<string[]>(['All']);
    const [viewType, setViewType] = useState<string>('Daily');

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

    const generateYearsFromData = (data: News[]): string[] => {
        const years = _.uniq(
            data.map((news) => new Date(news.createdAt).getFullYear().toString())
        ).sort((a, b) => parseInt(b) - parseInt(a));
        return ['All', ...years];
    };

    const fillMissingDates = <T extends { date: string }>(
        data: T[],
        key: keyof T,
        selectedYear: string,
        selectedMonth: string
    ): ({ date: string } & Record<string, number>)[] => {
        let startDate: Date;
        let endDate: Date;

        if (selectedYear !== 'All' && selectedMonth !== 'All') {
            const monthIndex = MONTHS.indexOf(selectedMonth);
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
        return !(selectedMonth !== 'All' && newsMonth !== MONTHS.indexOf(selectedMonth));

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

    const activityTypeData = Object.entries(_.countBy(parsedNewsData, 'category')).map(([name, value]) => ({
        name,
        value,
    }));

    const cumulativeKcalByDate = calculateCumulativeData(totalKcalByDate, 'kcal');
    const cumulativeTimeByDate = calculateCumulativeData(totalTimeByDate, 'time');
    const cumulativeDistanceByDate = calculateCumulativeData(totalDistanceByDate, 'distance');

    const totalKcal = _.sumBy(filteredNewsData, 'kcal');
    const totalTime = _.sumBy(filteredNewsData, 'time');
    const totalPosts = filteredNewsData.length;

    const averageKcalPerDay = filteredNewsData.length ? (totalKcal / Object.keys(groupedByDate).length).toFixed(0) : '0';
    const averageTimePerDay = filteredNewsData.length ? ((totalTime / Object.keys(groupedByDate).length) / 60).toFixed(1) : '0.0';
    const averageDistancePerDay = filteredNewsData.length ? ((_.sumBy(filteredNewsData, 'distance') / Object.keys(groupedByDate).length) || 0).toFixed(1) : '0.0';

    return (
        <div className="dashboard-wrapper" style={{ display: 'flex', gap: '20px' }}>
            <div className="dashboard-container" style={{ flex: 3 }}>
                <div className="filter-container">
                    <Filter
                        label="Select view type:"
                        value={viewType}
                        options={['Daily', 'Cumulative']}
                        onChange={(e) => setViewType(e.target.value)}
                    />
                    <Filter
                        label="Select activity category:"
                        value={selectedCategory}
                        options={categories}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    />
                    <Filter
                        label="Select year:"
                        value={selectedYear}
                        options={years}
                        onChange={(e) => {
                            setSelectedYear(e.target.value);
                            setSelectedMonth('All');
                        }}
                    />
                    {selectedYear !== 'All' && (
                        <Filter
                            label="Select month:"
                            value={selectedMonth}
                            options={['All', ...MONTHS]}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        />
                    )}
                </div>

                {totalPosts !== 0 ? (
                    <>
                        <div className="chart-row">
                            <ChartContainer
                                title={viewType === 'Daily' ? 'Kcal burned per day' : 'Cumulative Kcal burned'}
                                data={viewType === 'Daily' ? totalKcalByDate : cumulativeKcalByDate}
                                dataKey={viewType === 'Daily' ? 'kcal' : 'cumulative'}
                                color="#8884d8"
                            />
                            <ChartContainer
                                title={viewType === 'Daily' ? 'Training time per day' : 'Cumulative training time'}
                                data={viewType === 'Daily' ? totalTimeByDate : cumulativeTimeByDate}
                                dataKey={viewType === 'Daily' ? 'time' : 'cumulative'}
                                color="#82ca9d"
                            />
                        </div>

                        {selectedCategory === 'All' && (
                            <div className="chart-row">
                                <PieChartContainer
                                    title="Time spent on activities"
                                    data={totalTimeByCategory}
                                    dataKey="time"
                                />
                                <PieChartContainer
                                    title="Activity types distribution"
                                    data={activityTypeData}
                                    dataKey="value"
                                />
                            </div>
                        )}

                        {['RUNNING', 'WALKING', 'CYCLING'].includes(selectedCategory) && (
                            <div className="chart-row">
                                <ChartContainer
                                    title={
                                        viewType === 'Daily'
                                            ? 'Distance covered per day'
                                            : 'Cumulative distance covered'
                                    }
                                    data={viewType === 'Daily' ? totalDistanceByDate : cumulativeDistanceByDate}
                                    dataKey={viewType === 'Daily' ? 'distance' : 'cumulative'}
                                    color="#FF9800"
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <p>No activity found to show.</p>
                )}
            </div>

            <div className="statistics-container">
                <StatBox title="Total posts" value={totalPosts} />
                <StatBox title={viewType === 'Daily' ? 'Average Kcal burned per day' : 'Total Kcal burned'}
                    value={viewType === 'Daily' ? `${averageKcalPerDay} kcal` : `${totalKcal} kcal`}/>
                <StatBox title={viewType === 'Daily' ? 'Average time spent per day' : 'Total time spent'}
                    value={viewType === 'Daily' ? `${averageTimePerDay} hours` : `${(totalTime / 60).toFixed(1)} hours`}/>
                {['RUNNING', 'WALKING', 'CYCLING'].includes(selectedCategory) && (
                    <StatBox title={viewType === 'Daily' ? 'Average distance per day' : 'Total distance covered'}
                        value={viewType === 'Daily' ? `${averageDistancePerDay} km` : `${totalDistanceByDate.reduce((acc, entry) => acc + entry.distance, 0).toFixed(1)} km`}/>
                )}
            </div>
        </div>
    );

};

export default UserDashboard;