import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import server from '../environment';

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(3);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])

    // TODO
    // if(isChrome() === false) {


    // }

    useEffect(() => {
        getPermissions();
    }, [])

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    const getPermissions = async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.log("Media devices API not available (requires HTTPS or localhost).");
                setVideoAvailable(false);
                setAudioAvailable(false);
                setScreenAvailable(false);
                return;
            }

            let videoPerm = false;
            try {
                const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoStream) {
                    videoPerm = true;
                    setVideoAvailable(true);
                    videoStream.getTracks().forEach(track => track.stop()); // Stop immediately, request again later
                }
            } catch (err) {
                setVideoAvailable(false);
            }

            let audioPerm = false;
            try {
                const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                if (audioStream) {
                    audioPerm = true;
                    setAudioAvailable(true);
                    audioStream.getTracks().forEach(track => track.stop());
                }
            } catch (err) {
                setAudioAvailable(false);
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoPerm || audioPerm) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoPerm, audio: audioPerm });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    let isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            if (video !== undefined && audio !== undefined) {
                getUserMedia();
                console.log("SET STATE HAS ", video, audio);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [video, audio])
    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();

    }




    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        if (localVideoref.current) {
            localVideoref.current.srcObject = stream
        }

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            if (localVideoref.current) {
                localVideoref.current.srcObject = window.localStream
            }

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                    .then(getUserMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            } else {
                console.log("Media devices API not available.");
            }
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }





    let getDislayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        if (localVideoref.current) {
            localVideoref.current.srcObject = stream
        }

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            if (localVideoref.current) {
                localVideoref.current.srcObject = window.localStream
            }

            getUserMedia()

        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                if (connections[fromId]) {
                    connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                        if (signal.sdp.type === 'offer') {
                            connections[fromId].createAnswer().then((description) => {
                                connections[fromId].setLocalDescription(description).then(() => {
                                    socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                                }).catch(e => console.log(e))
                            }).catch(e => console.log(e))
                        }
                    }).catch(e => console.log(e))
                }
            }

            if (signal.ice) {
                if (connections[fromId]) {
                    connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
                }
            }
        }
    }




    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.pathname)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {
                    if (connections[socketListId] === undefined) {
                        connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                        // Wait for their ice candidate       
                        connections[socketListId].onicecandidate = function (event) {
                            if (event.candidate != null) {
                                socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                            }
                        }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };


                        // Add the local video stream
                        if (window.localStream !== undefined && window.localStream !== null) {
                            connections[socketListId].addStream(window.localStream)
                        } else {
                            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                            window.localStream = blackSilence()
                            connections[socketListId].addStream(window.localStream)
                        }
                    } // end of if connections[socketListId] === undefined
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new (window.AudioContext || window.webkitAudioContext)()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = () => {
        setVideo(!video);
        // getUserMedia();
    }
    let handleAudio = () => {
        setAudio(!audio)
        // getUserMedia();
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [screen])
    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/"
    }




    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };



    let sendMessage = () => {
        console.log(socketRef.current);
        socketRef.current.emit('chat-message', message, username)
        setMessage("");

        // this.setState({ message: "", sender: username })
    }

    
    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }


    return (
        <div>
            {askForUsername === true ?
                <div className="auth-container">
                    <div className="auth-card">
                        <h1>Join Lobby</h1>
                        <p>Enter your name to connect</p>
                        
                        <div className="auth-form" style={{ marginBottom: "2rem" }}>
                            <input 
                                className="modern-input" 
                                placeholder="Username" 
                                value={username} 
                                onChange={e => setUsername(e.target.value)} 
                            />
                            <button className="btn-primary" onClick={connect}>Connect</button>
                        </div>
                        
                        <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "#000" }}>
                            <video ref={localVideoref} autoPlay muted style={{ width: "100%", display: "block" }}></video>
                        </div>
                    </div>
                </div> 
                :
                <div className={styles.meetVideoContainer}>

                    {showModal ? <div className={styles.chatRoom}>
                        <div className={styles.chatContainer}>
                            <div style={{ padding: "15px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                                <h2 style={{ margin: 0, fontSize: "1.2rem", color: "white" }}>Chat Room</h2>
                            </div>

                            <div className={styles.chatMessages}>
                                {messages.length !== 0 ? messages.map((item, index) => {
                                    return (
                                        <div className={styles.chatMessage} key={index}>
                                            <b>{item.sender}</b>
                                            {item.data}
                                        </div>
                                    )
                                }) : <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", marginTop: "20px" }}>No Messages Yet</p>}
                            </div>

                            <div className={styles.chattingArea}>
                                <input 
                                    type="text" 
                                    placeholder="Type a message..." 
                                    value={message} 
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
                                />
                                <button onClick={sendMessage}>
                                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                </button>
                            </div>
                        </div>
                    </div> : <></>}


                    <div className={styles.buttonContainers}>
                        <button onClick={handleVideo} style={{ color: video ? "white" : "#ff4d4d" }}>
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </button>
                        <button onClick={handleAudio} style={{ color: audio ? "white" : "#ff4d4d" }}>
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </button>
                        
                        {screenAvailable === true ?
                            <button onClick={handleScreen} style={{ color: screen ? "#6366f1" : "white" }}>
                                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                            </button> : <></>}

                        <Badge badgeContent={newMessages} max={999} color='error'>
                            <button onClick={() => { setModal(!showModal); setNewMessages(0); }} style={{ color: showModal ? "#6366f1" : "white" }}>
                                <ChatIcon />                        
                            </button>
                        </Badge>
                        
                        <button onClick={handleEndCall} style={{ background: "#ff4d4d", color: "white" }}>
                            <CallEndIcon  />
                        </button>
                    </div>

                    <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>

                    <div className={styles.conferenceView}>
                        {videos.map((video) => (
                            <div key={video.socketId}>
                                <video
                                    data-socket={video.socketId}
                                    ref={ref => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }}
                                    autoPlay
                                >
                                </video>
                            </div>
                        ))}
                    </div>
                </div>
            }
        </div>
    )
}
