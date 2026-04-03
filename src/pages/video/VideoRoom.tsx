import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Video, VideoOff, Mic, MicOff, MonitorUp, PhoneOff,
  Phone, Users, Clock, Maximize2, Minimize2,
  MessageCircle
} from 'lucide-react';

interface VideoRoomProps {
  meetingTitle?: string;
  participantName?: string;
  onEndCall?: () => void;
}

const VideoRoom: React.FC<VideoRoomProps> = ({ meetingTitle, participantName, onEndCall }) => {
  const location = useLocation();
  const routeState = location.state as { meetingTitle?: string; participantName?: string } | null;

  // Call State
  const [callState, setCallState] = useState<'idle' | 'connecting' | 'active' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Media State
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Media Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  // Use route state first, then props, then defaults
  const demoTitle = routeState?.meetingTitle || meetingTitle || 'Investor Pitch Meeting';
  const demoParticipant = routeState?.participantName || participantName || 'Sarah Johnson';
  const demoMeetingId = 'NX-' + Math.random().toString(36).substr(2, 6).toUpperCase();

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // ===== START CALL =====
  const startCall = useCallback(async () => {
    setCallState('connecting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: true
      });
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setTimeout(() => {
        setCallState('active');
        timerRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
      }, 1500);
    } catch (err) {
      console.log('Camera not available, using mock:', err);
      setIsVideoOn(false);
      setTimeout(() => {
        setCallState('active');
        timerRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
      }, 1500);
    }
  }, []);

  // ===== END CALL =====
  const endCall = useCallback(() => {
    setCallState('ended');

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsScreenSharing(false);

    if (onEndCall) {
      setTimeout(() => onEndCall(), 2000);
    }
  }, [onEndCall]);

  // ===== TOGGLE VIDEO =====
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOn(prev => !prev);
    } else {
      setIsVideoOn(prev => !prev);
    }
  }, []);

  // ===== TOGGLE AUDIO =====
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioOn(prev => !prev);
    } else {
      setIsAudioOn(prev => !prev);
    }
  }, []);

  // ===== TOGGLE SCREEN SHARE =====
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = null;
      }
      setIsScreenSharing(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { width: 1920, height: 1080 } as MediaTrackConstraints
        });
        screenStreamRef.current = stream;
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
        }
        setIsScreenSharing(true);

        stream.getVideoTracks()[0].onended = () => {
          if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = null;
          }
          screenStreamRef.current = null;
          setIsScreenSharing(false);
        };
      } catch (err) {
        console.log('Screen share cancelled:', err);
      }
    }
  }, [isScreenSharing]);

  // ===== TOGGLE FULL SCREEN =====
  const toggleFullScreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullScreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullScreen(false)).catch(() => {});
    }
  }, []);

  // ===== SEND CHAT MESSAGE =====
  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, {
      sender: 'You',
      text: chatInput.trim(),
      time: getCurrentTime()
    }]);
    setChatInput('');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // ==============================
  // IDLE STATE
  // ==============================
  if (callState === 'idle') {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden w-full max-w-md">
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 px-8 py-10 text-center">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Video size={36} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{demoTitle}</h2>
            <p className="text-violet-200 text-sm">Meeting ID: {demoMeetingId}</p>
          </div>

          <div className="px-8 py-8">
            <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {demoParticipant.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{demoParticipant}</p>
                <p className="text-xs text-gray-400">Waiting to connect</p>
              </div>
              <div className="ml-auto">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Online
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-8 flex items-start gap-3">
              <Video size={18} className="text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-blue-700">Camera & Microphone</p>
                <p className="text-[11px] text-blue-500 mt-0.5">Your camera and mic will activate when the call starts</p>
              </div>
            </div>

            <button
              onClick={startCall}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-green-200/60 transition-all active:scale-[0.98]"
            >
              <Phone size={18} />
              Start Call
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // CONNECTING STATE
  // ==============================
  if (callState === 'connecting') {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-gray-900 rounded-3xl overflow-hidden">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-violet-500/30 animate-ping" />
            <div className="absolute inset-0 rounded-full border-4 border-violet-500/20 animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Phone size={32} className="text-white animate-pulse" />
            </div>
          </div>
          <h3 className="text-white font-bold text-lg mb-1">Connecting...</h3>
          <p className="text-gray-400 text-sm">Calling {demoParticipant}</p>
        </div>
      </div>
    );
  }

  // ==============================
  // ENDED STATE
  // ==============================
  if (callState === 'ended') {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden w-full max-w-md text-center">
          <div className="px-8 py-12">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <PhoneOff size={32} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Call Ended</h3>
            <p className="text-gray-400 text-sm mb-2">with {demoParticipant}</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl mb-8">
              <Clock size={14} className="text-gray-400" />
              <span className="text-sm font-semibold text-gray-600">Duration: {formatTime(callDuration)}</span>
            </div>
            <div>
              <button
                onClick={() => {
                  setCallDuration(0);
                  setChatMessages([]);
                  setCallState('idle');
                }}
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-violet-200/60 transition-all"
              >
                Call Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // ACTIVE CALL STATE
  // ==============================
  return (
    <div
      ref={containerRef}
      className="relative bg-gray-900 rounded-3xl overflow-hidden"
      style={{ height: '600px' }}
    >
      {/* Screen Share Overlay */}
      {isScreenSharing && (
        <div className="absolute inset-0 z-30 bg-black">
          <video ref={screenVideoRef} autoPlay playsInline className="w-full h-full object-contain" />
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-green-500/90 rounded-lg backdrop-blur-sm">
            <MonitorUp size={14} className="text-white" />
            <span className="text-white text-xs font-bold">Sharing Screen</span>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 ${isScreenSharing ? 'bg-transparent' : 'bg-gradient-to-b from-black/60 to-transparent'}`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-lg">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-xs font-bold">LIVE</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-lg">
            <Clock size={12} className="text-white/70" />
            <span className="text-white text-xs font-mono font-bold">{formatTime(callDuration)}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-lg">
            <span className="text-white/70 text-xs">{demoMeetingId}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-lg">
            <Users size={12} className="text-white/70" />
            <span className="text-white text-xs font-medium">2 participants</span>
          </div>
          <button onClick={toggleFullScreen} className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition">
            {isFullScreen ? <Minimize2 size={14} className="text-white" /> : <Maximize2 size={14} className="text-white" />}
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className={`h-full ${isChatOpen ? 'pr-80' : ''} transition-all duration-300`}>
        {isScreenSharing ? (
          <div className="absolute bottom-24 right-4 z-40 w-40 h-28 sm:w-48 sm:h-36 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${!isVideoOn ? 'hidden' : ''}`}
            />
            {!isVideoOn && (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm">
                  You
                </div>
              </div>
            )}
            <div className="absolute bottom-1.5 left-2 px-2 py-0.5 bg-black/50 rounded text-white text-[10px] font-medium backdrop-blur-sm">
              You {isVideoOn ? '' : '(camera off)'}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col sm:flex-row">
            {/* Remote Participant */}
            <div className="flex-1 relative bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-4">
              <div className="text-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-violet-500/30">
                  <span className="text-white font-bold text-3xl sm:text-4xl">
                    {demoParticipant.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <p className="text-white font-bold text-base sm:text-lg">{demoParticipant}</p>
                <p className="text-gray-400 text-xs mt-1">Remote participant</p>
              </div>
              <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg">
                <p className="text-white text-xs font-medium">{demoParticipant}</p>
              </div>
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-lg">
                <div className="flex gap-0.5">
                  <div className="w-0.5 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-0.5 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-0.5 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                  <div className="w-0.5 h-1.5 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
                </div>
              </div>
            </div>

            {/* Local Video */}
            <div className="flex-1 relative bg-gray-800 flex items-center justify-center p-4">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover rounded-2xl ${!isVideoOn ? 'hidden' : ''}`}
                style={{ transform: 'scaleX(-1)' }}
              />
              {!isVideoOn && (
                <div className="absolute inset-4 flex items-center justify-center">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-700 flex items-center justify-center shadow-xl">
                    <VideoOff size={32} className="text-gray-400" />
                  </div>
                </div>
              )}
              <div className="absolute bottom-6 left-6 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg">
                <p className="text-white text-xs font-medium">You {isVideoOn ? '' : '(camera off)'}</p>
              </div>
              {!isAudioOn && (
                <div className="absolute top-6 right-6 px-2.5 py-1 bg-red-500/80 backdrop-blur-sm rounded-lg">
                  <p className="text-white text-[10px] font-bold flex items-center gap-1">
                    <MicOff size={10} /> Muted
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chat Panel */}
      {isChatOpen && (
        <div className="absolute top-0 right-0 bottom-0 w-80 bg-gray-800/95 backdrop-blur-md border-l border-gray-700 z-20 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <MessageCircle size={16} className="text-gray-300" />
              <span className="text-white text-sm font-bold">In-call Chat</span>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white transition text-lg">
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle size={24} className="text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-xs">No messages yet</p>
              </div>
            ) : (
              chatMessages.map((msg, i) => (
                <div key={i} className="flex flex-col">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-violet-400 text-xs font-bold">{msg.sender}</span>
                    <span className="text-gray-600 text-[10px]">{msg.time}</span>
                  </div>
                  <div className="bg-gray-700/50 rounded-xl rounded-tl-none px-3 py-2 ml-4">
                    <p className="text-gray-200 text-xs">{msg.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-3 border-t border-gray-700 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-violet-500 transition"
              />
              <button onClick={sendChatMessage} className="px-3 py-2 bg-violet-600 hover:bg-violet-700 rounded-xl transition">
                <SendIcon size={14} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16 pb-5 px-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <button
              onClick={toggleAudio}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
                isAudioOn
                  ? 'bg-white/15 hover:bg-white/25 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
              }`}
              title={isAudioOn ? 'Mute' : 'Unmute'}
            >
              {isAudioOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>

            <button
              onClick={toggleVideo}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
                isVideoOn
                  ? 'bg-white/15 hover:bg-white/25 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
              }`}
              title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
                isScreenSharing
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
              title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
            >
              <MonitorUp size={20} />
            </button>

            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
                isChatOpen
                  ? 'bg-violet-500 hover:bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
              title="Chat"
            >
              <MessageCircle size={20} />
            </button>

            <div className="w-px h-8 bg-white/20 mx-1 sm:mx-2 hidden sm:block" />

            <button
              onClick={endCall}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/40 transition-all active:scale-95"
              title="End call"
            >
              <PhoneOff size={20} />
            </button>
          </div>

          <div className="sm:hidden flex justify-center mt-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-lg">
              <Clock size={11} className="text-white/60" />
              <span className="text-white/80 text-[11px] font-mono font-bold">{formatTime(callDuration)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Send icon component
const SendIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4Z" /><path d="m22 2-11 11" />
  </svg>
);

export default VideoRoom;