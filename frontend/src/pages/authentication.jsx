import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';
import "../App.css";

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
    },
    background: {
      default: 'transparent',
      paper: 'transparent'
    }
  },
});

export default function Authentication() {

    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [formState, setFormState] = React.useState(0);
    const [open, setOpen] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    let handleAuth = async () => {
        try {
            if (formState === 0) {
                await handleLogin(username, password)
            }
            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                console.log(result);
                setUsername("");
                setMessage(result);
                setOpen(true);
                setError("")
                setFormState(0)
                setPassword("")
            }
        } catch (err) {
            console.log(err);
            let message = (err.response && err.response.data && err.response.data.message) 
                ? err.response.data.message 
                : "Network error or server is unreachable.";
            setError(message);
        }
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <div className="auth-container">
                <div className="auth-card">
                    <h1>Connectify</h1>
                    <p>Sign in to connect with your loved ones</p>

                    <div className="auth-toggle">
                        <button 
                            className={`auth-toggle-btn ${formState === 0 ? 'active' : ''}`}
                            onClick={() => setFormState(0)}
                        >
                            Sign In
                        </button>
                        <button 
                            className={`auth-toggle-btn ${formState === 1 ? 'active' : ''}`}
                            onClick={() => setFormState(1)}
                        >
                            Sign Up
                        </button>
                    </div>

                    <div className="auth-form">
                        {formState === 1 && (
                            <input 
                                className="modern-input"
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        )}
                        <input 
                            className="modern-input"
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input 
                            className="modern-input"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        {error && <p style={{ color: "#ff4d4d", margin: 0, fontSize: "0.9rem" }}>{error}</p>}

                        <button className="btn-primary" style={{ marginTop: '1rem', width: '100%' }} onClick={handleAuth}>
                            {formState === 0 ? "Login" : "Register"}
                        </button>
                    </div>
                </div>
            </div>

            <Snackbar
                open={open}
                autoHideDuration={4000}
                message={message}
            />
        </ThemeProvider>
    );
}