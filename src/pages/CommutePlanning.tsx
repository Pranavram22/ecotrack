import React, { useState, useEffect, useRef } from 'react';
import { Bus, Bike, Car, Train, Clock, Leaf, Map as MapIcon, PlusCircle, Calendar, Save, ChevronDown, X, Navigation, Target, Maximize2, Minimize2 } from 'lucide-react';
import { JSX } from 'react/jsx-runtime';

// Define our transport modes and their carbon footprints
const transportModes = [
  { id: 'walk', name: 'Walking', icon: <Bike size={20} />, carbonPerKm: 0, color: 'text-green-600' },
  { id: 'bike', name: 'Cycling', icon: <Bike size={20} />, carbonPerKm: 0, color: 'text-green-600' },
  { id: 'bus', name: 'Bus', icon: <Bus size={20} />, carbonPerKm: 0.1, color: 'text-blue-500' },
  { id: 'train', name: 'Train', icon: <Train size={20} />, carbonPerKm: 0.05, color: 'text-blue-500' },
  { id: 'carpool', name: 'Carpool', icon: <Car size={20} />, carbonPerKm: 0.07, color: 'text-yellow-500' },
  { id: 'car', name: 'Solo Car', icon: <Car size={20} />, carbonPerKm: 0.2, color: 'text-red-500' }
];

// Define common locations for quick selection with coordinates
const commonLocations = [
  { id: 'home', name: 'Home', lat: 40.7128, lng: -74.006 },
  { id: 'work', name: 'Work', lat: 40.7580, lng: -73.9855 },
  { id: 'gym', name: 'Gym', lat: 40.7350, lng: -73.9910 },
  { id: 'store', name: 'Grocery Store', lat: 40.7210, lng: -74.0018 },
  { id: 'school', name: 'School', lat: 40.7290, lng: -73.9970 }
];

// Route suggestions with estimated details
const routeSuggestions = [
  {
    id: 1,
    mode: 'bus',
    duration: 25,
    distance: 8.2,
    carbonSaved: 1.2,
    route: 'Take Bus 42 from Main St to Downtown',
    path: [
      { lat: 40.7128, lng: -74.006 },
      { lat: 40.722, lng: -73.9985 },
      { lat: 40.7350, lng: -73.9910 },
      { lat: 40.7580, lng: -73.9855 }
    ]
  },
  {
    id: 2,
    mode: 'bike',
    duration: 30,
    distance: 5.5,
    carbonSaved: 1.6,
    route: 'Take Greenway Cycle Path',
    path: [
      { lat: 40.7128, lng: -74.006 },
      { lat: 40.7210, lng: -74.0018 },
      { lat: 40.7350, lng: -73.9910 },
      { lat: 40.7580, lng: -73.9855 }
    ]
  },
  {
    id: 3,
    mode: 'train',
    duration: 20,
    distance: 12,
    carbonSaved: 1.8,
    route: 'Blue Line from Central Station to North End',
    path: [
      { lat: 40.7128, lng: -74.006 },
      { lat: 40.7580, lng: -73.9855 }
    ]
  },
  {
    id: 4,
    mode: 'carpool',
    duration: 18,
    distance: 9.7,
    carbonSaved: 1.0,
    route: 'Highway 101 to Downtown Exit',
    path: [
      { lat: 40.7128, lng: -74.006 },
      { lat: 40.7150, lng: -73.9980 },
      { lat: 40.7290, lng: -73.9970 },
      { lat: 40.7580, lng: -73.9855 }
    ]
  }
];

