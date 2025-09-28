import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Phone, 
  Trophy, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  User,
  Mail,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UserResultsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const candidates = useSelector((state: RootState) => state.candidates.candidates);
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [userCandidate, setUserCandidate] = useState<any>(null);

  const handleVerifyPhone = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number to view results.",
        variant: "destructive"
      });
      return;
    }

    // Find candidate by phone number
    const candidate = candidates.find(c => c.phone === phoneNumber.trim());
    
    if (candidate) {
      setUserCandidate(candidate);
      setIsVerified(true);
      toast({
        title: "Verification Successful",
        description: "Your interview results have been loaded.",
      });
    } else {
      toast({
        title: "No Results Found",
        description: "No interview results found for this phone number.",
        variant: "destructive"
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: 'default' as const, label: 'Excellent' };
    if (score >= 60) return { variant: 'secondary' as const, label: 'Good' };
    return { variant: 'destructive' as const, label: 'Needs Improvement' };
  };

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-xl font-semibold text-gradient">
                View Interview Results
              </h1>
            </div>
          </div>
        </div>

        {/* Verification Form */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Verify Your Identity</h2>
              <p className="text-muted-foreground">
                Enter the phone number you used during your interview to view your results.
              </p>
            </motion.div>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Phone Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleVerifyPhone()}
                  />
                </div>
                
                <Button 
                  className="w-full btn-hero"
                  onClick={handleVerifyPhone}
                >
                  View My Results
                  <Trophy className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gradient">
                  Interview Results
                </h1>
                <p className="text-sm text-muted-foreground">
                  {userCandidate?.name}'s Performance Report
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => {
                setIsVerified(false);
                setUserCandidate(null);
                setPhoneNumber('');
              }}
            >
              Check Another Result
            </Button>
          </div>
        </div>
      </div>

      {/* Results Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Score Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span>Overall Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(userCandidate.finalScore)}`}>
                      {userCandidate.finalScore}%
                    </div>
                    <p className="text-muted-foreground">Final Score</p>
                    <Badge 
                      variant={getScoreBadge(userCandidate.finalScore).variant} 
                      className="mt-2"
                    >
                      {getScoreBadge(userCandidate.finalScore).label}
                    </Badge>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {userCandidate.answers?.length || 0}/6
                    </div>
                    <p className="text-muted-foreground">Questions Answered</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
                      {userCandidate.interviewType || 'Full Stack'}
                    </div>
                    <p className="text-muted-foreground">Interview Type</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Candidate Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-primary" />
                  <span>Candidate Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{userCandidate.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{userCandidate.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{userCandidate.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Interview Date</p>
                      <p className="font-medium">
                        {new Date(userCandidate.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Questions & Answers */}
          {userCandidate.answers && userCandidate.answers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span>Question & Answer Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {userCandidate.answers.map((answer: any, index: number) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline">Question {index + 1}</Badge>
                            <Badge variant={answer.difficulty === 'easy' ? 'default' : answer.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                              {answer.difficulty}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-foreground mb-2">
                            {answer.question}
                          </h4>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getScoreColor(answer.score || 0)}`}>
                            {answer.score || 0}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Your Answer:</p>
                        <p className="text-foreground">{answer.answer || 'No answer provided'}</p>
                      </div>
                      
                      {answer.feedback && (
                        <div className="bg-accent/10 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground mb-1">AI Feedback:</p>
                          <p className="text-foreground text-sm">{answer.feedback}</p>
                        </div>
                      )}
                      
                      {index < userCandidate.answers.length - 1 && <Separator />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* AI Summary */}
          {userCandidate.summary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-primary" />
                    <span>AI Summary & Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-foreground leading-relaxed">{userCandidate.summary}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              onClick={() => navigate('/')}
              className="btn-hero"
            >
              Take Another Interview
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.print()}
            >
              Print Results
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserResultsPage;