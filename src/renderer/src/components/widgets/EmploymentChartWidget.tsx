import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { cn } from '@/lib/utils';

interface ChartData {
  name: string;
  hired: number;
  left: number;
}

export default function EmploymentChartWidget() {
  // Generate sample data for the past 6 months
  const generateMonthlyData = () => {
    const data: ChartData[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    months.forEach((month) => {
      data.push({
        name: month,
        hired: Math.floor(Math.random() * 15) + 5, // 5-20 hires
        left: Math.floor(Math.random() * 8) + 1, // 1-8 departures
      });
    });
    
    return data;
  };
  
  const data = generateMonthlyData();
  
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground shadow-md rounded-md p-3 border border-border">
          <p className="font-medium mb-1">{label}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-chart-1"></div>
              <span>Hired:</span>
              <span className="font-medium">{payload[0].value}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-chart-2"></div>
              <span>Left:</span>
              <span className="font-medium">{payload[1].value}</span>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Employment Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              barGap={0}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="hired" 
                className="fill-chart-1" 
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="left" 
                className="fill-chart-2" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-center gap-6 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-1"></div>
            <span className="text-sm">Hired</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-2"></div>
            <span className="text-sm">Left</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}