let IS_PROD = false;
const server = IS_PROD ?
    "https://apnacollegebackend.onrender.com" :
    `http://${window.location.hostname}:8000`


export default server;