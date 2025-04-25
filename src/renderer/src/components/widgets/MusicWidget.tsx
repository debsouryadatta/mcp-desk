import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Song {
  title: string;
  artist: string;
  url: string;
}

interface MusicWidgetProps {
  songs?: Song[];
}

export default function MusicWidget({ songs = [] }: MusicWidgetProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([75]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastDrawTime = useRef<number>(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (!entry.isIntersecting && audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && songs.length > 0) {
      audioRef.current = new Audio(songs[currentSongIndex].url);
      audioRef.current.volume = volume[0] / 100;
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
      });
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentSongIndex, isVisible, songs]);

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const nextSong = useCallback(() => {
    setCurrentSongIndex((prev) => (prev + 1) % songs.length);
    setCurrentTime(0);
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play();
        }
      }, 100);
    }
  }, [isPlaying, songs.length]);

  const prevSong = useCallback(() => {
    setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length);
    setCurrentTime(0);
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play();
        }
      }, 100);
    }
  }, [isPlaying, songs.length]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  const draw = useCallback((timestamp: number) => {
    if (!canvasRef.current || !isVisible || !isPlaying) return;
    
    if (timestamp - lastDrawTime.current < 33) {
      animationFrameRef.current = requestAnimationFrame(draw);
      return;
    }
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    const WIDTH = canvasRef.current.width;
    const HEIGHT = canvasRef.current.height;
    const barWidth = WIDTH / 32;
    
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    for (let i = 0; i < 32; i++) {
      const value = Math.sin((i + currentTime * 10) / 3) * 50 + 50;
      const barHeight = (value / 100) * HEIGHT;
      
      const gradient = ctx.createLinearGradient(0, HEIGHT, 0, HEIGHT - barHeight);
      gradient.addColorStop(0, 'rgba(255, 204, 0, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 204, 0, 0.4)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(
        i * (barWidth + 1),
        HEIGHT - barHeight,
        barWidth,
        barHeight
      );
    }
    
    lastDrawTime.current = timestamp;
    animationFrameRef.current = requestAnimationFrame(draw);
  }, [isPlaying, currentTime, isVisible]);

  useEffect(() => {
    if (isPlaying && isVisible) {
      animationFrameRef.current = requestAnimationFrame(draw);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, draw, isVisible]);

  useEffect(() => {
    let interval: number;
    
    if (isPlaying && isVisible) {
      interval = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
          if (audioRef.current.currentTime >= duration) {
            nextSong();
          }
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, currentSongIndex, nextSong, isVisible, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!songs.length) {
    return (
      <Card className="shadow-lg overflow-hidden group">
        <CardContent className="p-4 relative bg-gradient-to-br from-[#FFCC00] to-[#FFA500]">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
          <div className="relative flex items-center justify-center h-[160px] text-black/75">
            Add songs in settings to enable music player
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg overflow-hidden group" ref={containerRef}>
      <CardContent className="p-4 relative bg-gradient-to-br from-[#FFCC00] to-[#FFA500]">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
        <div className="relative">
          <div className="mb-2">
            <h3 className="font-medium text-sm text-black/75">Now Playing</h3>
            <div className="font-bold text-base text-black truncate">
              {songs[currentSongIndex]?.title} - {songs[currentSongIndex]?.artist}
            </div>
          </div>
          
          <canvas 
            ref={canvasRef} 
            width="300" 
            height="40" 
            className="w-full h-[40px] mb-2 rounded-md"
          />
          
          <div className="flex justify-between text-xs text-black/75 mb-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={(value) => {
              if (audioRef.current) {
                audioRef.current.currentTime = value[0];
                setCurrentTime(value[0]);
              }
            }}
            className="mb-3"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-black hover:bg-black/10"
                onClick={prevSong}
                disabled={songs.length <= 1}
              >
                <SkipBack size={18} />
              </Button>
              <Button 
                onClick={togglePlay} 
                variant="outline" 
                size="icon" 
                className="bg-black text-white border-none hover:bg-black/80 transition-all"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isPlaying ? 'pause' : 'play'}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </motion.div>
                </AnimatePresence>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-black hover:bg-black/10"
                onClick={nextSong}
                disabled={songs.length <= 1}
              >
                <SkipForward size={18} />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Volume2 size={16} className="text-black/75" />
              <Slider
                value={volume}
                max={100}
                step={1}
                onValueChange={setVolume}
                className="w-20"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}