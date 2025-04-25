import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Grid2X2, Circle } from 'lucide-react';

interface Skill {
  name: string;
  category: 'UX' | 'UI' | 'QA' | 'HR' | 'Sales';
  level: 1 | 2 | 3 | 4 | 5;
}

export default function SkillsWidget() {
  const [viewMode, setViewMode] = useState<'grid' | 'circles'>('grid');
  
  const skills: Skill[] = [
    { name: 'User Research', category: 'UX', level: 5 },
    { name: 'Prototyping', category: 'UX', level: 4 },
    { name: 'Wireframing', category: 'UX', level: 5 },
    { name: 'Color Theory', category: 'UI', level: 3 },
    { name: 'Typography', category: 'UI', level: 4 },
    { name: 'Iconography', category: 'UI', level: 5 },
    { name: 'Test Planning', category: 'QA', level: 5 },
    { name: 'Automation', category: 'QA', level: 2 },
    { name: 'Recruitment', category: 'HR', level: 4 },
    { name: 'Onboarding', category: 'HR', level: 5 },
    { name: 'Negotiation', category: 'Sales', level: 3 },
    { name: 'Prospecting', category: 'Sales', level: 4 },
  ];
  
  const categories = ['UX', 'UI', 'QA', 'HR', 'Sales'];
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'UX': return 'bg-blue-500';
      case 'UI': return 'bg-purple-500';
      case 'QA': return 'bg-green-500';
      case 'HR': return 'bg-orange-500';
      case 'Sales': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-gray-300 dark:bg-gray-700';
      case 2: return 'bg-blue-300 dark:bg-blue-700';
      case 3: return 'bg-green-300 dark:bg-green-700';
      case 4: return 'bg-yellow-300 dark:bg-yellow-700';
      case 5: return 'bg-red-300 dark:bg-red-700';
      default: return 'bg-gray-300 dark:bg-gray-700';
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Team Skills Matrix</CardTitle>
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'circles')}>
          <ToggleGroupItem value="grid" aria-label="Grid view" size="sm">
            <Grid2X2 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="circles" aria-label="Circles view" size="sm">
            <Circle className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <CardContent className="pb-6">
        {viewMode === 'grid' ? (
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`}></div>
                  <h4 className="text-sm font-medium">{category}</h4>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {skills
                    .filter(skill => skill.category === category)
                    .map((skill) => (
                      <div 
                        key={skill.name}
                        className="relative p-2 rounded-md border border-border bg-card text-card-foreground"
                      >
                        <span className="text-xs block line-clamp-1">{skill.name}</span>
                        <div className="flex mt-1 gap-0.5">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div 
                              key={level}
                              className={`h-1.5 flex-1 rounded-full ${
                                level <= skill.level 
                                  ? getLevelColor(skill.level)
                                  : 'bg-gray-200 dark:bg-gray-800'
                              }`}
                            ></div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {skills.map((skill) => (
              <div 
                key={skill.name}
                className="flex flex-col items-center justify-center"
              >
                <div 
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center ${getCategoryColor(skill.category)} text-white`}
                >
                  <span className="text-lg font-bold">{skill.level}</span>
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background bg-white"></div>
                </div>
                <span className="text-xs mt-2 text-center line-clamp-1">{skill.name}</span>
                <span className="text-xs text-muted-foreground">{skill.category}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}