// Map component for displaying routes
const RouteMap = ({ 
  origin, 
  destination, 
  selectedRoute, 
  expanded, 
  toggleExpand 
}: {
  origin: { lat: number; lng: number; name?: string } | null;
  destination: { lat: number; lng: number; name?: string } | null;
  selectedRoute: any;
  expanded: boolean;
  toggleExpand: () => void;
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  
  
  // Define transportModes since it's used but not defined in the original code
  const transportModes = [
    { id: 'walking', color: 'text-green-500', icon: <Navigation size={16} /> },
    { id: 'bicycling', color: 'text-blue-500', icon: <Navigation size={16} /> },
    { id: 'transit', color: 'text-purple-500', icon: <Navigation size={16} /> },
    { id: 'driving', color: 'text-red-500', icon: <Navigation size={16} /> }
  ];

  useEffect(() => {
    // Initialize map when component mounts
    if (mapRef.current) {
      // Added error handling for map loading
      try {
        const timer = setTimeout(() => {
          setMapLoaded(true);
        }, 500);
        
        return () => clearTimeout(timer);
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    }
  }, []);

  // Get user's current location with improved error handling
  const getUserLocation = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            // Added success message
            console.log("Successfully retrieved user location");
          },
          (error) => {
            console.error("Error getting location:", error);
            // Handle specific error cases
            switch(error.code) {
              case error.PERMISSION_DENIED:
                console.warn("User denied the request for Geolocation.");
                break;
              case error.POSITION_UNAVAILABLE:
                console.warn("Location information is unavailable.");
                break;
              case error.TIMEOUT:
                console.warn("The request to get user location timed out.");
                break;
              default:
                console.warn("An unknown error occurred.");
                break;
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 7000, // Increased timeout from 5000 to 7000
            maximumAge: 0
          }
        );
      } catch (error) {
        console.error("Unexpected error in geolocation:", error);
      }
    } else {
      console.warn("Geolocation is not supported by this browser.");
    }
  };

  // Helper function to safely render route path
  const renderRoutePath = () => {
    if (!selectedRoute || !selectedRoute.path || !Array.isArray(selectedRoute.path)) {
      return null;
    }
    
    try {
      return (
        <svg className="absolute inset-0 w-full h-full">
          <path 
            d={selectedRoute.path.map((point: {lat: number; lng: number}, i: number) =>
              `${i === 0 ? 'M' : 'L'} ${(point.lng + 74.02) * 5000} ${(40.77 - point.lat) * 5000}`
            ).join(' ')}
            stroke={transportModes.find(mode => mode.id === selectedRoute.mode)?.color.replace('text-', 'stroke-') || 'stroke-blue-500'}
            strokeWidth="3"
            fill="none"
            className="animate-pulse"
          />
          
          {selectedRoute.path.map((point: { lng: number; lat: number; }, i: number) => (
            <circle 
              key={i}
              cx={(point.lng + 74.02) * 5000}
              cy={(40.77 - point.lat) * 5000}
              r={i === 0 || i === selectedRoute.path.length - 1 ? "6" : "3"}
              fill={i === 0 ? "#22c55e" : i === selectedRoute.path.length - 1 ? "#ef4444" : "#6366f1"}
            />
          ))}
        </svg>
      );
    } catch (error) {
      console.error("Error rendering route path:", error);
      return null;
    }
  };

  // Improved rendering for origin and destination markers
  const renderLocationMarker = (location: any, isOrigin: boolean) => {
    if (!location || typeof location.lat !== 'number') return null;
    
    const markerPosition = isOrigin ? "absolute left-1/4 top-1/2" : "absolute right-1/4 top-1/2";
    const markerColor = isOrigin ? "bg-green-500" : "bg-red-500";
    const markerIcon = isOrigin ? <Navigation size={16} /> : <Target size={16} />;
    const locationName = typeof location === 'string' ? location : location.name || 'Unknown';
    
    return (
      <div className={`${markerPosition} transform -translate-x-1/2 -translate-y-1/2`}>
        <div className={`${markerColor} text-white p-2 rounded-full`}>
          {markerIcon}
        </div>
        <div className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow mt-1 text-center">
          {locationName}
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={mapRef} 
      className={`relative bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden transition-height duration-300 ease-in-out ${expanded ? 'h-96' : 'h-64'}`}
    >
      {!mapLoaded ? (
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">Loading map...</div>
        </div>
      ) : (
        <>
          {/* Map display */}
          <div className="h-full w-full bg-blue-50 dark:bg-gray-800 relative">
            {/* Map placeholder - in a real implementation, this would be replaced with an actual map library */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img src="/api/placeholder/800/600" alt="Map placeholder" className="w-full h-full object-cover opacity-50 dark:opacity-30" />
            </div>
            
            {/* Route visualization */}
            {renderRoutePath()}
            
            {/* Origin/Destination markers */}
            {renderLocationMarker(origin, true)}
            {renderLocationMarker(destination, false)}
            
            {/* Current location marker */}
            {currentLocation && (
              <div className="absolute left-1/3 bottom-1/3">
                <div className="bg-blue-500 text-white p-1 rounded-full animate-pulse">
                  <div className="h-3 w-3 bg-blue-200 rounded-full"></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Map controls */}
          <div className="absolute top-2 right-2 flex space-x-2">
            <button 
              onClick={toggleExpand}
              className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={expanded ? "Minimize map" : "Maximize map"}
            >
              {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button 
              onClick={getUserLocation}
              className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Get current location"
            >
              <Navigation size={16} />
            </button>
          </div>
          
          {/* Map legend */}
          {selectedRoute && (
            <div className="absolute bottom-2 left-2 bg-white dark:bg-gray-800 p-2 rounded-md shadow-md">
              <div className="flex items-center space-x-2">
                <div className={transportModes.find(mode => mode.id === selectedRoute.mode)?.color || "text-gray-500"}>
                  {transportModes.find(mode => mode.id === selectedRoute.mode)?.icon || <Navigation size={16} />}
                </div>
                <div className="text-sm dark:text-white">
                  <p className="font-medium">{selectedRoute.route || "Unknown route"}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedRoute.distance || "0"} km • {selectedRoute.duration || "0"} min
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Remove default export of RouteMap since CommutePlanning is the default export

export default function CommutePlanning() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [commuteHistory, setCommuteHistory] = useState([]);
  const [showAddCommute, setShowAddCommute] = useState(false);
  const [carbonSaved, setCarbonSaved] = useState(0);
  const [showDropdown, setShowDropdown] = useState(null);
  const [travelDistance, setTravelDistance] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [originCoords, setOriginCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);

  // Initialize with some sample data
  useEffect(() => {
    const mockHistory = [
      { id: 1, date: '2025-04-01', mode: 'bus', origin: 'Home', destination: 'Work', distance: 8.2, carbonSaved: 1.2 },
      { id: 2, date: '2025-04-01', mode: 'bike', origin: 'Work', destination: 'Home', distance: 5.5, carbonSaved: 1.6 },
      { id: 3, date: '2025-03-31', mode: 'train', origin: 'Home', destination: 'Downtown', distance: 12, carbonSaved: 1.8 }
    ];
    
    // Calculate total carbon saved
    const total = mockHistory.reduce((sum, item) => sum + item.carbonSaved, 0);
    setCarbonSaved(total);
    
    // Set initial route for map demonstration
setSelectedRoute(routeSuggestions[0] as unknown as React.SetStateAction<null>);
  }, []);

  // Calculate carbon impact
  const calculateCarbon = (mode: string, distance: number) => {
    const selectedTransport = transportModes.find(m => m.id === mode);
    if (!selectedTransport) return 0;
    
    // Calculate carbon saved compared to driving alone
    const carMode = transportModes.find(m => m.id === 'car');
    const carFootprint = (carMode?.carbonPerKm || 0) * distance;
    const thisFootprint = selectedTransport.carbonPerKm * distance;
    return parseFloat((carFootprint - thisFootprint).toFixed(2));
  };

  // Handle commute submission
  const handleSaveCommute = () => {
    if (!origin || !destination || !selectedMode || !selectedDate) {
      return; // Need all fields
    }
    
    // Calculate distance (in a real app, would use maps API)
    const distance = travelDistance > 0 ? travelDistance : Math.random() * 10 + 2;
    const carbon = calculateCarbon(selectedMode, distance);
    
    const newCommute = {
      id: commuteHistory.length + 1,
      date: selectedDate,
      mode: selectedMode,
      origin: typeof origin === 'object' && origin !== null && 'name' in origin ? (origin as { name: string }).name : origin,
      destination: typeof destination === 'object' && destination !== null && 'name' in destination ? (destination as { name: string }).name : destination,
      distance: parseFloat(distance.toFixed(1)),
      carbonSaved: carbon
    };
    
setCommuteHistory(prevHistory => [newCommute as typeof prevHistory[0], ...prevHistory]);
    setCarbonSaved(prevSaved => parseFloat((prevSaved + carbon).toFixed(2)));
    setShowAddCommute(false);
    
    // Reset form
    setOrigin('');
    setDestination('');
    setSelectedMode('');
    setSelectedDate('');
    setSelectedTime('');
    setTravelDistance(0);
    setOriginCoords(null);
    setDestinationCoords(null);
  };

  // Handle dropdown toggle
// Remove this duplicate declaration since originCoords is already declared at the top level
// Remove duplicate declaration since destinationCoords is already declared above

// Update the selectLocation function
const selectLocation = (location: { lat: number; lng: number; name: string }, field: string) => {
try {
  if (field === 'origin') {
    setOrigin(location.name);
    setOriginCoords({ lat: location.lat, lng: location.lng });
  } else if (field === 'destination') {
    setDestination(location.name);
    setDestinationCoords({ lat: location.lat, lng: location.lng });
  } else {
    throw new Error('Invalid field type');
  }
} catch (error) {
  console.error('Error setting coordinates:', error);
}
  setShowDropdown(null);
    
    // If both origin and destination are set, find a potential route
    if (field === 'origin' && destination) {
      findRoute(location as unknown as string, destination as string);
    } else if (field === 'destination' && origin) {
      findRoute(origin as string, location as unknown as string);
    }
  };

  // Find a matching route between two locations
  const findRoute = (start: string, end: string) => {
    // In a real implementation, this would call a routing API
    // Here we're just selecting a random suggestion
    const randomRoute = routeSuggestions[Math.floor(Math.random() * routeSuggestions.length)];
setSelectedRoute(randomRoute as unknown as React.SetStateAction<null>);
    
    // Set the mode from the selected route
    setSelectedMode(randomRoute.mode);
    
    // Set the distance
    setTravelDistance(randomRoute.distance);
  };

  // Select transport mode
  const selectMode = (mode: { id: any; name?: string; icon?: JSX.Element; carbonPerKm?: number; color?: string; }) => {
    setSelectedMode(mode.id);
    setShowDropdown(null);
    
    // Find routes with the selected mode
    const routesWithMode = routeSuggestions.filter(r => r.mode === mode.id);
    if (routesWithMode.length) {
      setSelectedRoute(routesWithMode[0] as unknown as React.SetStateAction<null>);
    }
  };

  // Select a route suggestion
  const selectRoute = (route: React.SetStateAction<null>) => {
    setSelectedRoute(route);
setSelectedMode((route as any).mode);
setTravelDistance((route as any).distance);
  };

  // Get transport mode details
  const getTransportMode = (modeId: string) => {
    return transportModes.find(mode => mode.id === modeId) || transportModes[0];
  };

  const toggleDropdown = (field: string) => {
    setShowDropdown(prev => prev === field ? null : field);
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center space-x-3">
        <Bus className="text-green-600" size={32} />
        <h2 className="text-2xl font-bold dark:text-white">Green Commute Planning</h2>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center space-x-3">
          <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
            <Leaf className="text-green-600 dark:text-green-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Carbon Saved</p>
            <p className="text-lg font-semibold dark:text-white">{carbonSaved} kg CO₂</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center space-x-3">
          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
            <MapIcon className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Trips</p>
            <p className="text-lg font-semibold dark:text-white">{commuteHistory.length}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center space-x-3">
          <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
            <Bike className="text-purple-600 dark:text-purple-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Green Trips</p>
            <p className="text-lg font-semibold dark:text-white">
              {commuteHistory.filter((c: { mode: string }) => ['bike', 'walk', 'bus', 'train'].includes(c.mode)).length}
            </p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center space-x-3">
          <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-full">
            <Clock className="text-yellow-600 dark:text-yellow-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">This Month</p>
            <p className="text-lg font-semibold dark:text-white">
              {commuteHistory.filter((c: { date: string }) => c.date.startsWith('2025-04')).length} trips
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold dark:text-white">Route Map</h3>
          <button 
            onClick={() => setMapExpanded(!mapExpanded)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {mapExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
        
        <RouteMap 
          origin={originCoords || (origin && typeof origin === 'string' ? commonLocations.find(l => l.name === origin) || null : null)}
          destination={destinationCoords || (destination && commonLocations.find(l => l.name === destination)) || null}
          selectedRoute={selectedRoute}
          expanded={mapExpanded}
          toggleExpand={() => setMapExpanded(!mapExpanded)}
        />
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {!showAddCommute ? (
          /* Regular View */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold dark:text-white">Your Commutes</h3>
              <button 
                onClick={() => setShowAddCommute(true)}
                className="flex items-center space-x-2 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg transition"
              >
                <PlusCircle size={16} />
                <span>Add Commute</span>
              </button>
            </div>

            {/* Route Suggestions */}
            <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Suggested Routes</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {routeSuggestions.map(route => {
                  const mode = getTransportMode(route.mode);
                  const isSelected = selectedRoute && (selectedRoute as {id: number}).id === route.id;
                  
                  return (
                    <div 
                      key={route.id} 
                      className={`border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer ${isSelected ? 'ring-2 ring-green-500 dark:ring-green-400' : ''}`}
                      onClick={() => selectRoute(route as any)}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`${mode.color}`}>
                          {mode.icon}
                        </div>
                        <span className="font-medium dark:text-white">{mode.name}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{route.route}</p>
                      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>{route.duration} min</span>
                        <span>{route.distance} km</span>
                      </div>
                      <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                        Saves {route.carbonSaved} kg CO₂
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Commute History */}
            <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Recent Commutes</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mode</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Route</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Distance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">CO₂ Saved</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {commuteHistory.map(commute => {
                      const mode = getTransportMode((commute as {mode: string}).mode);
                      return (
                        <tr key={(commute as {id: number}).id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{(commute as {date: string}).date}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`${mode.color} mr-2`}>
                                {mode.icon}
                              </div>
                              <span className="text-sm dark:text-white">{mode.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-white">
                            {(commute as {origin: string; destination: string}).origin} → {(commute as {origin: string; destination: string}).destination}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {(commute as {distance: number}).distance} km
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                            {(commute as {carbonSaved: number}).carbonSaved} kg
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Add Commute Form */
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold dark:text-white">Add New Commute</h3>
              <button 
                onClick={() => setShowAddCommute(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Origin */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Origin
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 dark:bg-gray-700 dark:text-white"
                    placeholder="Starting point"
value={typeof origin === 'object' && origin ? (origin as {name: string}).name : origin}
                    onChange={(e) => setOrigin(e.target.value)}
                  />
                  <button 
                    className="absolute right-2 top-2 text-gray-400"
                    onClick={() => toggleDropdown('origin')}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
                {showDropdown === 'origin' && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                    {commonLocations.map(location => (
                      <div 
                        key={location.id}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer dark:text-white"
                        onClick={() => selectLocation(location as any, 'origin')}
                      >
                        {location.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Destination */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Destination
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 dark:bg-gray-700 dark:text-white"
                    placeholder="Destination"
value={typeof destination === 'object' && destination ? (destination as {name: string}).name : destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                  <button 
                    className="absolute right-2 top-2 text-gray-400"
                    onClick={() => toggleDropdown('destination')}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
                {showDropdown === 'destination' && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                    {commonLocations.map(location => (
                      <div 
                        key={location.id}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer dark:text-white"
                        onClick={() => selectLocation(location as any, 'destination')}
                      >
                        {location.name}
                      </div>
                      ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Transport Mode */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Transport Mode
                    </label>
                    <div 
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 flex items-center justify-between cursor-pointer dark:bg-gray-700 dark:text-white"
                      onClick={() => toggleDropdown('mode')}
                    >
                      {selectedMode ? (
                        <div className="flex items-center space-x-2">
                          <div className={getTransportMode(selectedMode).color}>
                            {getTransportMode(selectedMode).icon}
                          </div>
                          <span>{getTransportMode(selectedMode).name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Select transport mode</span>
                      )}
                      <ChevronDown size={16} className="text-gray-400" />
                    </div>
                    {showDropdown === 'mode' && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                        {transportModes.map(mode => (
                          <div 
                            key={mode.id}
                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center space-x-2 dark:text-white"
                            onClick={() => selectMode(mode)}
                          >
                            <div className={mode.color}>{mode.icon}</div>
                            <span>{mode.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Distance */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Distance (km)
                    </label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 dark:bg-gray-700 dark:text-white"
                      placeholder="Distance in km"
                      value={travelDistance || ''}
                      onChange={(e) => setTravelDistance(parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  
                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-2 text-gray-400">
                        <Calendar size={16} />
                      </div>
                      <input
                        type="date"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 pl-10 pr-4 py-2 dark:bg-gray-700 dark:text-white"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Time (optional)
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-2 text-gray-400">
                        <Clock size={16} />
                      </div>
                      <input
                        type="time"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 pl-10 pr-4 py-2 dark:bg-gray-700 dark:text-white"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Map preview for the new route */}
                {(originCoords || destinationCoords) && (
                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Route Preview</h4>
                    <RouteMap 
                      origin={originCoords || (origin && typeof origin === 'string' ? commonLocations.find(l => l.name === origin) || null : null)}
                      destination={destinationCoords || (destination && commonLocations.find(l => l.name === destination)) || null}
                      selectedRoute={selectedRoute}
                      expanded={false}
                      toggleExpand={() => {}}
                    />
                  </div>
                )}
                
                {/* Carbon impact preview */}
                {selectedMode && travelDistance > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mt-4">
                    <p className="text-green-800 dark:text-green-400 flex items-center">
                      <Leaf size={16} className="mr-2" />
                      <span>
                        This trip will save approximately <strong>{calculateCarbon(selectedMode, travelDistance)} kg</strong> of CO₂ compared to driving alone.
                      </span>
                    </p>
                  </div>
                )}
                
                {/* Submit button */}
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleSaveCommute}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                    disabled={!origin || !destination || !selectedMode || !selectedDate}
                  >
                    <Save size={16} />
                    <span>Save Commute</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Realtime Transit Updates */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold dark:text-white mb-4">Live Transit Updates</h3>
            <div className="space-y-3">
              {/* Transit update cards - in a real implementation, these would come from a transit API */}
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <div className="flex items-center space-x-2">
                  <Bus size={18} className="text-green-600" />
                  <span className="font-medium dark:text-white">Bus #42</span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">On Time</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Main St Station - Arriving in 3 minutes</p>
              </div>
              
              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <div className="flex items-center space-x-2">
                  <Train size={18} className="text-yellow-600" />
                  <span className="font-medium dark:text-white">Blue Line</span>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Slight Delay</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Central Station - Arriving in 8 minutes</p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center space-x-2">
                  <Bus size={18} className="text-blue-600" />
                  <span className="font-medium dark:text-white">Express #7</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">On Time</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Downtown Transit Hub - Arriving in 5 minutes</p>
              </div>
              
              <div className="border-l-4 border-red-500 pl-4 py-2">
                <div className="flex items-center space-x-2">
                  <Train size={18} className="text-red-600" />
                  <span className="font-medium dark:text-white">Red Line</span>
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Delayed</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">North Station - Arriving in 15 minutes</p>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-right">
              Last updated: 2 minutes ago
            </div>
          </div>
          
          {/* Weather conditions - important for bike and walk commutes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold dark:text-white mb-4">Weather Conditions</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-3 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-lg">
                <div className="text-4xl text-blue-600 dark:text-blue-400">☀️</div>
                <div>
                  <div className="text-xl font-medium dark:text-white">72°F</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Sunny</div>
                </div>
              </div>
              
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Wind</div>
                  <div className="text-lg font-medium dark:text-white">5 mph</div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Humidity</div>
                  <div className="text-lg font-medium dark:text-white">45%</div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Air Quality</div>
                  <div className="text-lg font-medium text-green-600 dark:text-green-400">Good</div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">UV Index</div>
                  <div className="text-lg font-medium dark:text-white">4</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-green-600 dark:text-green-400">Great day for cycling!</span> Clear skies and moderate temperatures make it perfect for green commuting.
              </p>
            </div>
          </div>
          
          {/* Carbon Savings Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold dark:text-white mb-4">Your Green Impact</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium dark:text-white">Monthly Goal Progress</span>
                  <span className="text-gray-500 dark:text-gray-400">{carbonSaved}/15 kg CO₂ saved</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full" 
                    style={{ width: `${Math.min(100, (carbonSaved / 15) * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Achievements */}
              <div className="pt-4">
                <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Achievements</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                    <div className="text-2xl mb-1">🌱</div>
                    <div className="text-sm font-medium dark:text-white">First Green Trip</div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                    <div className="text-2xl mb-1">🚲</div>
                    <div className="text-sm font-medium dark:text-white">Cycling Enthusiast</div>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center opacity-50">
                    <div className="text-2xl mb-1">🌍</div>
                    <div className="text-sm font-medium dark:text-white">Carbon Saver</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Save 20kg CO₂</div>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center opacity-50">
                    <div className="text-2xl mb-1">📊</div>
                    <div className="text-sm font-medium dark:text-white">Commute Tracker</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Log 10 trips</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Community Impact */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Community Impact</h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">This Month</div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">158 kg</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">CO₂ Saved Together</div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">743</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Green Trips</div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">42</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Members</div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Together, we've saved the equivalent of planting 7 trees this month!
              </p>
            </div>
          </div>
        </div>
      );
    }