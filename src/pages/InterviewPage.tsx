import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Camera, Mic, Upload, MessageCircle } from 'lucide-react';

// Interview Components
import ResumeUpload from '@/components/interview/ResumeUpload';
import CandidateInfoForm from '@/components/interview/CandidateInfoForm';
import ImprovedInterviewChat from '@/components/interview/ImprovedInterviewChat';
import InterviewComplete from '@/components/interview/InterviewComplete';

const InterviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const interview = useSelector((state: RootState) => state.interview);
  const [currentStep, setCurrentStep] = useState<'upload' | 'info' | 'interview' | 'complete'>('upload');
  const [mediaPermissions, setMediaPermissions] = useState({
    camera: false,
    microphone: false
  });

  const interviewType = location.state?.interviewType || 'fullstack';

  useEffect(() => {
    // Request camera and microphone permissions
    requestMediaPermissions();
  }, []);

  useEffect(() => {
    // Determine current step based on interview state
    if (interview.isCompleted) {
      setCurrentStep('complete');
    } else if (interview.isActive) {
      setCurrentStep('interview');
    } else if (interview.candidateInfo.name && interview.candidateInfo.email && interview.candidateInfo.phone) {
      setCurrentStep('interview');
    } else if (interview.candidateInfo.resumeText) {
      setCurrentStep('info');
    } else {
      setCurrentStep('upload');
    }
  }, [interview]);

  const requestMediaPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setMediaPermissions({
        camera: true,
        microphone: true
      });
      
      // Stop the stream immediately, we just needed to check permissions
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Media permissions denied:', error);
    }
  };

  const steps = [
    { id: 'upload', title: 'Upload Resume', icon: Upload },
    { id: 'info', title: 'Candidate Info', icon: MessageCircle },
    { id: 'interview', title: 'Interview', icon: Camera },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = currentStep === 'complete' ? 100 : ((currentStepIndex + 1) / steps.length) * 100;

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
                  AI Interview - {interviewType.charAt(0).toUpperCase() + interviewType.slice(1)} Developer
                </h1>
                <p className="text-sm text-muted-foreground">
                  {interview.candidateInfo.name || 'Interview Session'}
                </p>
              </div>
            </div>

            {/* Media Status */}
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
                mediaPermissions.camera ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
              }`}>
                <Camera className="w-3 h-3" />
                <span className="text-xs">Camera</span>
              </div>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
                mediaPermissions.microphone ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
              }`}>
                <Mic className="w-3 h-3" />
                <span className="text-xs">Mic</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {currentStep !== 'complete' && (
            <div className="mt-4">
              <div className="flex justify-between mb-2">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = index === currentStepIndex;
                  const isCompleted = index < currentStepIndex;
                  
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center space-x-2 ${
                        isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted-foreground'
                      }`}
                    >
                      <StepIcon className="w-4 h-4" />
                      <span className="text-sm font-medium hidden sm:block">{step.title}</span>
                    </div>
                  );
                })}
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {currentStep === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ResumeUpload onComplete={() => setCurrentStep('info')} />
            </motion.div>
          )}

          {currentStep === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CandidateInfoForm onComplete={() => setCurrentStep('interview')} />
            </motion.div>
          )}

          {currentStep === 'interview' && (
            <motion.div
              key="interview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ImprovedInterviewChat 
                interviewType={interviewType}
                onComplete={() => setCurrentStep('complete')}
              />
            </motion.div>
          )}

          {currentStep === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <InterviewComplete />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InterviewPage;