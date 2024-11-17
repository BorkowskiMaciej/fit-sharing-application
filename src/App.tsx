import AuthProvider from "./provider/authProvider";
import Routes from "./routes";
import './styles/styles.css';
import GlobalMessages from "./components/GlobalMessage";
import React from "react";

function App() {
    return (
        <AuthProvider>
            <GlobalMessages />
            <Routes />
        </AuthProvider>
    );
}

export default App;