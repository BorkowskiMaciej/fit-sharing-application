import NewsList from "./news/NewsList";

export const MainComponent = () => {
    return (
        <div className='main-component'>
            <NewsList url={`/news/received`} refreshKey={0}/>
        </div>
    );
}