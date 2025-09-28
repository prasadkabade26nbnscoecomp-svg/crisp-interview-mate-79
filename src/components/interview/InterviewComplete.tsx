import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  CheckCircle, 
  Clock, 
  Target, 
  TrendingUp, 
  Home, 
  BarChart3,
  Star,
  Trophy
} from 'lucide-react';

const InterviewComplete = () => {
  const navigate = useNavigate();
  const interview = useSelector((state: RootState) => state.interview);

  if (!interview.isCompleted) {
    return null;
  }

  const finalScore = interview.finalScore || 0;
  const totalQuestions = interview.questions.length;
  const answeredQuestions = interview.questions.filter(q => q.answer).length;
  
  // Calculate performance metrics
  const averageTime = interview.questions.reduce((sum, q) => {
    const timeUsed = q.timeLimit - (q.answer ? 0 : q.timeLimit);
    return sum + timeUsed;
  }, 0) / totalQuestions;

  const difficultyScores = {
    easy: interview.questions.filter(q => q.difficulty === 'easy').reduce((sum, q) => sum + (q.score || 0), 0) / 2,
    medium: interview.questions.filter(q => q.difficulty === 'medium').reduce((sum, q) => sum + (q.score || 0), 0) / 2,
    hard: interview.questions.filter(q => q.difficulty === 'hard').reduce((sum, q) => sum + (q.score || 0), 0) / 2
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-success';
    if (score >= 6) return 'text-warning';
    return 'text-destructive';
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 8) return { level: 'Excellent', icon: Trophy, color: 'text-success' };
    if (score >= 6) return { level: 'Good', icon: Award, color: 'text-warning' };
    return { level: 'Needs Improvement', icon: Target, color: 'text-destructive' };
  };

  const performance = getPerformanceLevel(finalScore);
  const PerformanceIcon = performance.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Celebration Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="text-center"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            className={`p-6 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 ${performance.color}`}
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <PerformanceIcon className="w-16 h-16" />
          </motion.div>
        </div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-bold text-gradient mb-4"
        >
          Interview Complete! 🎉
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-muted-foreground"
        >
          Thank you {interview.candidateInfo.name}, here are your results
        </motion.p>
      </motion.div>

      {/* Overall Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="card-glowing text-center">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-center space-x-2">
              <Star className="w-6 h-6 text-warning" />
              <span>Final Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                className={`text-8xl font-bold ${getScoreColor(finalScore)}`}
              >
                {finalScore}
                <span className="text-3xl text-muted-foreground">/10</span>
              </motion.div>
              
              <Badge 
                variant={finalScore >= 8 ? 'default' : finalScore >= 6 ? 'secondary' : 'destructive'}
                className="text-lg px-6 py-2"
              >
                {performance.level}
              </Badge>
              
              <div className="max-w-md mx-auto">
                <Progress 
                  value={finalScore * 10} 
                  className="h-4 progress-glow" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Questions Completed */}
        <Card className="card-interactive text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span>Completion</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success mb-2">
              {answeredQuestions}/{totalQuestions}
            </div>
            <p className="text-sm text-muted-foreground">Questions Answered</p>
          </CardContent>
        </Card>

        {/* Average Response Time */}
        <Card className="card-interactive text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center space-x-2">
              <Clock className="w-5 h-5 text-accent" />
              <span>Response Time</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent mb-2">
              {Math.round(averageTime)}s
            </div>
            <p className="text-sm text-muted-foreground">Average per Question</p>
          </CardContent>
        </Card>

        {/* Performance Trend */}
        <Card className="card-interactive text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>Consistency</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">
              {Math.round(((finalScore / 10) * 100))}%
            </div>
            <p className="text-sm text-muted-foreground">Overall Performance</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Difficulty Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="card-interactive">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Performance by Difficulty</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(difficultyScores).map(([difficulty, score], index) => (
                <motion.div
                  key={difficulty}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant={difficulty === 'easy' ? 'default' : difficulty === 'medium' ? 'secondary' : 'destructive'}
                      className="w-16 justify-center"
                    >
                      {difficulty}
                    </Badge>
                    <div className="flex-1">
                      <Progress value={score * 5} className="h-2" />
                    </div>
                  </div>
                  <span className={`font-bold ${getScoreColor(score)}`}>
                    {score.toFixed(1)}/10
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Summary */}
      {interview.aiSummary && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="card-interactive">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>AI Analysis & Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground leading-relaxed">
                  {interview.aiSummary}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Button
          onClick={() => navigate('/')}
          className="btn-hero text-lg px-8 py-6"
          size="lg"
        >
          <Home className="w-5 h-5 mr-2" />
          Back to Home
        </Button>
        
        <Button
          onClick={() => navigate('/dashboard')}
          variant="outline"
          size="lg"
          className="text-lg px-8 py-6"
        >
          <BarChart3 className="w-5 h-5 mr-2" />
          View Dashboard
        </Button>
      </motion.div>

      {/* Thank You Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="text-center py-8"
      >
        <p className="text-muted-foreground">
          Thank you for using AI Interview Assistant. We hope this experience helps you improve your interview skills!
        </p>
      </motion.div>
    </div>
  );
};

export default InterviewComplete;