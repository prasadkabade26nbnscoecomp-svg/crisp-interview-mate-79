import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState } from '@/store/store';
import { setCandidateInfo } from '@/store/slices/interviewSlice';
import { ResumeParser } from '@/services/resumeParser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Mail, 
  Phone, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CandidateInfoFormProps {
  onComplete: () => void;
}

const CandidateInfoForm = ({ onComplete }: CandidateInfoFormProps) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const candidateInfo = useSelector((state: RootState) => state.interview.candidateInfo);
  
  const [formData, setFormData] = useState({
    name: candidateInfo.name || '',
    email: candidateInfo.email || '',
    phone: candidateInfo.phone || ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get missing fields based on extracted resume data
  const missingFields = ResumeParser.getMissingFields({
    name: candidateInfo.name,
    email: candidateInfo.email,
    phone: candidateInfo.phone,
    fullText: candidateInfo.resumeText || ''
  });

  useEffect(() => {
    // Update form data when Redux state changes
    setFormData({
      name: candidateInfo.name || '',
      email: candidateInfo.email || '',
      phone: candidateInfo.phone || ''
    });
  }, [candidateInfo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Update Redux state with complete candidate info
      dispatch(setCandidateInfo({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim()
      }));

      toast({
        title: "Information saved successfully!",
        description: "Let's start your interview.",
      });

      setTimeout(() => {
        onComplete();
      }, 1000);

    } catch (error) {
      console.error('Error saving candidate info:', error);
      toast({
        title: "Error",
        description: "Failed to save information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldIcon = (fieldName: string) => {
    switch (fieldName) {
      case 'name': return <User className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      default: return null;
    }
  };

  const getFieldStatus = (fieldName: string, value: string) => {
    if (value && !errors[fieldName]) {
      return <CheckCircle className="w-4 h-4 text-success" />;
    }
    if (errors[fieldName]) {
      return <AlertCircle className="w-4 h-4 text-destructive" />;
    }
    return null;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gradient mb-4">Complete Your Information</h2>
          <p className="text-muted-foreground text-lg">
            {missingFields.length > 0 
              ? `We need a few more details before starting your interview`
              : 'Please verify your information before proceeding'
            }
          </p>
        </div>

        {missingFields.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              We couldn't extract some information from your resume. Please fill in the missing fields below.
            </AlertDescription>
          </Alert>
        )}

        <Card className="card-glowing">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Candidate Information</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center space-x-2">
                  {getFieldIcon('name')}
                  <span>Full Name *</span>
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`pr-10 ${errors.name ? 'border-destructive' : ''}`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getFieldStatus('name', formData.name)}
                  </div>
                </div>
                {errors.name && (
                  <p className="text-destructive text-sm">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  {getFieldIcon('email')}
                  <span>Email Address *</span>
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pr-10 ${errors.email ? 'border-destructive' : ''}`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getFieldStatus('email', formData.email)}
                  </div>
                </div>
                {errors.email && (
                  <p className="text-destructive text-sm">{errors.email}</p>
                )}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center space-x-2">
                  {getFieldIcon('phone')}
                  <span>Phone Number *</span>
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`pr-10 ${errors.phone ? 'border-destructive' : ''}`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getFieldStatus('phone', formData.phone)}
                  </div>
                </div>
                {errors.phone && (
                  <p className="text-destructive text-sm">{errors.phone}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full btn-hero text-lg py-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <motion.div
                      className="w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : null}
                  {isSubmitting ? 'Saving Information...' : 'Start Interview'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Information Note */}
        <Card className="card-interactive">
          <CardContent className="p-4">
            <h4 className="font-medium mb-2 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>Privacy & Security</span>
            </h4>
            <p className="text-sm text-muted-foreground">
              Your information is stored locally and will only be used for this interview session. 
              We respect your privacy and don't share your data with third parties.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CandidateInfoForm;