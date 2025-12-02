import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Search, Music, Volume2, VolumeX } from 'lucide-react';

export default function MusicPlayer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const searchTracks = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.allorigins.win/raw?url=${encodeURIComponent(
          `https://api.deezer.com/search?q=${encodeURIComponent(searchQuery)}`
        )}`
      );
      const data = await response.json();
      setTracks(data.data || []);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      setTracks([]);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchTracks();
    }
  };

  const playTrack = (track) => {
    if (currentTrack?.id === track.id) {
      togglePlayPause();
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = track.preview;
        audioRef.current.play();
      }
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playNext = () => {
    const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex < tracks.length - 1) {
      playTrack(tracks[currentIndex + 1]);
    }
  };

  const playPrevious = () => {
    const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex > 0) {
      playTrack(tracks[currentIndex - 1]);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white p-6">
      <audio ref={audioRef} onEnded={playNext} />
      
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Music className="w-10 h-10" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Deezer Music Player
            </h1>
          </div>
          <p className="text-purple-300">Search and play millions of songs</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for artists, songs, or albums..."
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-purple-300"
            />
            <button
              onClick={searchTracks}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 p-3 rounded-full transition-all"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-400 border-t-transparent"></div>
            <p className="mt-4 text-purple-300">Searching for tracks...</p>
          </div>
        )}

        {/* Track List */}
        {!loading && tracks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-32">
            {tracks.map((track) => (
              <div
                key={track.id}
                onClick={() => playTrack(track)}
                className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 cursor-pointer transition-all hover:bg-white/20 hover:scale-105 border ${
                  currentTrack?.id === track.id
                    ? 'border-purple-400 ring-2 ring-purple-400'
                    : 'border-white/20'
                }`}
              >
                <div className="flex gap-4">
                  <img
                    src={track.album.cover_medium}
                    alt={track.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate text-white">
                      {track.title}
                    </h3>
                    <p className="text-sm text-purple-300 truncate">
                      {track.artist.name}
                    </p>
                    <p className="text-xs text-purple-400 truncate mt-1">
                      {track.album.title}
                    </p>
                    <p className="text-xs text-purple-400 mt-1">
                      {formatDuration(track.duration)}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {currentTrack?.id === track.id && isPlaying ? (
                      <Pause className="w-6 h-6 text-purple-400" />
                    ) : (
                      <Play className="w-6 h-6 text-purple-400" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && tracks.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <Music className="w-16 h-16 mx-auto text-purple-400 mb-4" />
            <p className="text-purple-300">No tracks found. Try a different search!</p>
          </div>
        )}

        {/* Initial State */}
        {!loading && tracks.length === 0 && !searchQuery && (
          <div className="text-center py-12">
            <Music className="w-20 h-20 mx-auto text-purple-400 mb-4" />
            <p className="text-xl text-purple-300">Start by searching for your favorite music!</p>
          </div>
        )}
      </div>

      {/* Player Controls */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 to-black/80 backdrop-blur-xl border-t border-white/10 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-6">
              {/* Track Info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <img
                  src={currentTrack.album.cover_small}
                  alt={currentTrack.title}
                  className="w-16 h-16 rounded-lg"
                />
                <div className="min-w-0">
                  <h4 className="font-semibold truncate">{currentTrack.title}</h4>
                  <p className="text-sm text-purple-300 truncate">
                    {currentTrack.artist.name}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={playPrevious}
                  className="p-2 hover:bg-white/10 rounded-full transition-all"
                  disabled={tracks.findIndex(t => t.id === currentTrack.id) === 0}
                >
                  <SkipBack className="w-6 h-6" />
                </button>
                <button
                  onClick={togglePlayPause}
                  className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full transition-all"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </button>
                <button
                  onClick={playNext}
                  className="p-2 hover:bg-white/10 rounded-full transition-all"
                  disabled={
                    tracks.findIndex(t => t.id === currentTrack.id) === tracks.length - 1
                  }
                >
                  <SkipForward className="w-6 h-6" />
                </button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMute}
                  className="p-2 hover:bg-white/10 rounded-full transition-all"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    if (isMuted) setIsMuted(false);
                  }}
                  className="w-24"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
