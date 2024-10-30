import AuthProvider from "./provider/authProvider";
import Routes from "./routes";
import './styles/styles.css';

function App() {
    return (
        <AuthProvider>
            <Routes />
        </AuthProvider>
    );
}

export default App;