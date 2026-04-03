import React, { useState } from 'react';
import { User, Lock, Bell, Globe, Palette, CreditCard, Shield } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  
  // State to track which tab is active
  const [activeTab, setActiveTab] = useState('security'); // Default to security to match your screenshot

  // State for Password Logic
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Strength Calculation
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.match(/[A-Z]/)) score++;
    if (pass.match(/[0-9]/)) score++;
    if (pass.match(/[^A-Za-z0-9]/)) score++;
    return score;
  };

  const strength = calculateStrength(newPassword);
  
  const getStrengthColor = () => {
    if (strength <= 1) return 'bg-red-500';
    if (strength === 2) return 'bg-yellow-500';
    if (strength === 3) return 'bg-teal-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (newPassword.length === 0) return '';
    if (strength <= 1) return 'Weak';
    if (strength === 2) return 'Fair';
    if (strength === 3) return 'Good';
    return 'Strong';
  };

  // --- ACTION HANDLERS ---
  const handleSaveProfile = () => alert('Profile saved successfully!');
  
  const handleUpdatePassword = () => {
    if (!currentPassword) return alert('Please enter your current password.');
    if (newPassword !== confirmPassword) return alert('New passwords do not match.');
    if (strength < 3) return alert('Please choose a stronger password.');
    alert('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleEnable2FA = () => alert('Two-Factor Authentication setup initiated (Mock).');
  
  if (!user) return null;
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and settings</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings navigation */}
        <Card className="lg:col-span-1">
          <CardBody className="p-2">
            <nav className="space-y-1">
              {/* Modified buttons to handle clicks and dynamic styles */}
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'profile' 
                    ? 'text-primary-700 bg-primary-50' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User size={18} className="mr-3" />
                Profile
              </button>
              
              <button 
                onClick={() => setActiveTab('security')}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'security' 
                    ? 'text-primary-700 bg-primary-50' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Lock size={18} className="mr-3" />
                Security
              </button>
              
              <button 
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'notifications' 
                    ? 'text-primary-700 bg-primary-50' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Bell size={18} className="mr-3" />
                Notifications
              </button>
              
              <button 
                onClick={() => setActiveTab('language')}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'language' 
                    ? 'text-primary-700 bg-primary-50' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Globe size={18} className="mr-3" />
                Language
              </button>
              
              <button 
                onClick={() => setActiveTab('appearance')}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'appearance' 
                    ? 'text-primary-700 bg-primary-50' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Palette size={18} className="mr-3" />
                Appearance
              </button>
              
              <button 
                onClick={() => setActiveTab('billing')}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'billing' 
                    ? 'text-primary-700 bg-primary-50' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <CreditCard size={18} className="mr-3" />
                Billing
              </button>
            </nav>
          </CardBody>
        </Card>
        
        {/* Main settings content - Conditionally rendered based on activeTab */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* PROFILE SECTION */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar src={user.avatarUrl} alt={user.name} size="xl" />
                  <div>
                    <Button variant="outline" size="sm" onClick={() => alert('Upload feature coming soon')}>Change Photo</Button>
                    <p className="mt-2 text-sm text-gray-500">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Full Name" defaultValue={user.name} />
                  <Input label="Email" type="email" defaultValue={user.email} />
                  <Input label="Role" value={user.role} disabled />
                  <Input label="Location" defaultValue="San Francisco, CA" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" rows={4} defaultValue={user.bio}></textarea>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => window.location.reload()}>Cancel</Button>
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                </div>
              </CardBody>
            </Card>
          )}

          {/* SECURITY SECTION */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gray-700" />
                  <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      <Badge variant="error" className="mt-1">Not Enabled</Badge>
                    </div>
                    <Button variant="outline" onClick={handleEnable2FA}>Enable</Button>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                    
                    <div>
                      <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                      {newPassword && (
                        <div className="mt-3 space-y-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((bar) => (
                              <div key={bar} className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength >= bar ? getStrengthColor() : 'bg-gray-200'}`} />
                            ))}
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-500">Use 8+ chars, numbers & symbols.</p>
                            <span className={`text-xs font-bold uppercase tracking-wider ${strength <= 1 ? 'text-red-500' : strength === 2 ? 'text-yellow-600' : strength === 3 ? 'text-teal-600' : 'text-green-600'}`}>
                              {getStrengthLabel()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={confirmPassword && newPassword !== confirmPassword ? "Passwords do not match" : undefined} />
                    
                    <div className="flex justify-end">
                      <Button onClick={handleUpdatePassword}>Update Password</Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* NOTIFICATIONS SECTION */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader><h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2></CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive emails about your meetings.</p>
                  </div>
                  <input type="checkbox" className="h-5 w-5 text-indigo-600 rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Push Notifications</p>
                    <p className="text-sm text-gray-500">Receive push notifications on your device.</p>
                  </div>
                  <input type="checkbox" className="h-5 w-5 text-indigo-600 rounded" />
                </div>
              </CardBody>
            </Card>
          )}

          {/* LANGUAGE SECTION */}
          {activeTab === 'language' && (
            <Card>
              <CardHeader><h2 className="text-lg font-medium text-gray-900">Language Settings</h2></CardHeader>
              <CardBody>
                <div className="max-w-xs">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Language</label>
                  <select className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
              </CardBody>
            </Card>
          )}

          {/* APPEARANCE SECTION */}
          {activeTab === 'appearance' && (
             <Card>
             <CardHeader><h2 className="text-lg font-medium text-gray-900">Appearance</h2></CardHeader>
             <CardBody>
               <p className="text-gray-500 text-sm">Theme customization options will appear here.</p>
               <div className="flex gap-4 mt-4">
                 <button className="px-4 py-2 bg-white border-2 border-indigo-600 rounded-lg text-sm font-medium text-indigo-600">Light</button>
                 <button className="px-4 py-2 bg-gray-800 border-2 border-transparent rounded-lg text-sm font-medium text-white">Dark</button>
               </div>
             </CardBody>
           </Card>
          )}

          {/* BILLING SECTION */}
          {activeTab === 'billing' && (
            <Card>
              <CardHeader><h2 className="text-lg font-medium text-gray-900">Billing & Subscription</h2></CardHeader>
              <CardBody>
                <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                  <h3 className="font-bold text-indigo-900">Pro Plan</h3>
                  <p className="text-sm text-indigo-700">$29/month • Renews on April 30, 2026</p>
                </div>
                <Button variant="outline">Manage Subscription</Button>
              </CardBody>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
};