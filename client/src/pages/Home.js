import React, { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { logout, setOnlineUser, setSocketConnection, setUser } from '../redux/userSlice'
import Sidebar from '../components/Sidebar'
import logo from '../assets/logo.png'
import io from 'socket.io-client'

const Home = () => {

  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // console.log('user',user)

  const fetchUserDetails = async () => {
    try {
      const URL = `${process.env.REACT_APP_BACKEND_URL}/api/user-details`
      const response = await axios({
        url: URL,
        withCredentials: true
      })

      dispatch(setUser(response.data.data))

      if (response.data.data.logout) {
        dispatch(logout());
        navigate("/email");
      }

      // console.log("current user details", response)

    } catch (error) {
      console.log("error", error)
    }
  }

  useEffect(() => {
    fetchUserDetails()
  }, [])

  // /***socket connection */
  // useEffect(() => {
  //   const socketConnection = io(process.env.REACT_APP_BACKEND_URL, {
  //     auth: {
  //       token:localStorage.getItem('token')
  //     }
  //   })
  //   //for online user
  //   socketConnection.on('onlineUser',(data)=>{
  //     console.log(data)
  //     dispatch(setOnlineUser(data))
  //   })

  //   //for showing user in message section
  //   dispatch(setSocketConnection(socketConnection))

  //   return() =>{

  //     socketConnection.disconnect()
  //   }

  // }, [])

  //socket connection 
  useEffect(() => {
    const token = localStorage.getItem('token');
  
    if (!token) {
      console.warn("No token found in localStorage!");
      return;
    }
  
    const socketConnection = io(process.env.REACT_APP_BACKEND_URL, {
      auth: {
        token
      }
    });
  
    socketConnection.on('connect_error', (err) => {
      console.error("Socket connection error:", err.message);
    });
  
    socketConnection.on('onlineUser', (data) => {
      console.log("Online users:", data);
      dispatch(setOnlineUser(data));
    });
  
    dispatch(setSocketConnection(socketConnection));
  
    return () => {
      socketConnection.disconnect();
    };
  
  }, []);
  


  const basePath = location.pathname === '/'
  return (
    <div className='grid lg:grid-cols-[300px,1fr] h-screen max-h-screen'>
      <section className={`bg-white ${!basePath && "hidden"} lg:block`}>
        <Sidebar />
      </section >

      {/**message outlet */}
      <section className={`${basePath && "hidden"}`}>
        <Outlet />
      </section>

      <div className={`justify-center items-center flex-col gap-2 hidden ${!basePath ? "hidden" : "lg:flex"}`}>
        <div>
          <img
            src={logo}
            width={250}
            alt='logo'
          />
        </div>
        <p className='text-lg mt-2 text-slate-500'>Select user to send message</p>
      </div>
    </div>
  )
}

export default Home

