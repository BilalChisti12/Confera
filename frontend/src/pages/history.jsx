import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';

import { IconButton } from '@mui/material';
export default function History() {


    const { getHistoryOfUser } = useContext(AuthContext);

    const [meetings, setMeetings] = useState([])


    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch {
                // IMPLEMENT SNACKBAR
            }
        }

        fetchHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    let formatDate = (dateString) => {

        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear();

        return `${day}/${month}/${year}`

    }

    return (
        <div style={{ padding: "2rem 1rem", maxWidth: "800px", margin: "0 auto" }}>

            <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
                <IconButton onClick={() => {
                    routeTo("/home")
                }} sx={{ color: "var(--text-main)" }}>
                    <HomeIcon />
                </IconButton >
                <Typography variant="h5" sx={{ marginLeft: "1rem", color: "var(--text-main)", fontWeight: "bold" }}>
                    Meeting History
                </Typography>
            </div>
            {
                (meetings.length !== 0) ? meetings.map((e, i) => {
                    return (

                        <>


                            <Card key={i} variant="outlined" sx={{ marginBottom: "1rem", background: "var(--glass-bg)", backdropFilter: "blur(12px)", borderColor: "var(--glass-border)" }}>


                                <CardContent>
                                    <Typography sx={{ fontSize: 14 }} color="var(--text-muted)" gutterBottom>
                                        Code: {e.meetingCode}
                                    </Typography>

                                    <Typography sx={{ mb: 1.5 }} color="var(--text-main)">
                                        Date: {formatDate(e.date)}
                                    </Typography>

                                </CardContent>


                            </Card>


                        </>
                    )
                }) : <Typography color="var(--text-muted)">No meeting history found.</Typography>

            }

        </div>
    )
}
