import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CandidateRecord } from '@/store/slices/candidatesSlice';
import { 
  Users, 
  Award, 
  TrendingUp, 
  Clock 
} from 'lucide-react';

interface StatsCardsProps {
  candidates: CandidateRecord[];
}

const StatsCards = ({ candidates }: StatsCardsProps) => {
  // Calculate statistics
  const totalCandidates = candidates.length;
  const averageScore = totalCandidates > 0 
    ? candidates.reduce((sum, c) => sum + c.finalScore, 0) / totalCandidates 
    : 0;
  
  const excellentCandidates = candidates.filter(c => c.finalScore >= 8).length;
  const averageDuration = totalCandidates > 0
    ? candidates.reduce((sum, c) => sum + c.duration, 0) / totalCandidates
    : 0;

  const stats = [
    {
      title: 'Total Candidates',
      value: totalCandidates,
      icon: Users,
      color: 'text-primary',
      bgColor: 'from-primary/20 to-primary/10'
    },
    {
      title: 'Average Score',
      value: averageScore.toFixed(1),
      suffix: '/10',
      icon: Award,
      color: 'text-success',
      bgColor: 'from-success/20 to-success/10'
    },
    {
      title: 'Excellent Performers',
      value: excellentCandidates,
      suffix: ` (${totalCandidates > 0 ? Math.round((excellentCandidates / totalCandidates) * 100) : 0}%)`,
      icon: TrendingUp,
      color: 'text-accent',
      bgColor: 'from-accent/20 to-accent/10'
    },
    {
      title: 'Avg Duration',
      value: Math.round(averageDuration),
      suffix: ' min',
      icon: Clock,
      color: 'text-warning',
      bgColor: 'from-warning/20 to-warning/10'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className="card-interactive">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full bg-gradient-to-r ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-1">
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  {stat.suffix && (
                    <span className="text-sm text-muted-foreground">
                      {stat.suffix}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default StatsCards;