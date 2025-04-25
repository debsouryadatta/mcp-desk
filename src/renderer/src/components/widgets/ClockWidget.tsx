import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

export default function ClockWidget() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formattedTime = format(time, 'HH:mm:ss');
  const formattedDate = format(time, 'EEEE, MMMM do');
  const year = format(time, 'yyyy');
  
  return (
    <Card className="shadow-lg overflow-hidden group">
      <CardContent className="p-4 relative bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
        <div className="relative">
          <div className="mb-2">
            <h3 className="font-medium text-sm text-white/75">Current Time</h3>
            <div className="text-3xl font-bold text-white tracking-tight mb-1">
              {formattedTime}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm transition-transform hover:scale-105">
              <div className="text-xs text-white/75">Date</div>
              <div className="font-medium text-white">{formattedDate}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm transition-transform hover:scale-105">
              <div className="text-xs text-white/75">Year</div>
              <div className="font-medium text-white">{year}</div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
        </div>
      </CardContent>
    </Card>
  );
}