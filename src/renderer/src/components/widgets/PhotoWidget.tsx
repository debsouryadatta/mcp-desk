import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit2, Plus } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  image: string;
  fallback: string;
}

export default function PhotoWidget() {
  const [profiles] = useState<Profile[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200',
      fallback: 'SC',
    },
    {
      id: '2',
      name: 'Mark Wilson',
      image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=200',
      fallback: 'MW',
    },
    {
      id: '3',
      name: 'Jamal Lewis',
      image: 'https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg?auto=compress&cs=tinysrgb&w=200',
      fallback: 'JL',
    },
  ]);

  return (
    <Card className="shadow-md transition-all hover:shadow-lg">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Team Members</h3>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Plus size={16} />
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {profiles.map((profile) => (
            <div 
              key={profile.id} 
              className="relative group flex flex-col items-center"
            >
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-background transition-all group-hover:border-primary">
                  <AvatarImage src={profile.image} alt={profile.name} />
                  <AvatarFallback>{profile.fallback}</AvatarFallback>
                </Avatar>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-6 w-6 p-1 absolute -bottom-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card border border-border rounded-full"
                >
                  <Edit2 size={12} />
                </Button>
              </div>
              <span className="text-xs mt-2 text-center line-clamp-1">{profile.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}