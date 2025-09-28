import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { setCandidateInfo } from '@/store/slices/interviewSlice';
import { ResumeParser } from '@/services/resumeParser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResumeUploadProps {
  onComplete: () => void;
}

const ResumeUpload = ({ onComplete }: ResumeUploadProps) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const acceptedFileTypes = '.pdf,.docx';
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = async (file: File) => {
    setError('');
    
    // Validate file type
    const fileExtension = file.name.toLowerCase().split('.').pop();
    if (!['pdf', 'docx'].includes(fileExtension || '')) {
      setError('Please upload a PDF or DOCX file.');
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setError('File size must be less than 10MB.');
      return;
    }

    setUploadedFile(file);
    await processResume(file);
  };

  const processResume = async (file: File) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    
    try {
      // Simulate processing progress
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      let parsedData;
      
      if (file.name.toLowerCase().endsWith('.pdf')) {
        parsedData = await ResumeParser.parsePDF(file);
      } else {
        parsedData = await ResumeParser.parseDOCX(file);
      }

      clearInterval(progressInterval);
      setProcessingProgress(100);

      setExtractedData(parsedData);
      
      // Store in Redux
      dispatch(setCandidateInfo({
        name: parsedData.name,
        email: parsedData.email,
        phone: parsedData.phone,
        resumeText: parsedData.fullText
      }));

      toast({
        title: "Resume uploaded successfully!",
        description: "We've extracted your information from the resume.",
      });

      setTimeout(() => {
        onComplete();
      }, 1500);

    } catch (error) {
      console.error('Resume processing error:', error);
      setError('Failed to process the resume. Please try again or upload a different file.');
      setProcessingProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setExtractedData(null);
    setError('');
    setProcessingProgress(0);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gradient mb-4">Upload Your Resume</h2>
          <p className="text-muted-foreground text-lg">
            Let's start by analyzing your resume to tailor the interview questions
          </p>
        </div>

        <Card className="card-glowing">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Resume Upload</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {!uploadedFile ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  isDragging 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/30'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="space-y-4"
                >
                  <Upload className="w-12 h-12 text-primary mx-auto" />
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Drag and drop your resume here
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      or click to browse files
                    </p>
                    
                    <Button className="btn-hero" onClick={() => document.getElementById('resume-upload')?.click()}>
                      Choose File
                    </Button>
                    
                    <input
                      id="resume-upload"
                      type="file"
                      accept={acceptedFileTypes}
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Accepted formats: PDF, DOCX</p>
                    <p>Maximum size: 10MB</p>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File Info */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  
                  {!isProcessing && !extractedData && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Processing Progress */}
                {isProcessing && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Processing resume...</span>
                      <span className="text-sm text-muted-foreground">{processingProgress}%</span>
                    </div>
                    <Progress value={processingProgress} className="progress-glow" />
                  </div>
                )}

                {/* Extracted Data Preview */}
                {extractedData && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-success/10 border border-success/20 rounded-lg"
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="font-medium text-success">Information Extracted</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Name:</span>
                        <p className="font-medium">
                          {extractedData.name || 'Not found'}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <p className="font-medium">
                          {extractedData.email || 'Not found'}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Phone:</span>
                        <p className="font-medium">
                          {extractedData.phone || 'Not found'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="card-interactive">
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">📝 Tips for better results:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Ensure your resume is in PDF or DOCX format</li>
              <li>• Include your contact information at the top</li>
              <li>• Use a standard resume format for better parsing</li>
              <li>• Make sure the text is readable (not an image)</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResumeUpload;