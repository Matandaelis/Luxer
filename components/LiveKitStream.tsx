
import React from 'react';
import { 
  LiveKitRoom, 
  useTracks, 
  useLocalParticipant,
  ControlBar,
  RoomAudioRenderer,
  VideoTrack,
  useConnectionState,
  StartAudio,
} from '@livekit/components-react';
import { Track, ConnectionState } from 'livekit-client';
import { Loader2, VolumeX, Volume2, Video, WifiOff, AlertTriangle } from 'lucide-react';

interface LiveKitStreamProps {
  token: string | null;
  serverUrl: string;
  isMuted: boolean;
  onToggleMute: () => void;
  role: 'host' | 'viewer';
  demoMode?: boolean;
}

const LiveKitStream: React.FC<LiveKitStreamProps> = ({ token, serverUrl, isMuted, onToggleMute, role, demoMode = false }) => {
  // --- DEMO MODE RENDER ---
  if (demoMode) {
    return (
      <div className="relative w-full h-full bg-black overflow-hidden border-4 border-black">
        {/* Placeholder Image simulating a video stream */}
        <img 
          src="https://images.unsplash.com/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&q=80&w=1200" 
          className="w-full h-full object-cover opacity-80 grayscale"
          alt="Demo Stream"
        />
        <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
        
        {/* Demo Indicator */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10 pointer-events-none bg-[#CCFF00] p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
           <Video size={64} className="text-black mb-4" />
           <p className="text-xl font-black uppercase tracking-widest text-black">Simulation Mode</p>
        </div>

        <OverlayControls role={role} isMuted={isMuted} onToggleMute={onToggleMute} />
      </div>
    );
  }

  // --- LIVEKIT RENDER ---
  if (!token) {
    return (
      <div className="w-full h-full bg-[#CCFF00] flex flex-col items-center justify-center text-black space-y-4 border-4 border-black">
        <Loader2 className="animate-spin text-black" size={48} />
        <p className="text-xs font-black uppercase tracking-widest text-black bg-white px-2 border-2 border-black">Authenticating...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={role === 'host'} 
      audio={role === 'host'} 
      token={token}
      serverUrl={serverUrl}
      connect={true}
      className="w-full h-full bg-black relative font-sans border-4 border-black"
    >
      <StartAudio 
        label="Click to Unmute Stream"
        className="absolute inset-0 z-[60] bg-[#CCFF00] flex items-center justify-center text-black font-black text-2xl uppercase tracking-widest cursor-pointer hover:bg-white transition-all border-4 border-black m-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" 
      />
      <StreamContent role={role} isMuted={isMuted} onToggleMute={onToggleMute} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
};

const StreamContent: React.FC<{ role: 'host' | 'viewer', isMuted: boolean, onToggleMute: () => void }> = ({ role, isMuted, onToggleMute }) => {
  const connectionState = useConnectionState();
  const tracks = useTracks([Track.Source.Camera]);
  const { localParticipant } = useLocalParticipant();

  const videoTrack = role === 'host' 
    ? tracks.find(t => t.participant.identity === localParticipant.identity)
    : tracks.find(t => t.participant.identity !== localParticipant.identity);

  if (connectionState === ConnectionState.Connecting) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white text-black space-y-4 border-4 border-black">
         <Loader2 className="animate-spin text-black" size={48} />
         <p className="text-xs font-black uppercase tracking-widest text-black bg-[#CCFF00] px-2 border-2 border-black">Connecting to Room...</p>
      </div>
    );
  }

  if (connectionState === ConnectionState.Reconnecting) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white text-black space-y-4 border-4 border-black">
         <Loader2 className="animate-spin text-black" size={48} />
         <p className="text-xs font-black uppercase tracking-widest text-black bg-yellow-400 px-2 border-2 border-black">Signal lost. Reconnecting...</p>
      </div>
    );
  }

  if (connectionState === ConnectionState.Disconnected) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white text-black space-y-4 border-4 border-black">
         <WifiOff className="text-red-500" size={48} />
         <p className="text-xs font-black uppercase tracking-widest text-white bg-red-500 px-2 border-2 border-black">Stream Ended</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {videoTrack ? (
        <VideoTrack trackRef={videoTrack} className="w-full h-full object-cover grayscale" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#CCFF00]">
            {role === 'host' ? (
                 <div className="flex flex-col items-center space-y-4 bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <Loader2 className="animate-spin text-black" size={40} />
                    <p className="text-black text-xs font-black uppercase tracking-widest">Initializing Camera...</p>
                 </div>
            ) : (
                 <div className="text-center space-y-6 bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                     <div className="w-24 h-24 bg-black flex items-center justify-center mx-auto animate-pulse border-4 border-black shadow-[4px_4px_0px_0px_rgba(204,255,0,1)]">
                         <Video size={40} className="text-[#CCFF00]" />
                     </div>
                     <p className="text-black text-xs font-black uppercase tracking-widest bg-[#CCFF00] px-2 border-2 border-black">Waiting for Host...</p>
                 </div>
            )}
        </div>
      )}
      
      <OverlayControls role={role} isMuted={isMuted} onToggleMute={onToggleMute} />

      {role === 'host' && (
        <div className="absolute bottom-40 left-0 right-0 flex justify-center z-50 pointer-events-none">
            <div className="pointer-events-auto scale-90 origin-bottom bg-white p-2 border-4 border-black shadow-[8px_8px_0px_0px_rgba(204,255,0,1)]">
                <ControlBar 
                  variation="minimal" 
                  controls={{ microphone: true, camera: true, screenShare: false, leave: false }} 
                />
            </div>
        </div>
      )}
    </div>
  );
};

const OverlayControls = ({ role, isMuted, onToggleMute }: { role: string, isMuted: boolean, onToggleMute: () => void }) => (
  <div className="absolute bottom-6 right-6 flex space-x-4 z-50">
    {role === 'host' && (
          <div className="bg-red-500 px-4 py-2 border-4 border-black flex items-center space-x-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-3 h-3 bg-white border-2 border-black animate-pulse"></div>
              <span className="text-xs font-black text-white uppercase tracking-widest">Live</span>
          </div>
    )}

    {role === 'viewer' && (
        <button 
          onClick={onToggleMute}
          className="w-14 h-14 bg-[#CCFF00] flex items-center justify-center text-black hover:bg-white transition-all border-4 border-black active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
    )}
  </div>
);

export default LiveKitStream;
