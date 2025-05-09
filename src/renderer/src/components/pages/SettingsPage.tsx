import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, User, MapPin, Github, Key, Cpu, Image, Music, Plus, Trash2, Download, Upload, Server, Search } from 'lucide-react';
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
  profilePicture?: string;
}

interface Model {
  id: string;
  name: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('user-settings');
    return saved ? JSON.parse(saved) : {
      name: 'John Doe',
      location: '',
      githubUsername: '',
      openrouterKey: '',
      selectedModel: 'google/gemini-2.0-flash-001',
      profilePicture: '',
      songs: [
        {
          title: "Demo Song",
          artist: "Demo Artist",
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mcpConfig, setMcpConfig] = useState(() => {
    const saved = localStorage.getItem('mcp-config');
    return saved || '{\n  "mcpServers": {}\n}';
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState('');

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
      
      // Validate and save MCP config
      try {
        const parsedConfig = JSON.parse(mcpConfig);
        if (!parsedConfig.mcpServers || typeof parsedConfig.mcpServers !== 'object') {
          throw new Error('Invalid MCP configuration format');
        }
        localStorage.setItem('mcp-config', mcpConfig);
      } catch (error) {
        toast({
          title: "Invalid MCP Configuration",
          description: "Please check your MCP server configuration format.",
          variant: "destructive",
        });
        return;
      }

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

  const exportSettings = () => {
    try {
      const exportData: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            exportData[key] = JSON.parse(localStorage.getItem(key) || '');
          } catch {
            exportData[key] = localStorage.getItem(key);
          }
        }
      }

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mcp-desk.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Settings exported",
        description: "Your settings have been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your settings.",
        variant: "destructive",
      });
    }
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        if (typeof importedData !== 'object') throw new Error('Invalid file format');

        Object.entries(importedData).forEach(([key, value]) => {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        });

        const newSettings = localStorage.getItem('user-settings');
        if (newSettings) {
          setSettings(JSON.parse(newSettings));
        }

        // Update MCP config state if it exists in imported data
        const newMcpConfig = localStorage.getItem('mcp-config');
        if (newMcpConfig) {
          setMcpConfig(newMcpConfig);
        }

        window.dispatchEvent(new Event('storage'));

        toast({
          title: "Settings imported",
          description: "Your settings have been imported successfully.",
        });
      } catch (error) {
        toast({
          title: "Import failed",
          description: "The file format is invalid. Please use a properly formatted JSON file.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Create a filtered models list based on search query
  const filteredModels = models.filter(model => 
    model.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) || 
    model.id.toLowerCase().includes(modelSearchQuery.toLowerCase())
  );

  return (
    <ScrollArea className="h-screen">
      <div className="container max-w-4xl mx-auto py-8 px-4 sm:px-6 pb-20">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm pb-6 mb-8 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 sm:px-6 pt-6">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold truncate">Settings</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage your preferences and configurations</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={importSettings}
                  accept=".json"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 sm:flex-none bg-card/50 backdrop-blur-sm border-primary/20 hover:bg-primary/10 h-9 px-3 sm:px-4"
                  size="sm"
                >
                  <Upload className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Import</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={exportSettings}
                  className="flex-1 sm:flex-none bg-card/50 backdrop-blur-sm border-primary/20 hover:bg-primary/10 h-9 px-3 sm:px-4"
                  size="sm"
                >
                  <Download className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </div>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-primary/90 hover:bg-primary h-9 px-4"
                size="sm"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 sm:mr-2" />
                )}
                <span className="hidden sm:inline">Save Changes</span>
                <span className="sm:hidden">Save</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Personal Information Card */}
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

          {/* AI Configuration Card */}
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
                      <>
                        <div className="px-2 py-2 sticky top-0 bg-popover z-10">
                          <div className="flex items-center border rounded-md px-3 h-9">
                            <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                            <input 
                              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                              placeholder="Search models..."
                              value={modelSearchQuery}
                              onChange={(e) => setModelSearchQuery(e.target.value)}
                            />
                          </div>
                        </div>
                        <ScrollArea className="h-72">
                          {filteredModels.length > 0 ? (
                            filteredModels.map((model) => (
                              <SelectItem key={model.id} value={model.id}>
                                {model.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                              No models found matching "{modelSearchQuery}"
                            </div>
                          )}
                        </ScrollArea>
                      </>
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

          {/* MCP Server Configuration Card */}
          <Card className="border-2">
            <CardHeader className="px-8 pt-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Server className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">MCP Server Configuration</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    Configure your MCP servers for AI tools
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Server className="h-4 w-4 mr-2" />
                    Add MCP Server
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>MCP Server Configuration</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <Textarea
                      value={mcpConfig}
                      onChange={(e) => setMcpConfig(e.target.value)}
                      className="font-mono h-[400px]"
                      placeholder="Enter your MCP server configuration in JSON format"
                    />
                    <div className="mt-4 flex justify-end">
                      <Button 
                        onClick={() => {
                          try {
                            // Validate JSON
                            JSON.parse(mcpConfig);
                            
                            // Save to localStorage
                            localStorage.setItem('mcp-config', mcpConfig);
                            
                            // Dispatch storage event to notify other components
                            window.dispatchEvent(new StorageEvent('storage', {
                              key: 'mcp-config',
                              newValue: mcpConfig
                            }));
                            
                            toast({
                              title: "Configuration saved",
                              description: "MCP server configuration has been saved successfully."
                            });
                            
                            setIsDialogOpen(false);
                          } catch (error) {
                            toast({
                              title: "Invalid JSON",
                              description: "Please enter valid JSON configuration.",
                              variant: "destructive"
                            });
                          }
                        }}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Configuration
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Music Player Card */}
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

          {/* Photo Carousel Card */}
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