import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '@/store/store';
import { 
  setQuestions, 
  startInterview, 
  setTimeRemaining, 
  submitAnswer, 
  nextQuestion, 
  completeInterview 
} from '@/store/slices/interviewSlice';
import { addCandidate } from '@/store/slices/candidatesSlice';
import { GeminiService } from '@/services/geminiService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Send, 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff,
  BrainCircuit,
  CheckCircle,
  AlertTriangle,
  MessageCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InterviewChatProps {
  interviewType: string;
  onComplete: () => void;
}

const InterviewChat = ({ interviewType, onComplete }: InterviewChatProps) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const interview = useSelector((state: RootState) => state.interview);
  
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [mediaDevices, setMediaDevices] = useState({
    camera: false,
    microphone: false
  });
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize interview if not already started
    if (!interview.isActive && interview.questions.length === 0) {
      initializeInterview();
    }
  }, []);

  useEffect(() => {
    // Start timer when interview is active and not paused
    if (interview.isActive && !interview.isPaused && interview.timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        dispatch(setTimeRemaining(Math.max(0, interview.timeRemaining - 1)));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    // Auto-submit when time runs out
    if (interview.timeRemaining === 0 && interview.isActive && !interview.isPaused) {
      handleTimeUp();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [interview.timeRemaining, interview.isActive, interview.isPaused]);

  useEffect(() => {
    // Scroll to bottom when new messages appear
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [interview.currentQuestionIndex]);

  const initializeInterview = async () => {
    setIsGeneratingQuestions(true);
    
    try {
      // Generate questions using Gemini
      const questions = await GeminiService.generateInterviewQuestions(
        interview.candidateInfo.resumeText || 'Full Stack Developer position'
      );
      
      dispatch(setQuestions(questions));
      
      // Start the interview
      const sessionId = `interview_${Date.now()}`;
      dispatch(startInterview(sessionId));
      
      toast({
        title: "Interview Started!",
        description: "Good luck! Answer each question within the time limit.",
      });
      
    } catch (error) {
      console.error('Failed to generate questions:', error);
      toast({
        title: "Error",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast({
        title: "Please provide an answer",
        description: "You need to answer the question before proceeding.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const currentQuestion = interview.questions[interview.currentQuestionIndex];
      
      // Evaluate answer using Gemini
      const evaluation = await GeminiService.evaluateAnswer(
        currentQuestion.question,
        currentAnswer.trim()
      );
      
      // Submit answer with evaluation
      dispatch(submitAnswer({
        answer: currentAnswer.trim(),
        score: evaluation.score,
        aiAnalysis: evaluation.analysis
      }));
      
      // Clear current answer
      setCurrentAnswer('');
      
      // Move to next question or complete interview
      if (interview.currentQuestionIndex < interview.questions.length - 1) {
        dispatch(nextQuestion());
        toast({
          title: "Answer submitted!",
          description: `Score: ${evaluation.score}/10. Moving to next question.`,
        });
      } else {
        await completeInterviewProcess();
      }
      
    } catch (error) {
      console.error('Failed to submit answer:', error);
      toast({
        title: "Error",
        description: "Failed to submit answer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeUp = async () => {
    const answerText = currentAnswer.trim() || 'No answer provided due to time limit.';
    
    try {
      const currentQuestion = interview.questions[interview.currentQuestionIndex];
      
      // Submit with time-up penalty
      dispatch(submitAnswer({
        answer: answerText,
        score: currentAnswer.trim() ? 3 : 0, // Partial credit if something was written
        aiAnalysis: 'Time limit exceeded. ' + (currentAnswer.trim() ? 'Partial answer submitted.' : 'No answer provided.')
      }));
      
      setCurrentAnswer('');
      
      if (interview.currentQuestionIndex < interview.questions.length - 1) {
        dispatch(nextQuestion());
        toast({
          title: "Time's up!",
          description: "Moving to the next question.",
          variant: "destructive"
        });
      } else {
        await completeInterviewProcess();
      }
      
    } catch (error) {
      console.error('Failed to handle time up:', error);
    }
  };

  const completeInterviewProcess = async () => {
    try {
      // Generate final summary
      const finalResult = await GeminiService.generateFinalSummary(
        interview.questions,
        interview.candidateInfo.name || 'Candidate'
      );
      
      // Complete interview in Redux
      dispatch(completeInterview({
        finalScore: finalResult.score,
        aiSummary: finalResult.summary
      }));
      
      // Add candidate to candidates list
      const candidateRecord = {
        id: `candidate_${Date.now()}`,
        name: interview.candidateInfo.name || 'Unknown',
        email: interview.candidateInfo.email || '',
        phone: interview.candidateInfo.phone,
        resumeText: interview.candidateInfo.resumeText,
        questions: interview.questions,
        finalScore: finalResult.score,
        aiSummary: finalResult.summary,
        completedAt: Date.now(),
        duration: Math.round((Date.now() - (interview.startTime || Date.now())) / 60000)
      };
      
      dispatch(addCandidate(candidateRecord));
      
      toast({
        title: "Interview Complete!",
        description: `Final score: ${finalResult.score}/10`,
      });
      
      setTimeout(() => {
        onComplete();
      }, 2000);
      
    } catch (error) {
      console.error('Failed to complete interview:', error);
      toast({
        title: "Error",
        description: "Failed to complete interview. Please try again.",
        variant: "destructive"
      });
    }
  };

  const currentQuestion = interview.questions[interview.currentQuestionIndex];
  const progress = ((interview.currentQuestionIndex + 1) / interview.questions.length) * 100;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-success';
      case 'medium': return 'text-warning';
      case 'hard': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getDifficultyBadgeVariant = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'default';
      case 'medium': return 'secondary';
      case 'hard': return 'destructive';
      default: return 'outline';
    }
  };

  if (isGeneratingQuestions) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full mx-auto animate-spin" />
          <h2 className="text-2xl font-bold text-gradient">Generating Your Interview Questions</h2>
          <p className="text-muted-foreground">
            Our AI is analyzing your resume to create personalized questions...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Interview Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="card-glowing">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <BrainCircuit className="w-6 h-6 text-primary" />
                  <CardTitle className="text-xl">
                    Question {interview.currentQuestionIndex + 1} of {interview.questions.length}
                  </CardTitle>
                </div>
                
                {currentQuestion && (
                  <Badge variant={getDifficultyBadgeVariant(currentQuestion.difficulty)}>
                    {currentQuestion.difficulty}
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 ${
                  interview.timeRemaining <= 10 ? 'text-destructive' : 'text-foreground'
                }`}>
                  <Clock className="w-4 h-4" />
                  <span className="font-mono text-lg font-bold">
                    {formatTime(interview.timeRemaining)}
                  </span>
                </div>
              </div>
            </div>
            
            <Progress value={progress} className="progress-glow" />
          </CardHeader>
        </Card>
      </motion.div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Messages */}
        <div className="lg:col-span-2">
          <Card className="h-[60vh] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Interview Chat</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto space-y-4 mb-4"
              >
                {/* Previous Questions & Answers */}
                {interview.questions.slice(0, interview.currentQuestionIndex).map((q, index) => (
                  <div key={q.id} className="space-y-3">
                    <div className="chat-bubble-ai p-4">
                      <p className="font-medium mb-2">Question {index + 1}:</p>
                      <p>{q.question}</p>
                    </div>
                    
                    <div className="chat-bubble-user p-4">
                      <p>{q.answer || 'No answer provided'}</p>
                      {q.score !== undefined && (
                        <div className="mt-2 text-sm opacity-80">
                          Score: {q.score}/10
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Current Question */}
                {currentQuestion && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="chat-bubble-ai p-4"
                  >
                    <p className="font-medium mb-2">
                      Question {interview.currentQuestionIndex + 1}:
                    </p>
                    <p>{currentQuestion.question}</p>
                    <div className="mt-2 text-sm opacity-70">
                      Time limit: {formatTime(currentQuestion.timeLimit)}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Answer Input */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Type your answer here..."
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  className="min-h-24 resize-none"
                  disabled={isLoading || interview.timeRemaining === 0}
                />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {currentAnswer.length} characters
                  </span>
                  
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!currentAnswer.trim() || isLoading}
                    className="btn-hero"
                  >
                    {isLoading ? (
                      <motion.div
                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    {isLoading ? 'Submitting...' : 'Submit Answer'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interview Status Panel */}
        <div className="space-y-4">
          {/* Candidate Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Candidate Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Name:</span>
                <p className="font-medium">{interview.candidateInfo.name}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Email:</span>
                <p className="font-medium">{interview.candidateInfo.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Media Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Media Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Camera</span>
                <Button variant="outline" size="icon">
                  {mediaDevices.camera ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Microphone</span>
                <Button variant="outline" size="icon">
                  {mediaDevices.microphone ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Question Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {interview.questions.map((q, index) => (
                  <div key={q.id} className="flex items-center justify-between">
                    <span className="text-sm">Q{index + 1}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {q.difficulty}
                      </Badge>
                      {index < interview.currentQuestionIndex ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : index === interview.currentQuestionIndex ? (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <div className="w-4 h-4 border border-muted-foreground rounded-full" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InterviewChat;