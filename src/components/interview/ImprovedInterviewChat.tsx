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
import { Clock, Send, Mic, MicOff, Camera, CameraOff, BrainCircuit, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, MessageCircle, CirclePlay as PlayCircle, CircleStop as StopCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InterviewChatProps {
  interviewType: string;
  onComplete: () => void;
}

const ImprovedInterviewChat = ({ interviewType, onComplete }: InterviewChatProps) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const interview = useSelector((state: RootState) => state.interview);
  
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showAnswerInput, setShowAnswerInput] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [questionReadTime, setQuestionReadTime] = useState(0);
  const [mediaDevices, setMediaDevices] = useState({
    camera: false,
    microphone: false
  });
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Start timer when question changes
  useEffect(() => {
    if (interview.isActive && !interview.isPaused && interview.timeRemaining > 0 && showAnswerInput) {
      timerRef.current = setInterval(() => {
        dispatch(setTimeRemaining(interview.timeRemaining - 1));
        
        if (interview.timeRemaining <= 1) {
          handleTimeUp();
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [interview.timeRemaining, interview.isActive, interview.isPaused, showAnswerInput]);

  useEffect(() => {
    // Initialize interview if not already started
    if (!interview.isActive && interview.questions.length === 0) {
      initializeInterview();
    } else if (interview.isActive && interview.questions.length > 0) {
      // Show current question with read time
      showCurrentQuestion();
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages appear
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [interview.currentQuestionIndex]);

  // Clean up media stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const showCurrentQuestion = () => {
    setShowQuestion(true);
    setShowAnswerInput(false);
    
    // Give user time to read the question based on difficulty
    const currentQuestion = interview.questions[interview.currentQuestionIndex];
    let readTime = 10; // Default 10 seconds
    
    if (currentQuestion) {
      switch (currentQuestion.difficulty) {
        case 'easy':
          readTime = 8;
          break;
        case 'medium':
          readTime = 15;
          break;
        case 'hard':
          readTime = 20;
          break;
      }
    }
    
    setQuestionReadTime(readTime);
    
    // Start countdown for reading time
    const readTimer = setInterval(() => {
      setQuestionReadTime(prev => {
        if (prev <= 1) {
          clearInterval(readTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const initializeInterview = async () => {
    setIsGeneratingQuestions(true);
    
    try {
      const questions = await GeminiService.generateInterviewQuestions(
        interview.candidateInfo.resumeText || 'Full Stack Developer position'
      );
      
      dispatch(setQuestions(questions));
      
      const sessionId = `interview_${Date.now()}`;
      dispatch(startInterview(sessionId));
      
      toast({
        title: "Interview Started!",
        description: "Take your time to read each question before answering.",
      });
      
      // Show first question after a brief delay
      setTimeout(() => {
        showCurrentQuestion();
      }, 1000);
      
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

  const startAnswering = async () => {
    try {
      // Request media permissions
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setStream(mediaStream);
      setIsRecording(true);
      setShowAnswerInput(true);
      
      // Show video preview
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setMediaDevices({
        camera: true,
        microphone: true
      });
      
      toast({
        title: "Recording Started",
        description: "Camera and microphone are now active. Start typing your answer.",
      });
      
    } catch (error) {
      console.error('Media permission denied:', error);
      toast({
        title: "Media Permission Required",
        description: "Please allow camera and microphone access to continue.",
        variant: "destructive"
      });
    }
  };

  const stopAnswering = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsRecording(false);
    setMediaDevices({ camera: false, microphone: false });
    
    toast({
      title: "Recording Stopped",
      description: "Camera and microphone have been disabled.",
    });
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast({
        title: "Answer Required",
        description: "Please provide an answer before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    stopAnswering(); // Stop recording when submitting
    setShowAnswerInput(false);
    
    try {
      const currentQuestion = interview.questions[interview.currentQuestionIndex];
      
      const evaluation = await GeminiService.evaluateAnswer(
        currentQuestion.question,
        currentAnswer.trim()
      );

      dispatch(submitAnswer({
        answer: currentAnswer.trim(),
        score: evaluation.score,
        aiAnalysis: evaluation.analysis
      }));
      
      setCurrentAnswer('');
      
      if (interview.currentQuestionIndex < interview.questions.length - 1) {
        dispatch(nextQuestion());
        // Show next question
        setTimeout(() => {
          showCurrentQuestion();
        }, 1000);
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
    
    stopAnswering(); // Stop recording when time is up
    setShowAnswerInput(false);
    
    try {
      dispatch(submitAnswer({
        answer: answerText,
        score: currentAnswer.trim() ? 3 : 0,
        aiAnalysis: 'Time limit exceeded. ' + (currentAnswer.trim() ? 'Partial answer submitted.' : 'No answer provided.')
      }));
      
      setCurrentAnswer('');
      
      if (interview.currentQuestionIndex < interview.questions.length - 1) {
        dispatch(nextQuestion());
        // Show next question
        setTimeout(() => {
          showCurrentQuestion();
        }, 1000);
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
      const finalResult = await GeminiService.generateFinalSummary(
        interview.questions,
        interview.candidateInfo.name || 'Candidate'
      );
      
      dispatch(completeInterview({
        finalScore: finalResult.score,
        aiSummary: finalResult.summary
      }));
      
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
        description: `Final score: ${finalResult.score}%`,
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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyBadgeVariant = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'default' as const;
      case 'medium': return 'secondary' as const;
      case 'hard': return 'destructive' as const;
      default: return 'outline' as const;
    }
  };

  const currentQuestion = interview.questions[interview.currentQuestionIndex];
  const progress = ((interview.currentQuestionIndex + 1) / interview.questions.length) * 100;

  if (isGeneratingQuestions) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <h3 className="text-xl font-semibold">Generating Interview Questions</h3>
          <p className="text-muted-foreground">
            Our AI is analyzing your resume to create personalized questions...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[70vh] flex flex-col">
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
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">Question {index + 1}</Badge>
                        <Badge variant={getDifficultyBadgeVariant(q.difficulty)}>
                          {q.difficulty}
                        </Badge>
                      </div>
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
                    className={`chat-bubble-ai p-4 ${!showQuestion ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline">
                        Question {interview.currentQuestionIndex + 1}
                      </Badge>
                      <Badge variant={getDifficultyBadgeVariant(currentQuestion.difficulty)}>
                        {currentQuestion.difficulty}
                      </Badge>
                    </div>
                    <p className="mb-3">{currentQuestion.question}</p>
                    <div className="text-sm opacity-70">
                      Time limit: {formatTime(currentQuestion.timeLimit)}
                      {questionReadTime > 0 && (
                        <span className="ml-4 text-primary font-medium">
                          Read time: {questionReadTime}s
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Answer Controls */}
              <div className="space-y-3 border-t pt-4">
                {questionReadTime > 0 ? (
                  <div className="text-center">
                    <div className="mb-4">
                      <div className="text-lg font-semibold text-primary mb-2">
                        Take your time to read the question
                      </div>
                      <div className="text-3xl font-bold text-accent">
                        {questionReadTime}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        seconds remaining to review
                      </p>
                    </div>
                    <Progress 
                      value={((interview.questions[interview.currentQuestionIndex]?.difficulty === 'easy' ? 8 : 
                               interview.questions[interview.currentQuestionIndex]?.difficulty === 'medium' ? 15 : 20) - questionReadTime) / 
                             (interview.questions[interview.currentQuestionIndex]?.difficulty === 'easy' ? 8 : 
                              interview.questions[interview.currentQuestionIndex]?.difficulty === 'medium' ? 15 : 20) * 100} 
                      className="progress-glow" 
                    />
                  </div>
                ) : !showAnswerInput ? (
                  <div className="text-center">
                    <Button
                      onClick={startAnswering}
                      className="btn-hero text-lg px-8 py-4"
                      disabled={isLoading || !currentQuestion}
                    >
                      <PlayCircle className="w-5 h-5 mr-2" />
                      Ready to Answer
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Click when you're ready to start answering
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <Textarea
                        placeholder="Type your answer here..."
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        className="min-h-32 resize-none"
                        disabled={isLoading || interview.timeRemaining === 0}
                      />
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-muted-foreground">
                            {currentAnswer.length} characters
                          </span>
                          
                          {isRecording && (
                            <div className="flex items-center space-x-2 text-sm text-success">
                              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                              <span>Recording active</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={stopAnswering}
                            variant="outline"
                            size="sm"
                          >
                            <StopCircle className="w-4 h-4 mr-2" />
                            Stop Recording
                          </Button>
                          
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
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Video Preview */}
          {isRecording && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Camera Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-32 bg-muted rounded-lg object-cover"
                />
              </CardContent>
            </Card>
          )}

          {/* Media Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Media Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Camera</span>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
                  mediaDevices.camera ? 'bg-success/20 text-success' : 'bg-muted'
                }`}>
                  {mediaDevices.camera ? <Camera className="w-3 h-3" /> : <CameraOff className="w-3 h-3" />}
                  <span className="text-xs">
                    {mediaDevices.camera ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Microphone</span>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
                  mediaDevices.microphone ? 'bg-success/20 text-success' : 'bg-muted'
                }`}>
                  {mediaDevices.microphone ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                  <span className="text-xs">
                    {mediaDevices.microphone ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Progress</CardTitle>
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

export default ImprovedInterviewChat;