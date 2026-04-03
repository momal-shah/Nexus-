import React, { useState } from 'react';
import { 
  Video, VideoOff, Mic, MicOff, PhoneOff, MonitorUp, MonitorDown, 
  Users, MessageSquare, Circle, Phone
} from 'lucide-react';

interface VideoCallProps {
  meetingTitle?: string;
  participantName?: string;
  onEndCall?: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ meetingTitle = '', participantName = '', onEndCall }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);

  const toggleCall = () => {
    setIsCallActive(!isCallActive);
    if (isCallActive) {
      setIsMuted(false);
      setIsVideoOff(false);
      setIsScreenSharing(false);
      onEndCall?.();
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col h-[600px] relative">
      
      {/* Close Button */}
      {onEndCall && (
        <button 
          onClick={onEndCall}
          className="absolute top-3 right-3 z-30 w-8 h-8 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition text-sm"
        >
          ✕
        </button>
      )}

      {/* Main Video Area */}
      <div className="flex-1 relative bg-gradient-to-br from-gray-800 to-gray-900">
        
        {!isCallActive ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center mb-6 shadow-lg">
              <Video size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {meetingTitle || 'Ready to join?'}
            </h2>
            <p className="text-gray-400 mb-6">
              {participantName ? `You'll be connected with ${participantName}` : 'No one else is here. Start the meeting when ready.'}
            </p>
            <button 
              onClick={toggleCall}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold flex items-center gap-2 shadow-lg transition transform hover:scale-105"
            >
              <Phone size={20} /> Start Meeting
            </button>
          </div>
        ) : (
          <>
            {/* Remote Video (Mock) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl border-4 border-white/20">
                {participantName ? participantName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'JD'}
              </div>
              <p className="absolute bottom-4 left-4 text-white bg-black/40 px-3 py-1 rounded-full text-sm backdrop-blur-sm flex items-center gap-2">
                <Circle size={10} className="text-red-500 animate-pulse" /> {participantName || 'John Doe (Investor)'}
              </p>
            </div>

            {/* Self Video (PiP) */}
            <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-xl border-2 border-white shadow-lg overflow-hidden flex items-center justify-center transition-all duration-300">
              {isVideoOff ? (
                <div className="text-white flex flex-col items-center opacity-70">
                  <VideoOff size={32} />
                  <span className="text-xs mt-2">Camera Off</span>
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  Me
                </div>
              )}
            </div>

            {/* Screen Share Overlay */}
            {isScreenSharing && (
              <div className="absolute inset-0 bg-blue-900/90 flex items-center justify-center z-20">
                <div className="text-center text-white">
                  <MonitorUp size={48} className="mx-auto mb-4 animate-pulse" />
                  <p className="text-xl font-bold">You are sharing your screen</p>
                  <p className="text-sm opacity-75 mt-2">Click "Stop Share" to go back to video</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Control Bar */}
      <div className="p-4 bg-gray-800 flex items-center justify-center gap-4 border-t border-gray-700">
        
        <button 
          onClick={() => setIsMuted(!isMuted)}
          disabled={!isCallActive}
          className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} ${!isCallActive && 'opacity-50 cursor-not-allowed'}`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        <button 
          onClick={() => setIsVideoOff(!isVideoOff)}
          disabled={!isCallActive}
          className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} ${!isCallActive && 'opacity-50 cursor-not-allowed'}`}
          title={isVideoOff ? 'Start Video' : 'Stop Video'}
        >
          {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
        </button>

        <button 
          onClick={() => setIsScreenSharing(!isScreenSharing)}
          disabled={!isCallActive}
          className={`p-4 rounded-full transition-all ${isScreenSharing ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} ${!isCallActive && 'opacity-50 cursor-not-allowed'}`}
          title="Share Screen"
        >
          {isScreenSharing ? <MonitorDown size={24} /> : <MonitorUp size={24} />}
        </button>

        <button 
          onClick={toggleCall}
          disabled={!isCallActive && true}
          className={`p-4 rounded-full transition-all ${isCallActive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
          title={isCallActive ? 'End Call' : 'Start Call'}
        >
          {isCallActive ? <PhoneOff size={24} /> : <Phone size={24} />}
        </button>

      </div>
    </div>
  );
};

export default VideoCall;