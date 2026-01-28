// ============================================
// FIXED AllRooms.jsx - Complete File
// ============================================
import React, { useState, useMemo } from 'react' // ✅ FIXED: Added useMemo import
import { assets, facilityIcons } from '../assets/assets'
import { useSearchParams } from 'react-router-dom'
import StarRating from '../components/StarRating';
import { useAppContext } from '../context/AppContext';

// ✅ FIXED: Changed parameter name from 'onchange' to 'onChange'
const CheckBox = ({ label, selected = false, onChange = () => {}}) => {
    return (
        <label className='flex gap-3 items-center cursor-pointer mt-2 text-sm'>
            <input type="checkbox"
            checked={selected}
            onChange={(e) => onChange(e.target.checked, label)}/>
            <span className='font-light select-none'>
                {label}
            </span>
        </label>
    )
}

// ✅ FIXED: Changed parameter name from 'onchange' to 'onChange'
const RadioButton = ({ label, selected = false, onChange = () => {}}) => {
    return (
        <label className='flex gap-3 items-center cursor-pointer mt-2 text-sm'>
            <input type="radio"
            name="sortOption"
            checked={selected}
            onChange={() => onChange(label)}/>
            <span className='font-light select-none'>
                {label}
            </span>
        </label>
    )
}

const AllRooms = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const {rooms, navigate, currency} = useAppContext();
    const [openFilters, setOpenFilters] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState({
        roomType: [],
        priceRange: [],
    });

    const [selectedSort, setSelectedSort] = useState('');

    const roomTypes = [
        "Single Bed",
        "Double Bed",
        "Luxury Room",
        "Family Suite",
    ];
    const priceRanges = [
        '0 to 500',
        '500 to 1000',
        '1000 to 2000',
        '2000 to 3000',
    ];
    const sortOptions = [
        "Price Low to High",
        "Price High to Low",
        "Newest First",
    ];

    //Handle changes for filter and sorting
    const handleFilterChange = (checked, value, type) => {
        setSelectedFilters((prevFilters) => {
            const updatedFilters = {...prevFilters};
            if(checked) {
                updatedFilters[type].push(value);
            }
            else {
                updatedFilters[type] = updatedFilters[type].filter(item => item !== value);
            }
            return updatedFilters;
        })
    }

    const handleSortChanges = (sortOption) => {
        setSelectedSort(sortOption);
    }

    //function to check if a room matches the selected room type
    const matchesRoomType = (room) => {
        return selectedFilters.roomType.length === 0 || selectedFilters.roomType.includes(room?.roomType);
    }

    //function to check if a room matches the selected price ranges
    const matchesPriceRange = (room) => {
        return selectedFilters.priceRange.length === 0 || selectedFilters.priceRange.some(range => {
            const [min, max] = range.split(' to ').map(Number);
            return room?.pricePerNight >= min && room?.pricePerNight <= max;
        })
    }

    //function to sort rooms based on the selected sort option
    const sortRooms = (a, b) => {
        if(selectedSort === 'Price Low to High') {
            return (a?.pricePerNight || 0) - (b?.pricePerNight || 0);
        }
        if(selectedSort === 'Price High to Low') {
            return (b?.pricePerNight || 0) - (a?.pricePerNight || 0);
        }
        if(selectedSort === 'Newest First') {
            return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
        }
        return 0;
    }

    //Filter Destination
    const filterDestination = (room) => {
        const destination = searchParams.get('destination');
        if(!destination) return true;
        // ✅ FIXED: Added null checks
        return room?.hotel?.city?.toLowerCase().includes(destination.toLowerCase());
    }

    //filter and sort rooms based on the selected filters and sort options
    // ✅ FIXED: Corrected the filter logic and added null checks
    const filteredRooms = useMemo(() => {
        if (!rooms || !Array.isArray(rooms)) return [];
        
        return rooms
            .filter(room => room && room._id && room.hotel) // Filter out null/undefined rooms
            .filter(room => matchesRoomType(room))
            .filter(room => matchesPriceRange(room))
            .filter(room => filterDestination(room))
            .sort(sortRooms);
    }, [rooms, selectedFilters, selectedSort, searchParams])

    //Clear all filter
    const clearFilter = () => {
        setSelectedFilters({
            roomType: [],
            priceRange: [],
        });
        setSelectedSort('');
        setSearchParams({});
    }

  return (
    <div className='flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32'>
        <div className='w-full lg:w-auto'>
            <div className='flex flex-col items-start text-left'>
                <h1 className='font-playfair text-4xl md:text-[40px]'>
                    Hotel Rooms
                </h1>
                <p className='text-sm md:text-base text-gray-500/90 mt-2 max-w-174'>
                    Take advantage of our limited-time offers and special packages to enhance your stay and create unforgettable memories.
                </p>
            </div>

            {/* ✅ FIXED: Added conditional rendering and null checks */}
            {filteredRooms.length > 0 ? (
                filteredRooms.map((room)=> (
                    <div key={room._id} className='flex flex-col md:flex-row items-start py-10 gap-6 border-b border-gray-300 last:pb-30 last:border-0'>
                        <img onClick={()=> {navigate(`/rooms/${room._id}`); scrollTo(0,0)}}
                        src={room.images?.[0] || assets.placeholder}
                        alt="hotel-img"
                        title='View Room Details'
                        className='max-h-65 md:w-1/2 rounded-xl shadow-lg object-cover cursor-pointer'/>
                        <div className='md:w-1/2 flex flex-col gap-2'>
                            <p className='text-gray-500'>
                                {room.hotel?.city || 'Unknown City'}
                            </p>
                            <p onClick={()=> {navigate(`/rooms/${room._id}`); scrollTo(0,0)}}
                               className='text-gray-800 text-3xl font-playfair cursor-pointer'>
                                {room.hotel?.name || 'Unknown Hotel'}
                            </p>
                            <div className='flex items-center'>
                                <StarRating />
                                <p className='ml-2'>200+ reviews</p>
                            </div>
                            <div className='flex items-center gap-1 text-gray-500 mt-2 text-sm'>
                                <img src={assets.locationIcon} alt="location-icon" />
                                <span>{room.hotel?.address || 'Address not available'}</span>
                            </div>
                            {/* Room Amenities */}
                            <div className='flex flex-wrap items-center mt-3 mb-6 gap-4'>
                                {(room.amenities || []).map((item, index)=> (
                                    <div key={index} className='flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F5FF]/70'>
                                        <img src={facilityIcons[item]} alt={item} className='w-5 h-5'/>
                                        <p className='text-xs'>{item}</p>
                                    </div>   
                                ))}
                            </div>
                            {/* Room Price per Night */}
                            <p className='text-xl font-medium text-gray-700'>
                                ${room.pricePerNight || 0} /night
                            </p>
                        </div>
                    </div>
                ))
            ) : (
                <div className='py-20 text-center text-gray-500'>
                    <p className='text-xl'>No rooms found matching your criteria</p>
                    <button 
                        onClick={clearFilter}
                        className='mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dull transition-all'>
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
        
        {/* Filters */}
        <div className='bg-white w-80 border border-gray-300 text-gray-600 max-lg:mb-8 lg:ml-8 lg:mt-16 lg:sticky lg:top-28'>
            <div className={`flex items-center justify-between px-5 py-2.5 lg:border-b border-gray-300 ${openFilters && "border-b"}`}>
                <p className='text-base font-medium text-gray-800'>
                    FILTERS
                </p>
                <div className='text-xs cursor-pointer'>
                    <span className='lg:hidden'
                    onClick={()=> setOpenFilters(!openFilters)}>
                        {openFilters ? 'HIDE' : 'SHOW'}
                    </span>
                    {/* ✅ FIXED: Added onClick handler to CLEAR button */}
                    <span onClick={clearFilter} className='hidden lg:block hover:text-primary transition-all'>
                        CLEAR
                    </span>
                </div>
            </div>

            <div className={`${openFilters ? 'h-auto' : "h-0 lg:h-auto"} overflow-hidden transition-all duration-700`}>
                <div className='px-5 pt-5'>
                    <p className='font-medium text-gray-800 pb-2'>
                        Popular filters
                    </p>
                    {/* ✅ FIXED: Changed prop name to 'onChange' */}
                    {roomTypes.map((room, index) => (
                        <CheckBox key={index} label={room} selected={selectedFilters.roomType.includes(room)}
                        onChange={(checked) => handleFilterChange(checked, room, 'roomType')}/>
                    ))}
                </div>
                <div className='px-5 pt-5'>
                    <p className='font-medium text-gray-800 pb-2'>
                        Price Range
                    </p>
                    {/* ✅ FIXED: Changed prop name to 'onChange' */}
                    {priceRanges.map((range, index) => (
                        <CheckBox key={index} label={`${currency} ${range}`} selected={selectedFilters.priceRange.includes(range)}
                        onChange={(checked) => handleFilterChange(checked, range, 'priceRange')}/>
                    ))}
                </div>
                <div className='px-5 pt-5 pb-7'>
                    <p className='font-medium text-gray-800 pb-2'>
                        Sort By
                    </p>
                    {/* ✅ FIXED: Changed prop name to 'onChange' */}
                    {sortOptions.map((option, index) => (
                        <RadioButton key={index} label={option} selected={selectedSort === option}
                        onChange={() => handleSortChanges(option)}/>
                    ))}
                </div>
            </div>
        </div>
    </div>
  )
}

export default AllRooms