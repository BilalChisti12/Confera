import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { IconButton } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {


    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");


    const {addToUserHistory} = useContext(AuthContext);
    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`)
    }

    return (
        <div className="dashboard-container">
            <div className="navBar">
                <div style={{ display: "flex", alignItems: "center" }}>
                    <h2>Confera</h2>
                </div>
                <div className="nav-actions">
                    <IconButton onClick={() => navigate("/history")} sx={{ color: 'var(--text-main)' }}>
                        <RestoreIcon />
                    </IconButton>
                    <p onClick={() => navigate("/history")}>History</p>
                    <button 
                        className="btn-primary" 
                        style={{ background: 'rgba(255, 77, 77, 0.2)', color: '#ff4d4d', marginLeft: '1rem' }}
                        onClick={() => {
                            localStorage.removeItem("token")
                            navigate("/auth")
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="meetContainer">
                <div className="leftPanel">
                    <h2>Seamless Video Calling for Everyone</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        Connect instantly with crystal clear audio and video. Start a new meeting or join an existing one below.
                    </p>

                    <div className="join-box" style={{ width: '100%', marginTop: '1rem' }}>
                        <input 
                            className="modern-input" 
                            placeholder="Enter Meeting Code" 
                            value={meetingCode}
                            onChange={e => setMeetingCode(e.target.value)} 
                        />
                        <button className="btn-primary" onClick={handleJoinVideoCall}>Join Room</button>
                    </div>
                </div>
                <div className='rightPanel'>
                    <img src='/logo3.png' alt="Confera Meeting" />
                </div>
            </div>
        </div>
    )
}


export default withAuth(HomeComponent)