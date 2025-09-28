import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState } from '@/store/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Award,
  MessageSquare,
  Target,
  TrendingUp
} from 'lucide-react';

interface CandidateDetailViewProps {
  candidateId: string;
}

const CandidateDetailView = ({ candidateId }: CandidateDetailViewProps) => {
  const candidate = useSelector((state: RootState) => 
    state.candidates.candidates.find(c => c.id === candidateId)
  );

  if (!candidate) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Candidate not found</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-success';
    if (score >= 6) return 'text-warning';
    return 'text-destructive';
  };

  const getDifficultyBadgeVariant = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'default';
      case 'medium': return 'secondary';
      case 'hard': return 'destructive';
      default: return 'outline';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const difficultyScores = {
    easy: candidate.questions.filter(q => q.difficulty === 'easy').reduce((sum, q) => sum + (q.score || 0), 0) / 2,
    medium: candidate.questions.filter(q => q.difficulty === 'medium').reduce((sum, q) => sum + (q.score || 0), 0) / 2,
    hard: candidate.questions.filter(q => q.difficulty === 'hard').reduce((sum, q) => sum + (q.score || 0), 0) / 2
  };

  return (
    <ScrollArea className="h-[60vh] pr-4">
      <div className="space-y-6">
        {/* Candidate Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="card-glowing">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {candidate.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <div className="flex-1">
                  <CardTitle className="text-2xl">{candidate.name}</CardTitle>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{candidate.email}</span>
                    </div>
                    {candidate.phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="w-4 h-4" />
                        <span>{candidate.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-4xl font-bold ${getScoreColor(candidate.finalScore)}`}>
                    {candidate.finalScore}
                  </div>
                  <p className="text-sm text-muted-foreground">Final Score</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Interview Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="card-interactive">
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="font-medium">{formatDate(candidate.completedAt)}</p>
            </CardContent>
          </Card>
          
          <Card className="card-interactive">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">{candidate.duration} minutes</p>
            </CardContent>
          </Card>
          
          <Card className="card-interactive">
            <CardContent className="p-4 text-center">
              <Award className="w-6 h-6 text-success mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Questions</p>
              <p className="font-medium">{candidate.questions.length} answered</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="card-interactive">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Performance by Difficulty</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(difficultyScores).map(([difficulty, score]) => (
                  <div key={difficulty} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant={getDifficultyBadgeVariant(difficulty)}
                        className="w-16 justify-center"
                      >
                        {difficulty}
                      </Badge>
                      <div className="flex-1 w-32">
                        <Progress value={score * 10} className="h-2" />
                      </div>
                    </div>
                    <span className={`font-bold ${getScoreColor(score)}`}>
                      {score.toFixed(1)}/10
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Summary */}
        {candidate.aiSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>AI Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">{candidate.aiSummary}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Questions & Answers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="card-interactive">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Interview Questions & Answers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {candidate.questions.map((question, index) => (
                  <div key={question.id}>
                    <div className="space-y-3">
                      {/* Question */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium">Question {index + 1}:</span>
                            <Badge variant={getDifficultyBadgeVariant(question.difficulty)}>
                              {question.difficulty}
                            </Badge>
                          </div>
                          <p className="text-foreground">{question.question}</p>
                        </div>
                        <div className="text-right ml-4">
                          <div className={`text-xl font-bold ${getScoreColor(question.score || 0)}`}>
                            {question.score || 0}/10
                          </div>
                        </div>
                      </div>

                      {/* Answer */}
                      <div className="bg-muted/30 rounded-lg p-4">
                        <p className="font-medium text-sm mb-2">Answer:</p>
                        <p className="text-foreground">
                          {question.answer || 'No answer provided'}
                        </p>
                      </div>

                      {/* AI Analysis */}
                      {question.aiAnalysis && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                          <p className="font-medium text-sm mb-2 text-primary">AI Feedback:</p>
                          <p className="text-sm text-foreground">{question.aiAnalysis}</p>
                        </div>
                      )}
                    </div>
                    
                    {index < candidate.questions.length - 1 && (
                      <Separator className="my-6" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ScrollArea>
  );
};

export default CandidateDetailView;