import { io } from 'socket.io-client';

const socket = io('http://localhost:5173'); // adjust port to match your backend

export default socket;
