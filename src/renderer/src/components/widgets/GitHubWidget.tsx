import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Github, GitFork, GitPullRequest, Star, Users, History, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Octokit } from 'octokit';

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface GitHubData {
  totalContributions: number;
  contributions: ContributionDay[];
  stats: {
    followers: number;
    following: number;
    publicRepos: number;
    stars: number;
    forks: number;
    streak: {
      current: number;
      longest: number;
    };
  };
}

const octokit = new Octokit();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'github-data-cache';

interface CacheData {
  data: GitHubData;
  timestamp: number;
}

export default function GitHubWidget({ username }: { username?: string }) {
  const [data, setData] = useState<GitHubData | null>(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached) as CacheData;
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  const fetchGitHubData = useCallback(async () => {
    if (!username) return;

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached) as CacheData;
        if (Date.now() - timestamp < CACHE_DURATION) {
          setData(data);
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(true);
      setError(null);

      const [contributionsResponse, userData, reposData] = await Promise.all([
        fetch(`https://github-contributions-api.jogruber.de/v4/${username}`),
        octokit.rest.users.getByUsername({ username }),
        octokit.rest.repos.listForUser({ username, per_page: 100, sort: 'updated' })
      ]);

      if (!contributionsResponse.ok) throw new Error('Failed to fetch GitHub data');
      
      const contributionsData = await contributionsResponse.json();
      const contributions = contributionsData.contributions.map((day: any) => ({
        date: day.date,
        count: day.count,
        level: day.count === 0 ? 0 : Math.min(Math.ceil(day.count / 5), 4)
      }));

      const totalStars = reposData.data.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      const totalForks = reposData.data.reduce((sum, repo) => sum + repo.forks_count, 0);

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      [...contributions].reverse().forEach((day) => {
        if (day.count > 0) {
          tempStreak++;
          if (tempStreak > longestStreak) longestStreak = tempStreak;
          if (currentStreak === tempStreak - 1) currentStreak = tempStreak;
        } else {
          tempStreak = 0;
        }
      });

      const newData: GitHubData = {
        totalContributions: contributions.reduce((sum, day) => sum + day.count, 0),
        contributions,
        stats: {
          followers: userData.data.followers,
          following: userData.data.following,
          publicRepos: userData.data.public_repos,
          stars: totalStars,
          forks: totalForks,
          streak: {
            current: currentStreak,
            longest: longestStreak
          }
        }
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: newData,
        timestamp: Date.now()
      }));

      setData(newData);
    } catch (err) {
      console.error('Error fetching GitHub data:', err);
      setError('Failed to load GitHub activity');
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchGitHubData();
  }, [fetchGitHubData]);

  const getIntensityClass = useCallback((level: number) => {
    switch (level) {
      case 0:
        return 'bg-[#ebedf0] dark:bg-[#161b22] border-[#ebedf0] dark:border-[#161b22]';
      case 1:
        return 'bg-[#9be9a8] dark:bg-[#0e4429] border-[#9be9a8] dark:border-[#0e4429]';
      case 2:
        return 'bg-[#40c463] dark:bg-[#006d32] border-[#40c463] dark:border-[#006d32]';
      case 3:
        return 'bg-[#30a14e] dark:bg-[#26a641] border-[#30a14e] dark:border-[#26a641]';
      case 4:
        return 'bg-[#216e39] dark:bg-[#39d353] border-[#216e39] dark:border-[#39d353]';
      default:
        return 'bg-[#ebedf0] dark:bg-[#161b22] border-[#ebedf0] dark:border-[#161b22]';
    }
  }, []);

  const monthLabels = useMemo(() => {
    if (!data?.contributions.length) return [];

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = [];
    let currentMonth = -1;
    let weekIndex = 0;

    data.contributions.forEach((day, index) => {
      const date = new Date(day.date);
      const month = date.getMonth();

      if (month !== currentMonth) {
        currentMonth = month;
        labels.push({
          month: months[month],
          position: Math.floor(weekIndex * 13)
        });
      }

      if (index % 7 === 0) {
        weekIndex++;
      }
    });

    return labels;
  }, [data?.contributions]);

  const weeks = useMemo(() => {
    if (!data?.contributions) return [];
    const result = [];
    for (let i = 0; i < data.contributions.length; i += 7) {
      result.push(data.contributions.slice(i, i + 7));
    }
    return result;
  }, [data?.contributions]);

  if (!username) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
          <Github className="h-12 w-12 mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Connect GitHub</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add your GitHub username in settings to see your activity and statistics here
          </p>
          <Button 
            variant="outline" 
            onClick={() => document.querySelector('[data-tab="settings"]')?.click()}
            className="bg-primary/90 hover:bg-primary text-primary-foreground"
            disabled
          >
            <Settings className="h-4 w-4 mr-2" />
            Open Settings
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6 flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">{error || 'Unable to load GitHub data'}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchGitHubData}
            className="mt-3"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/60" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />
      <CardContent className="p-5 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-muted-foreground">@{username}</div>
              <div className="text-3xl font-bold mt-1 tracking-tight group-hover:text-primary transition-colors">
                {data.totalContributions} contributions
              </div>
            </div>
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Github className="h-12 w-12" />
            </motion.div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex flex-col items-center p-2 rounded-lg bg-white/5 backdrop-blur-sm dark:bg-white/10"
            >
              <Users className="h-4 w-4 mb-1" />
              <span className="text-xs text-muted-foreground">Followers</span>
              <span className="font-medium">{data.stats.followers}</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex flex-col items-center p-2 rounded-lg bg-white/5 backdrop-blur-sm dark:bg-white/10"
            >
              <Users className="h-4 w-4 mb-1" />
              <span className="text-xs text-muted-foreground">Following</span>
              <span className="font-medium">{data.stats.following}</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex flex-col items-center p-2 rounded-lg bg-white/5 backdrop-blur-sm dark:bg-white/10"
            >
              <GitPullRequest className="h-4 w-4 mb-1" />
              <span className="text-xs text-muted-foreground">Repos</span>
              <span className="font-medium">{data.stats.publicRepos}</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex flex-col items-center p-2 rounded-lg bg-white/5 backdrop-blur-sm dark:bg-white/10"
            >
              <Star className="h-4 w-4 mb-1" />
              <span className="text-xs text-muted-foreground">Stars</span>
              <span className="font-medium">{data.stats.stars}</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex flex-col items-center p-2 rounded-lg bg-white/5 backdrop-blur-sm dark:bg-white/10"
            >
              <GitFork className="h-4 w-4 mb-1" />
              <span className="text-xs text-muted-foreground">Forks</span>
              <span className="font-medium">{data.stats.forks}</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex flex-col items-center p-2 rounded-lg bg-white/5 backdrop-blur-sm dark:bg-white/10"
            >
              <History className="h-4 w-4 mb-1" />
              <span className="text-xs text-muted-foreground">Streak</span>
              <span className="font-medium">{data.stats.streak.current}d</span>
            </motion.div>
          </div>

          <div className="bg-white dark:bg-black/40 rounded-lg p-4">
            <div className="relative h-5 mb-2">
              {monthLabels.map((label, i) => (
                <div
                  key={i}
                  className="absolute text-xs text-muted-foreground"
                  style={{ left: `${label.position}px` }}
                >
                  {label.month}
                </div>
              ))}
            </div>
            
            <TooltipProvider>
              <div className="flex gap-[3px] overflow-x-auto hide-scrollbar">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[3px]">
                    {week.map((day, dayIndex) => (
                      <Tooltip key={`${weekIndex}-${dayIndex}`}>
                        <TooltipTrigger asChild>
                          <motion.div
                            whileHover={{ scale: 1.5 }}
                            transition={{ duration: 0.2 }}
                            className={`w-[10px] h-[10px] rounded-sm border ${getIntensityClass(day.level)} hover:ring-2 hover:ring-offset-2 hover:ring-offset-background hover:ring-primary`}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                            <p>{day.count} contribution{day.count !== 1 ? 's' : ''}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ))}
              </div>
            </TooltipProvider>

            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-muted-foreground">
                Longest streak: {data.stats.streak.longest} days
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Less</span>
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`w-[10px] h-[10px] rounded-sm border ${getIntensityClass(level)}`}
                  />
                ))}
                <span className="text-xs text-muted-foreground">More</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
        </motion.div>
      </CardContent>
    </Card>
  );
}