import { useState, useEffect } from 'react';
import { useLocation, Link, useSearchParams } from 'react-router-dom';
import { 
  AlertTriangle, 
  ChevronRight, 
  TrendingUp
} from 'lucide-react';
import axios from 'axios';

const VinPreviewPage = () => {
  const location = useLocation();
  const [vin, setVin] = useState('');
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(
    {
        vin: '',
        year: '',
        make: '',
        model: '',
        manufacturer: '',
        bodyStyle: '',
        plantCountry: ''
    }
  );
  const [error, setError] = useState('');

  useEffect(() => {
    const vinParam = searchParams.get('vin');
    
    if (!vinParam) {
      setError('No VIN provided');
      setLoading(false);
      return;
    }

    setVin(vinParam);
    fetchReportData(vinParam);
  }, [location]);

  const fetchReportData = async (vin: any) => {
    try {
        setLoading(true);
        const response = await axios.get(`/api/get-preview/${vin}`);
        setReportData(response.data.preview);
    } catch (err) {
        setError('Failed to fetch report data');
    } finally {
        setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="bg-black text-white min-h-screen">
        <section className="relative bg-linear-to-b from-primary-dark to-black py-32">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-pulse">
              <div className="h-8 w-48 bg-neon-green/20 rounded-full mx-auto mb-6"></div>
              <div className="h-12 w-96 bg-gray-800 rounded-lg mx-auto mb-4"></div>
              <div className="h-4 w-64 bg-gray-800 rounded mx-auto"></div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (error || !reportData) {
    return (
      <main className="bg-black text-white min-h-screen">
        <section className="relative bg-linear-to-b from-primary-dark to-black py-32">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 mb-6">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-500">
                {error || 'Report not found'}
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-6">Unable to Generate Report</h1>
            <Link to="/">
              <button className="inline-flex items-center gap-2 px-6 py-3 text-neon-green border border-neon-green rounded-full hover:bg-neon-green/10 transition-colors duration-200">
                Return to Home
              </button>
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-black text-white">

      {/* Report Preview Sections */}
      <section className="pt-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Report Preview
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A glimpse of what's included in your complete vehicle report
            </p>
          </div>

          {/* Report Source Info */}
          <div className="rounded-2xl bg-gray-900/50 border border-gray-800 p-8">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-neon-green" />
              <h3 className="text-xl font-bold text-white">Report Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">VIN</p>
                <p className="text-white">{reportData.vin}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Vehicle</p>
                <p className="text-white">{reportData.year} {reportData.make} {reportData.model}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Manufacturer</p>
                <p className="text-white">{reportData.manufacturer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Plant Country</p>
                <p className="text-white">{reportData.plantCountry}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Body Style</p>
                <p className="text-white">{reportData.bodyStyle}</p>
              </div>
            </div>
            
          </div>
        </div>

        <div className="container mx-auto px-4 py-10 text-center">
            <Link to="/pricing">
              <button 
                className="group inline-flex items-center justify-center px-8 py-3 text-sm font-semibold text-black bg-neon-green rounded-full hover:bg-neon-green/75 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-neon-green/25"
              >
                Get Complete Report
                <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
        </div>
      </section>
        
    </main>
  );
};

export default VinPreviewPage;