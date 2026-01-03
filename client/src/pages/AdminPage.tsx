import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  MoreVertical,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Car,
  Shield,
  ExternalLink,
  User,
  FileText
} from 'lucide-react';
import axios from 'axios';

// Define the Payment interface matching your schema
interface Payment {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  vin: string;
  reportType: 'basic' | 'silver' | 'gold';
  amount: number;
  currency: string;
  transactionId: string;
  status: 'pending' | 'success' | 'failed' | 'expired' | 'completed';
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  stripeUrl?: string;
  reportUrl?: string;
  reportGeneratedAt?: Date;
  reportAccessExpiresAt?: Date;
  paidAt?: Date;
  merchantTag: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Define API response type
interface ApiResponse {
  payments: Payment[];
  total: number;
  page: number;
  totalPages: number;
}

// Status badge component
const StatusBadge: React.FC<{ status: Payment['status'] }> = ({ status }) => {
  const statusConfig = {
    pending: {
      text: 'Pending',
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-500',
      icon: Clock,
    },
    success: {
      text: 'Success',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-500',
      icon: CheckCircle,
    },
    completed: {
      text: 'Completed',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-500',
      icon: CheckCircle,
    },
    failed: {
      text: 'Failed',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-500',
      icon: XCircle,
    },
    expired: {
      text: 'Expired',
      bgColor: 'bg-gray-500/10',
      textColor: 'text-gray-500',
      icon: AlertCircle,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
      <Icon className="w-3 h-3" />
      {config.text}
    </span>
  );
};

// Report type badge component
const ReportTypeBadge: React.FC<{ type: Payment['reportType'] }> = ({ type }) => {
  const typeConfig = {
    basic: {
      text: 'Basic',
      bgColor: 'bg-gray-500/10',
      textColor: 'text-gray-500',
    },
    silver: {
      text: 'Silver',
      bgColor: 'bg-slate-500/10',
      textColor: 'text-slate-500',
    },
    gold: {
      text: 'Gold',
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-500',
    },
  };

  const config = typeConfig[type];

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${config.bgColor} ${config.textColor}`}>
      {config.text}
    </span>
  );
};

const AdminPage: React.FC = () => {
  // State management
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedReportType, setSelectedReportType] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Payment>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0], // today
  });

  // Fetch payments from API
  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        search: searchTerm,
        status: selectedStatus,
        reportType: selectedReportType,
        sortBy: sortField,
        sortOrder: sortDirection,
        startDate: dateRange.start,
        endDate: dateRange.end,
      });

      const response = await axios.get<ApiResponse>(`/api/admin/payments?${params}`);
      
      if (!response) {
        throw new Error(`Error`);
      }
      
      const data: ApiResponse = response.data;
      setPayments(data.payments);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPayments();
  }, [page, sortField, sortDirection, selectedStatus, selectedReportType, dateRange]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1);
      fetchPayments();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle sort
  const handleSort = (field: keyof Payment) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Format date
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Transaction ID',
      'Customer Name',
      'Customer Email',
      'VIN',
      'Report Type',
      'Amount',
      'Status',
      'Payment Date',
      'Created At',
    ];

    const rows = payments.map(payment => [
      payment.transactionId,
      payment.customerName,
      payment.customerEmail,
      payment.vin,
      payment.reportType,
      payment.amount.toString(),
      payment.status,
      payment.paidAt ? formatDate(payment.paidAt) : 'N/A',
      formatDate(payment.createdAt),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // View payment details
  const viewPaymentDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  // Stats
  const stats = {
    totalRevenue: payments.reduce((sum, p) => p.status === 'completed' || p.status === 'success' ? sum + p.amount : sum, 0),
    totalTransactions: payments.length,
    completedTransactions: payments.filter(p => p.status === 'completed' || p.status === 'success').length,
    pendingTransactions: payments.filter(p => p.status === 'pending').length,
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment Dashboard</h1>
        <p className="text-gray-400">Manage and monitor all payment transactions</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(stats.totalRevenue, 'USD')}
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Transactions</p>
              <p className="text-2xl font-bold mt-1">{stats.totalTransactions}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold mt-1">{stats.completedTransactions}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold mt-1">{stats.pendingTransactions}</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, VIN, or transaction ID"
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="success">Success</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Report Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Report Type
            </label>
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
            >
              <option value="all">All Types</option>
              <option value="basic">Basic</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={fetchPayments}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
          <div className="text-gray-400 text-sm">
            Showing {payments.length} of {total} transactions
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="py-3 px-4 text-left">
                  <button
                    onClick={() => handleSort('transactionId')}
                    className="flex items-center gap-1 font-semibold text-gray-400 hover:text-white"
                  >
                    Transaction ID
                    {sortField === 'transactionId' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4 text-left">
                  <button
                    onClick={() => handleSort('customerName')}
                    className="flex items-center gap-1 font-semibold text-gray-400 hover:text-white"
                  >
                    Customer
                    {sortField === 'customerName' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4 text-left">VIN</th>
                <th className="py-3 px-4 text-left">Report</th>
                <th className="py-3 px-4 text-left">
                  <button
                    onClick={() => handleSort('amount')}
                    className="flex items-center gap-1 font-semibold text-gray-400 hover:text-white"
                  >
                    Amount
                    {sortField === 'amount' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center gap-1 font-semibold text-gray-400 hover:text-white"
                  >
                    Created At
                    {sortField === 'createdAt' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Loading payments...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-red-400">
                    <div className="flex items-center justify-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      <span>{error}</span>
                    </div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-750 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-mono text-sm text-gray-300">
                        {payment.transactionId}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium">{payment.customerName}</div>
                        <div className="text-sm text-gray-400">{payment.customerEmail}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-mono text-sm text-gray-300">{payment.vin}</div>
                    </td>
                    <td className="py-4 px-4">
                      <ReportTypeBadge type={payment.reportType} />
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold">
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-400">
                        {formatDate(payment.createdAt)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewPaymentDetails(payment)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {payment.reportUrl && (
                          <a
                            href={payment.reportUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Report"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {payment.stripeUrl && (
                          <a
                            href={payment.stripeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Stripe Session"
                          >
                            <DollarSign className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
              >
                Previous
              </button>
              <div className="text-sm text-gray-400">
                Page {page} of {totalPages}
              </div>
              <button
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Payment Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Customer Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Name</label>
                    <div className="font-medium">{selectedPayment.customerName}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <div className="font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {selectedPayment.customerEmail}
                    </div>
                  </div>
                  {selectedPayment.customerPhone && (
                    <div>
                      <label className="text-sm text-gray-400">Phone</label>
                      <div className="font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {selectedPayment.customerPhone}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-gray-400">Merchant Tag</label>
                    <div className="font-medium">{selectedPayment.merchantTag}</div>
                  </div>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Vehicle Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">VIN</label>
                    <div className="font-mono font-medium">{selectedPayment.vin}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Report Type</label>
                    <div className="font-medium">
                      <ReportTypeBadge type={selectedPayment.reportType} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Payment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Amount</label>
                    <div className="text-2xl font-bold">
                      {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Status</label>
                    <div>
                      <StatusBadge status={selectedPayment.status} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Transaction ID</label>
                    <div className="font-mono text-sm">{selectedPayment.transactionId}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Stripe Session ID</label>
                    <div className="font-mono text-sm">
                      {selectedPayment.stripeSessionId || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Timestamps</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Created At</label>
                    <div>{formatDate(selectedPayment.createdAt)}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Updated At</label>
                    <div>{formatDate(selectedPayment.updatedAt)}</div>
                  </div>
                  {selectedPayment.paidAt && (
                    <div>
                      <label className="text-sm text-gray-400">Paid At</label>
                      <div>{formatDate(selectedPayment.paidAt)}</div>
                    </div>
                  )}
                  {selectedPayment.reportGeneratedAt && (
                    <div>
                      <label className="text-sm text-gray-400">Report Generated At</label>
                      <div>{formatDate(selectedPayment.reportGeneratedAt)}</div>
                    </div>
                  )}
                  {selectedPayment.reportAccessExpiresAt && (
                    <div>
                      <label className="text-sm text-gray-400">Report Expires At</label>
                      <div>{formatDate(selectedPayment.reportAccessExpiresAt)}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Links */}
              <div className="flex flex-wrap gap-3">
                {selectedPayment.reportUrl && (
                  <a
                    href={selectedPayment.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    View Report
                  </a>
                )}
                {selectedPayment.stripeUrl && (
                  <a
                    href={selectedPayment.stripeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                  >
                    <DollarSign className="w-4 h-4" />
                    View Stripe Session
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;