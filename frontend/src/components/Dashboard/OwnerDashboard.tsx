import InviteButton from '../InviteButton';

const OwnerDashboard: React.FC = () => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/apartments');
      const data = await response.json();
      setApartments(data);
    } catch (error) {
      console.error('Error fetching apartments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (apartment: Apartment) => {
    console.log(`View details for apartment: ${apartment.apartmentNumber}`);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Owner Dashboard</h2>
      <p className="text-gray-600 mb-4">Welcome to your dashboard!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apartments.map((apartment) => (
          <div key={apartment._id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-2">{apartment.apartmentNumber}</h3>
            <p className="text-gray-600 mb-4">Building: {apartment.building?.name}</p>
            
            <div className="flex justify-between items-center">
              <button
                onClick={() => handleViewDetails(apartment)}
                className="text-blue-600 hover:text-blue-800"
              >
                View Details
              </button>
              <InviteButton 
                apartmentId={apartment._id} 
                apartmentName={apartment.apartmentNumber}
              />
            </div>
          </div>
        ))}
      </div>

      {loading && <p>Loading...</p>}
    </div>
  );
};

export default OwnerDashboard;