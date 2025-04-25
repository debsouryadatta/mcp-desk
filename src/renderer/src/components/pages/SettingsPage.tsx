import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, User, MapPin, Github, Key, Cpu, Image, Music, Plus, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Settings {
  name: string;
  location: string;
  githubUsername: string;
  openrouterKey: string;
  selectedModel: string;
  carouselPhotos: Array<{
    url: string;
    title: string;
  }>;
  songs: Array<{
    title: string;
    artist: string;
    url: string;
  }>;
  profilePicture: string;
}

interface Model {
  id: string;
  name: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('user-settings');
    return saved ? JSON.parse(saved) : {
      name: 'Jack Grealish',
      location: '',
      githubUsername: 'debsouryadatta',
      openrouterKey: '',
      selectedModel: '',
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

  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (settings.openrouterKey) {
      fetchModels();
    }
  }, [settings.openrouterKey]);

  const fetchModels = async () => {
    if (!settings.openrouterKey) return;
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${settings.openrouterKey}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data?.data && Array.isArray(data.data)) {
          setModels(data.data.map((model: any) => ({
            id: model.id || '',
            name: model.name || ''
          })));
        } else {
          setModels([]);
        }
      } else {
        setModels([]);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      setModels([]);
    }
  };

  const handlePhotoChange = (index: number, field: 'url' | 'title', value: string) => {
    const newPhotos = [...settings.carouselPhotos];
    if (index >= 0 && index < newPhotos.length) {
      newPhotos[index] = { ...newPhotos[index], [field]: value };
      setSettings(prev => ({ ...prev, carouselPhotos: newPhotos }));
    }
  };

  const handleSongChange = (index: number, field: keyof Settings['songs'][0], value: string) => {
    const newSongs = [...settings.songs];
    if (index >= 0 && index < newSongs.length) {
      newSongs[index] = { ...newSongs[index], [field]: value };
      setSettings(prev => ({ ...prev, songs: newSongs }));
    }
  };

  const addSong = () => {
    setSettings(prev => ({
      ...prev,
      songs: [...prev.songs, { title: '', artist: '', url: '' }]
    }));
  };

  const removeSong = (index: number) => {
    setSettings(prev => ({
      ...prev,
      songs: prev.songs.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    setLoading(true);
    try {
      localStorage.setItem('user-settings', JSON.stringify(settings));
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your preferences.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <ScrollArea className="h-screen">
      <div className="container max-w-4xl mx-auto py-8 px-6">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm pb-6 mb-8 border-b">
          <div className="flex items-center justify-between px-10 pt-6">
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground mt-1">Manage your preferences and configurations</p>
            </div>
            <Button
              onClick={handleSave}
              disabled={loading}
              size="lg"
              className="bg-primary/90 hover:bg-primary"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Save className="h-5 w-5 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="border-2">
            <CardHeader className="px-8 pt-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Personal Information</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    Configure your profile information displayed across the dashboard
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 ring-2 ring-primary/20">
                  <AvatarImage src={settings.profilePicture} alt="Profile" />
                  <AvatarFallback>{settings.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="space-y-3 flex-1">
                  <Label htmlFor="profilePicture" className="text-sm font-medium">Profile Picture URL</Label>
                  <Input
                    id="profilePicture"
                    value={settings.profilePicture}
                    onChange={(e) => setSettings(prev => ({ ...prev, profilePicture: e.target.value }))}
                    placeholder="Enter profile picture URL"
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a URL for your profile picture (recommended: square image, at least 200x200px)
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-medium">Display Name</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your name"
                  className="h-11"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="location" className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4" /> Location
                </Label>
                <Input
                  id="location"
                  value={settings.location}
                  onChange={(e) => setSettings(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter your location"
                  className="h-11"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="github" className="flex items-center gap-2 text-sm font-medium">
                  <Github className="h-4 w-4" /> GitHub Username
                </Label>
                <Input
                  id="github"
                  value={settings.githubUsername}
                  onChange={(e) => setSettings(prev => ({ ...prev, githubUsername: e.target.value }))}
                  placeholder="Enter your GitHub username"
                  className="h-11"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="px-8 pt-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Music className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Music Player</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    Manage your music playlist
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="space-y-6">
                {settings.songs.map((song, index) => (
                  <div key={index} className="space-y-3 p-4 rounded-lg border bg-card/50">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Song {index + 1}</Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeSong(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-3">
                      <Input
                        value={song.title}
                        onChange={(e) => handleSongChange(index, 'title', e.target.value)}
                        placeholder="Song title"
                        className="h-11"
                      />
                      <Input
                        value={song.artist}
                        onChange={(e) => handleSongChange(index, 'artist', e.target.value)}
                        placeholder="Artist name"
                        className="h-11"
                      />
                      <Input
                        value={song.url}
                        onChange={(e) => handleSongChange(index, 'url', e.target.value)}
                        placeholder="Audio file URL"
                        className="h-11"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addSong}
                  className="w-full h-11"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Song
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="px-8 pt-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Cpu className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">AI Configuration</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    Configure your AI model preferences and API settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="openrouter" className="flex items-center gap-2 text-sm font-medium">
                  <Key className="h-4 w-4" /> OpenRouter API Key
                </Label>
                <Input
                  id="openrouter"
                  type="password"
                  value={settings.openrouterKey}
                  onChange={(e) => setSettings(prev => ({ ...prev, openrouterKey: e.target.value }))}
                  placeholder="Enter your OpenRouter API key"
                  className="h-11"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium">AI Model</Label>
                <Select
                  value={settings.selectedModel}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, selectedModel: value }))}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select an AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models && models.length > 0 ? (
                      models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-models" disabled>
                        No models available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="px-8 pt-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Image className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Photo Carousel</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    Customize the images and titles displayed in your dashboard carousel
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="grid gap-6">
                {settings.carouselPhotos.map((photo, index) => (
                  <div key={index} className="space-y-3">
                    <Label htmlFor={`photo-${index}`} className="text-sm font-medium">
                      Photo {index + 1}
                    </Label>
                    <div className="grid gap-3">
                      <div className="flex gap-3">
                        <Input
                          id={`photo-${index}`}
                          value={photo.url}
                          onChange={(e) => handlePhotoChange(index, 'url', e.target.value)}
                          placeholder="Enter photo URL"
                          className="h-11"
                        />
                        <div className="h-11 w-20 rounded-lg overflow-hidden border">
                          <img
                            src={photo.url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <Input
                        value={photo.title}
                        onChange={(e) => handlePhotoChange(index, 'title', e.target.value)}
                        placeholder="Enter photo title"
                        className="h-11"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}