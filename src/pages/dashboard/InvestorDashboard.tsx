import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, PieChart, Filter, Search, PlusCircle, Video } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { EntrepreneurCard } from '../../components/entrepreneur/EntrepreneurCard';
import { useAuth } from '../../context/AuthContext';
import { Entrepreneur } from '../../types';
import { entrepreneurs } from '../../data/users';
import { getRequestsFromInvestor } from '../../data/collaborationRequests';

export const InvestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  
  if (!user) return null;
  
  const sentRequests = getRequestsFromInvestor(user.id);
  
  const filteredEntrepreneurs = entrepreneurs.filter(entrepreneur => {
    const matchesSearch = searchQuery === '' || 
      entrepreneur.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrepreneur.startupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrepreneur.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrepreneur.pitchSummary.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesIndustry = selectedIndustries.length === 0 || 
      selectedIndustries.includes(entrepreneur.industry);
    
    return matchesSearch && matchesIndustry;
  });
  
  const industries = Array.from(new Set(entrepreneurs.map(e => e.industry)));
  
  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prevSelected => 
      prevSelected.includes(industry)
        ? prevSelected.filter(i => i !== industry)
        : [...prevSelected, industry]
    );
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discover Startups</h1>
          <p className="text-gray-600">Find and connect with promising entrepreneurs</p>
        </div>
        
        <div className="flex gap-2">
          <Link to="/video">
            <Button leftIcon={<Video size={18} />}>
              Start Meeting
            </Button>
          </Link>

          <Link to="/entrepreneurs">
            <Button leftIcon={<PlusCircle size={18} />}>View All Startups</Button>
          </Link>
        </div>
      </div>
      
      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <Input
            placeholder="Search startups, industries, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            startAdornment={<Search size={18} />}
          />
        </div>
        
        <div className="w-full md:w-1/3">
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
            
            <div className="flex flex-wrap gap-2">
              {industries.map(industry => (
                <Badge
                  key={industry}
                  variant={selectedIndustries.includes(industry) ? 'primary' : 'gray'}
                  className="cursor-pointer"
                  onClick={() => toggleIndustry(industry)}
                >
                  {industry}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats summary - INVESTOR FINANCIAL THEME */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border border-slate-700">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-slate-700 rounded-full mr-4">
                <PieChart size={20} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Portfolio Value</p>
                <h3 className="text-xl font-semibold text-white">$1.2M</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-slate-800 border border-slate-700">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-slate-700 rounded-full mr-4">
                <Users size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Active Deals</p>
                <h3 className="text-xl font-semibold text-white">
                  {sentRequests.filter(req => req.status === 'accepted').length}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-slate-800 border border-slate-700">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-slate-700 rounded-full mr-4">
                <Users size={20} className="text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Startups Reviewed</p>
                <h3 className="text-xl font-semibold text-white">{entrepreneurs.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* FAKE MINI CHART - Makes it look like a real financial dashboard */}
        <Card className="bg-slate-800 border border-slate-700">
          <CardBody>
            <p className="text-sm font-medium text-slate-400 mb-3">Monthly Activity</p>
            <div className="flex items-end gap-1.5 h-10">
              <div className="w-full bg-cyan-500/80 rounded-sm" style={{ height: '40%' }}></div>
              <div className="w-full bg-cyan-500/80 rounded-sm" style={{ height: '70%' }}></div>
              <div className="w-full bg-cyan-400 rounded-sm" style={{ height: '50%' }}></div>
              <div className="w-full bg-cyan-500/80 rounded-sm" style={{ height: '90%' }}></div>
              <div className="w-full bg-emerald-400 rounded-sm" style={{ height: '100%' }}></div>
              <div className="w-full bg-cyan-500/80 rounded-sm" style={{ height: '60%' }}></div>
              <div className="w-full bg-cyan-500/80 rounded-sm" style={{ height: '80%' }}></div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* Entrepreneurs grid */}
      <div>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Featured Startups</h2>
          </CardHeader>
          
          <CardBody>
            {filteredEntrepreneurs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEntrepreneurs.map(entrepreneur => (
                  <EntrepreneurCard key={entrepreneur.id} entrepreneur={entrepreneur} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No startups match your filters</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedIndustries([]);
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};