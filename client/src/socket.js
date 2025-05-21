import { io } from "socket.io-client";
import { store } from './redux/store';  // Ensure store is properly imported
import { setSocketConnected, setSocketId } from './redux/userSlice';  // Import redux actions

// Create socket instance with authentication token and credentials
const socket = io("http://localhost:8080", {
  auth: {
    token: localStorage.getItem('token'),  // Send token automatically for authentication
  },
  withCredentials: true, // Ensure credentials are sent
});

// Accessing the dispatch method from the Redux store directly
const dispatch = store.dispatch;

// Handling socket connection event
socket.on("connect", () => {
  // Dispatch action to update socket connection status
  dispatch(setSocketConnected(true));
  
  // Dispatch action to store socket id in Redux
  dispatch(setSocketId(socket.id));
});

// Handling socket disconnection event
socket.on("disconnect", () => {
  // Dispatch action to update socket connection status to false
  dispatch(setSocketConnected(false));
  
  // Dispatch action to reset socket id
  dispatch(setSocketId(""));
});

export default socket;
