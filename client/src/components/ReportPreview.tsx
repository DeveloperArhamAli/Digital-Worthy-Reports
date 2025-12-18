import React from 'react';
import { ReportPreview as ReportPreviewType } from '../types/payment';
import { Shield, AlertTriangle, CheckCircle, Car, Lock, Globe, MapPin, Calendar } from 'lucide-react';

interface ReportPreviewProps {
  preview: ReportPreviewType;
  reportType: 'bronze' | 'silver' | 'gold';
  onContinue: () => void;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ preview, reportType, onContinue }) => {
  console.log('ReportPreview render with preview:', preview);
  const getReportFeatures = (type: 'bronze' | 'silver' | 'gold') => {
    const features = {
      bronze: [
        'Basic Vehicle History',
        'Title Information',
        'Odometer Check',
        'Theft Records',
        '30-Day Money Back'
      ],
      silver: [
        'Everything in Bronze',
        '+ Accident History',
        '+ Service Records',
        '+ Recall Information',
        '60-Day Money Back'
      ],
      gold: [
        'Everything in Silver',
        '+ Market Value',
        '+ Ownership Cost',
        '+ Buy or Avoid Verdict',
        '90-Day Money Back'
      ]
    };
    return features[type];
  };

  const getPrice = (type: 'bronze' | 'silver' | 'gold') => {
    const prices = {
      bronze: 50,
      silver: 80,
      gold: 100
    };
    return prices[type];
  };

  // Check if value is premium-only content
  const isPremiumContent = (value: any) => {
    return typeof value === 'string' && value.includes('Only available for premium subscribers');
  };

  // Get vehicle display information
  const getVehicleDisplayInfo = () => {
    const make = preview.make || 'Unknown Make';
    const model = preview.model || 'Unknown Model';
    const year = preview.year || 'Unknown Year';
    
    return {
      make: isPremiumContent(make) ? 'Premium Required' : make,
      model: isPremiumContent(model) ? 'Premium Required' : model,
      year: isPremiumContent(year) ? 'Premium Required' : year
    };
  };

  const vehicleDisplay = getVehicleDisplayInfo();

  return (
    <div className="bg-linear-to-br from-gray-900 to-black rounded-2xl border border-gray-800 p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {vehicleDisplay.year} {vehicleDisplay.make} {vehicleDisplay.model}
          </h3>
          <p className="text-gray-400">VIN: {preview.vin}</p>
        </div>
        <div className="p-3 rounded-xl bg-neon-green/10">
          <Car className="w-8 h-8 text-neon-green" />
        </div>
      </div>

      {/* Vehicle Information Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Make */}
        <div className="bg-gray-800/50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Car className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Make</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {isPremiumContent(preview.make) ? (
              <div className="flex items-center gap-1 text-yellow-500">
                <Lock className="w-4 h-4" />
                <span>Premium</span>
              </div>
            ) : preview.make || 'N/A'}
          </div>
        </div>

        {/* Model */}
        <div className="bg-gray-800/50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Car className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">Model</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {isPremiumContent(preview.model) ? (
              <div className="flex items-center gap-1 text-yellow-500">
                <Lock className="w-4 h-4" />
                <span>Premium</span>
              </div>
            ) : preview.model || 'N/A'}
          </div>
        </div>

        {/* Country */}
        <div className="bg-gray-800/50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Country</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {preview.country || 'N/A'}
          </div>
        </div>

        {/* Region */}
        <div className="bg-gray-800/50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-red-400" />
            <span className="text-sm text-gray-400">Region</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {preview.region || 'N/A'}
          </div>
        </div>

        {/* Year */}
        <div className="bg-gray-800/50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-gray-400">Year</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {isPremiumContent(preview.year) ? (
              <div className="flex items-center gap-1 text-yellow-500">
                <Lock className="w-4 h-4" />
                <span>Premium</span>
              </div>
            ) : preview.year || 'N/A'}
          </div>
        </div>

        {/* Class */}
        <div className="bg-gray-800/50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-teal-400" />
            <span className="text-sm text-gray-400">Class</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {isPremiumContent(preview.class) ? (
              <div className="flex items-center gap-1 text-yellow-500">
                <Lock className="w-4 h-4" />
                <span>Premium</span>
              </div>
            ) : preview.class || 'N/A'}
          </div>
        </div>

        {/* WMI */}
        <div className="bg-gray-800/50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span className="text-sm text-gray-400">WMI</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {preview.wmi || 'N/A'}
          </div>
        </div>

        {/* VDS */}
        <div className="bg-gray-800/50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <span className="text-sm text-gray-400">VDS</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {preview.vds || 'N/A'}
          </div>
        </div>

        {/* VIS */}
        <div className="bg-gray-800/50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <span className="text-sm text-gray-400">VIS</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {preview.vis || 'N/A'}
          </div>
        </div>
      </div>


      {/* Premium Features Section */}
      <div className="border-t border-gray-800 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Lock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-1">
                  Unlock Premium Vehicle Details
                </h4>
                <p className="text-gray-400 text-sm">
                  Make, Model, Year, Class, and more detailed information require premium access
                </p>
              </div>
            </div>
            
            <h4 className="text-xl font-semibold text-white mb-2 mt-6">
              Complete {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
            </h4>
            <p className="text-gray-400 mb-4">
              Unlock full vehicle history including detailed accident reports, service records, market value, and more.
            </p>
            <ul className="space-y-2">
              {getReportFeatures(reportType).map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-neon-green" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="text-center md:text-right">
            <div className="text-4xl font-bold text-neon-green mb-2">
              ${getPrice(reportType)}
            </div>
            <p className="text-gray-400 mb-4">One-time payment</p>
            <button
              onClick={onContinue}
              className="px-8 py-3 bg-neon-green text-black font-semibold rounded-lg hover:bg-neon-green-dark transition-all duration-300 hover:scale-105"
            >
              Unlock Full Report
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Secure payment • 30-day money back • Instant access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPreview;