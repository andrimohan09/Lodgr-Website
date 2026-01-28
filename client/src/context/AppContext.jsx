
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {

    const currency = import.meta.env.VITE_CURRENCY || "$";
    const navigate = useNavigate();
    const {user} = useUser();
    const {getToken} = useAuth();

    const [isOwner, setIsOwner] = useState(false);
    const [showHotelReg, setShowHotelReg] = useState(false);
    const [searchedCities, setSearchedCities] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRooms = async() => {
        try {
            setIsLoading(true);
            const {data} = await axios.get('/api/rooms');
            
            // Validate and filter rooms data
            if(data.success && Array.isArray(data.rooms)) {
                // Filter out any null/undefined rooms and validate structure
                const validRooms = data.rooms.filter(room => {
                    if (!room) {
                        console.warn('Skipping null/undefined room');
                        return false;
                    }
                    if (!room._id) {
                        console.warn('Skipping room without _id:', room);
                        return false;
                    }
                    if (!room.hotel) {
                        console.warn('Skipping room without hotel data:', room);
                        return false;
                    }
                    return true;
                });
                
                setRooms(validRooms);
                console.log(`✅ Loaded ${validRooms.length} valid rooms`);
            } 
            else {
                console.error('Invalid rooms data received:', data);
                toast.error(data.message || 'Failed to load rooms');
                setRooms([]);
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
            toast.error(error.message || 'Failed to load rooms');
            setRooms([]);
        } finally {
            setIsLoading(false);
        }
    }

    const fetchUser = async() => {
        try {
            const {data} = await axios.get('/api/user', {
                headers: {Authorization: `Bearer ${await getToken()}`}
            })
            
            if(data.success) {
                setIsOwner(data.role === "hotelOwner");
                setSearchedCities(Array.isArray(data.recentSearchedCities) ? data.recentSearchedCities : []);
            }
            else {
                //Retry fetching user details after 5 seconds
                console.warn('Failed to fetch user, retrying in 5s...');
                setTimeout(() => {
                    fetchUser();
                }, 5000)
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            toast.error(error.message || 'Failed to load user data');
        }
    }

    useEffect(() => {
        if(user) {
            fetchUser();
        }
    }, [user])

    useEffect(() => {
        fetchRooms();
    }, [])

    const value = {
        currency, 
        navigate, 
        user, 
        getToken, 
        isOwner, 
        setIsOwner, 
        axios,
        showHotelReg, 
        setShowHotelReg, 
        searchedCities, 
        setSearchedCities,
        rooms, 
        setRooms,
        isLoading,
        fetchRooms
    }
    
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}