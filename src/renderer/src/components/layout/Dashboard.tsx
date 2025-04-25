import { useEffect, useState } from 'react';
import ClockWidget from '@/components/widgets/ClockWidget';
import MusicWidget from '@/components/widgets/MusicWidget';
import PhotoCarouselWidget from '@/components/widgets/PhotoCarouselWidget';
import GitHubWidget from '@/components/widgets/GitHubWidget';
import WeatherWidget from '@/components/widgets/WeatherWidget';
import TodoWidget from '@/components/widgets/TodoWidget';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';

interface Settings {
  name: string;
  location: string;
  githubUsername: string;
  carouselPhotos: Array<{
    url: string;
    title: string;
  }>;
  songs: Array<{
    title: string;
    artist: string;
    url: string;
  }>;
  profilePicture?: string;
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('user-settings');
    return saved ? JSON.parse(saved) : {
      name: 'Jack Grealish',
      location: '',
      githubUsername: 'debsouryadatta',
      profilePicture: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=100',
      songs: [
        {
          title: "Shape of You",
          artist: "Ed Sheeran",
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        }
      ],
      carouselPhotos: [
        { url: "https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=1280", title: "Modern Development Setup" },
        { url: "https://images.pexels.com/photos/5483077/pexels-photo-5483077.jpeg?auto=compress&cs=tinysrgb&w=1280", title: "Clean Code Architecture" },
        { url: "https://images.pexels.com/photos/5483064/pexels-photo-5483064.jpeg?auto=compress&cs=tinysrgb&w=1280", title: "Full-Stack Development" },
        { url: "https://images.pexels.com/photos/5926382/pexels-photo-5926382.jpeg?auto=compress&cs=tinysrgb&w=1280", title: "Code Review Session" },
        { url: "https://images.pexels.com/photos/4709285/pexels-photo-4709285.jpeg?auto=compress&cs=tinysrgb&w=1280", title: "Team Collaboration" },
        { url: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=1280", title: "Debugging Process" }
      ]
    };
  });

  useEffect(() => {
    setMounted(true);
    const handleSettingsChange = () => {
      const saved = localStorage.getItem('user-settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    };

    window.addEventListener('storage', handleSettingsChange);
    return () => window.removeEventListener('storage', handleSettingsChange);
  }, []);

  if (!mounted) return null;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <ScrollArea className="h-screen">
      <div className="container mx-auto p-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <Avatar className="h-12 w-12 ring-2 ring-primary/20">
            <AvatarImage src={settings.profilePicture} alt="Profile" />
            <AvatarFallback>{settings.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Hello,
            </h1>
            <p className="text-xl text-muted-foreground">{settings.name}</p>
          </div>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4"
        >
          <motion.div variants={item} className="md:col-span-6 lg:col-span-12">
            <TodoWidget />
          </motion.div>
          
          <motion.div variants={item} className="md:col-span-2 lg:col-span-4">
            <ClockWidget />
          </motion.div>
          <motion.div variants={item} className="md:col-span-2 lg:col-span-4">
            <WeatherWidget location={settings.location} />
          </motion.div>
          <motion.div variants={item} className="md:col-span-2 lg:col-span-4">
            <MusicWidget songs={settings.songs} />
          </motion.div>
          
          <motion.div variants={item} className="md:col-span-3 lg:col-span-6">
            <PhotoCarouselWidget photos={settings.carouselPhotos} />
          </motion.div>
          <motion.div variants={item} className="md:col-span-3 lg:col-span-6">
            <GitHubWidget username={settings.githubUsername} />
          </motion.div>
        </motion.div>
      </div>
    </ScrollArea>
  );
}