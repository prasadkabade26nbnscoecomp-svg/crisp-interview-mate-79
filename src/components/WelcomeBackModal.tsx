import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '@/store/store';
import { resumeInterview } from '@/store/slices/interviewSlice';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlayCircle, RotateCcw } from 'lucide-react';

const WelcomeBackModal = () => {
  const dispatch = useDispatch();
  const interview = useSelector((state: RootState) => state.interview);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if there's an active but paused interview session
    if (interview.sessionId && interview.isActive && interview.isPaused && !interview.isCompleted) {
      setShowModal(true);
    }
  }, [interview]);

  const handleContinue = () => {
    dispatch(resumeInterview());
    setShowModal(false);
  };

  const handleStartNew = () => {
    // This would reset the interview state
    setShowModal(false);
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="card-glowing max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gradient text-center text-2xl">
            Welcome Back! 👋
          </DialogTitle>
        </DialogHeader>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <p className="text-foreground">
            You have an unfinished interview session for{' '}
            <span className="font-semibold text-primary">
              {interview.candidateInfo.name || 'Unknown Candidate'}
            </span>
          </p>
          
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Question:</span>{' '}
              <span className="text-foreground font-medium">
                {interview.currentQuestionIndex + 1} of {interview.questions.length}
              </span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Time remaining:</span>{' '}
              <span className="text-accent font-medium">
                {Math.floor(interview.timeRemaining / 60)}:
                {(interview.timeRemaining % 60).toString().padStart(2, '0')}
              </span>
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleContinue}
              className="btn-hero flex-1"
              size="lg"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Continue Interview
            </Button>
            
            <Button
              onClick={handleStartNew}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Start New
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeBackModal;