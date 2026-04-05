import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Bell, Calendar, TrendingUp, AlertCircle, PlusCircle, Video, X } from 'lucide-react'; // Added X
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CollaborationRequestCard } from '../../components/collaboration/CollaborationRequestCard';
import { InvestorCard } from '../../components/investor/InvestorCard';
import { useAuth } from '../../context/AuthContext';
import { CollaborationRequest } from '../../types';
import { getRequestsForEntrepreneur } from '../../data/collaborationRequests';
import { investors } from '../../data/users';

export const EntrepreneurDashboard: React.FC = () => {
  const { user } = useAuth();
  const [collaborationRequests, setCollaborationRequests] = useState<CollaborationRequest[]>([]);
  const [recommendedInvestors, setRecommendedInvestors] = useState(investors.slice(0, 3));
  
  // --- ADDED: SAFE WALKTHROUGH STATE ---
  const [showGuide, setShowGuide] = useState(true);
  
  // --- ADDED: INFO POPUP STATE ---
  const [cardInfo, setCardInfo] = useState<string | null>(null);
  // --------------------------------------
  
  useEffect(() => {
    if (user) {
      const requests = getRequestsForEntrepreneur(user.id);
      setCollaborationRequests(requests);
    }
  }, [user]);
  
  const handleRequestStatusUpdate = (requestId: string, status: 'accepted' | 'rejected') => {
    setCollaborationRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === requestId ? { ...req, status } : req
      )
    );
  };
  
  if (!user) return null;
  
  const pendingRequests = collaborationRequests.filter(req => req.status === 'pending');
  
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* --- ADDED: SAFE WALKTHROUGH GUIDE BANNER --- */}
      {showGuide && (
        <div className="bg-indigo-600 text-white p-4 rounded-lg flex justify-between items-center shadow-lg">
          <div>
            <p className="font-bold text-lg">👋 Welcome to your Dashboard!</p>
            <p className="text-indigo-200 text-sm mt-1">Start by checking your <strong>Pending Requests</strong> below, then click <strong>Find Investors</strong> to grow your network.</p>
          </div>
          <button 
            onClick={() => setShowGuide(false)} 
            className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-4 py-2 rounded-md transition"
          >
            Got it!
          </button>
        </div>
      )}
      {/* --------------------------------------------- */}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="text-gray-600">Here's what's happening with your startup today</p>
        </div>
        
        <div className="flex gap-2">
          <Link to="/video">
            <Button leftIcon={<Video size={18} />}>
              Start Meeting
            </Button>
          </Link>

          <Link to="/investors">
            <Button leftIcon={<PlusCircle size={18} />}>Find Investors</Button>
          </Link>
        </div>
      </div>
      
      {/* Summary cards - ENTREPRENEUR WORKSPACE THEME */}
      {/* ADDED: cursor-pointer, hover:scale, and onClick to all 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="bg-blue-50 border border-blue-100 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:shadow-blue-200/50"
          onClick={() => setCardInfo("Investors waiting for your approval to view your pitch deck and business details.")}
        >
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <Bell size={20} className="text-blue-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Pending Requests</p>
                <h3 className="text-xl font-semibold text-blue-900">{pendingRequests.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card 
          className="bg-emerald-50 border border-emerald-100 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:shadow-emerald-200/50"
          onClick={() => setCardInfo("Total number of investors you have successfully connected and collaborated with.")}
        >
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100 rounded-full mr-4">
                <Users size={20} className="text-emerald-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-700">Active Connections</p>
                <h3 className="text-xl font-semibold text-emerald-900">
                  {collaborationRequests.filter(req => req.status === 'accepted').length}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card 
          className="bg-amber-50 border border-amber-100 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:shadow-amber-200/50"
          onClick={() => setCardInfo("Upcoming video calls and pitch sessions you have booked with investors.")}
        >
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-full mr-4">
                <Calendar size={20} className="text-amber-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-700">Meetings Scheduled</p>
                <h3 className="text-xl font-semibold text-amber-900">2</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card 
          className="bg-violet-50 border border-violet-100 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:shadow-violet-200/50"
          onClick={() => setCardInfo("Number of times investors have viewed your startup profile this week.")}
        >
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-violet-100 rounded-full mr-4">
                <TrendingUp size={20} className="text-violet-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-violet-700">Profile Views</p>
                <h3 className="text-xl font-semibold text-violet-900">24</h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* ADDED: Info Popup Box */}
      {cardInfo && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] bg-slate-900 border border-slate-700 text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3 animate-fade-in">
          <div className="mt-0.5 text-blue-400">
            <TrendingUp size={20} />
          </div>
          <p className="text-sm text-slate-200 flex-1">{cardInfo}</p>
          <button onClick={() => setCardInfo(null)} className="text-slate-400 hover:text-white transition">
            <X size={18} />
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collaboration requests */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Collaboration Requests</h2>
              <Badge variant="primary">{pendingRequests.length} pending</Badge>
            </CardHeader>
            
            <CardBody>
              {collaborationRequests.length > 0 ? (
                <div className="space-y-4">
                  {collaborationRequests.map(request => (
                    <CollaborationRequestCard
                      key={request.id}
                      request={request}
                      onStatusUpdate={handleRequestStatusUpdate}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <AlertCircle size={24} className="text-gray-500" />
                  </div>
                  <p className="text-gray-600">No collaboration requests yet</p>
                  <p className="text-sm text-gray-500 mt-1">When investors are interested in your startup, their requests will appear here</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
        
        {/* Right Column: Recommended Investors */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recommended Investors</h2>
              <Link to="/investors" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                View all
              </Link>
            </CardHeader>
            
            <CardBody className="space-y-4">
              {recommendedInvestors.map(investor => (
                <InvestorCard key={investor.id} investor={investor} showActions={false} />
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};