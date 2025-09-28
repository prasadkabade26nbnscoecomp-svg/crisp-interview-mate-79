import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BrainCircuit, 
  Clock, 
  Users, 
  Award, 
  ArrowRight, 
  Sparkles,
  Code2,
  Database,
  Globe
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  
  const interviewSections = [
    {
      id: 'fullstack',
      title: 'Full Stack Developer',
      description: 'React, Node.js, and database technologies',
      icon: <Code2 className="w-6 h-6" />,
      difficulty: 'Intermediate',
      duration: '15 mins',
      questions: 6,
      color: 'from-primary to-accent'
    },
    {
      id: 'frontend',
      title: 'Frontend Developer',
      description: 'React, TypeScript, and modern CSS',
      icon: <Globe className="w-6 h-6" />,
      difficulty: 'Beginner',
      duration: '12 mins',
      questions: 6,
      color: 'from-accent to-success'
    },
    {
      id: 'backend',
      title: 'Backend Developer',
      description: 'Node.js, APIs, and database design',
      icon: <Database className="w-6 h-6" />,
      difficulty: 'Advanced',
      duration: '18 mins',
      questions: 6,
      color: 'from-success to-warning'
    }
  ];

  const features = [
    {
      icon: <BrainCircuit className="w-8 h-8 text-primary" />,
      title: 'AI-Powered Questions',
      description: 'Dynamic questions tailored to your resume and experience level'
    },
    {
      icon: <Clock className="w-8 h-8 text-accent" />,
      title: 'Timed Interviews',
      description: 'Realistic interview environment with time constraints'
    },
    {
      icon: <Users className="w-8 h-8 text-success" />,
      title: 'Real-time Analysis',
      description: 'Instant feedback and detailed performance analytics'
    },
    {
      icon: <Award className="w-8 h-8 text-warning" />,
      title: 'Skill Assessment',
      description: 'Comprehensive evaluation of technical and soft skills'
    }
  ];

  const startInterview = (sectionId: string) => {
    navigate('/interview', { state: { interviewType: sectionId } });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <motion.nav 
        className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-gradient">AI Interview Assistant</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/login')}
              className="btn-hero"
            >
              Interviewer Login
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                className="p-4 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 animate-float"
                whileHover={{ scale: 1.1 }}
              >
                <Sparkles className="w-12 h-12 text-primary" />
              </motion.div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gradient leading-tight">
              Master Your Next
              <br />
              <span className="text-success-gradient">Tech Interview</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience AI-powered mock interviews that adapt to your skills. 
              Get real-time feedback and improve your performance with personalized insights.
            </p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button 
                size="lg" 
                className="btn-hero text-lg px-8 py-6"
                onClick={() => document.getElementById('interview-sections')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Start Interview
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6"
                onClick={() => navigate('/results')}
              >
                View My Results
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Why Choose Our AI Interview Assistant?</h2>
            <p className="text-xl text-muted-foreground">Advanced technology meets practical interview preparation</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="card-interactive text-center h-full">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interview Sections */}
      <section id="interview-sections" className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Choose Your Interview Path</h2>
            <p className="text-xl text-muted-foreground">Select the role that matches your career goals</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {interviewSections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="card-interactive h-full">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${section.color} flex items-center justify-center mb-4`}>
                      {section.icon}
                    </div>
                    <CardTitle className="text-2xl">{section.title}</CardTitle>
                    <p className="text-muted-foreground">{section.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">{section.difficulty}</Badge>
                      <span className="text-sm text-muted-foreground">{section.duration}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Questions:</span>
                      <span className="font-medium">{section.questions}</span>
                    </div>

                    <Button 
                      className="w-full btn-hero"
                      onClick={() => startInterview(section.id)}
                    >
                      Start Interview
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BrainCircuit className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold text-gradient">AI Interview Assistant</span>
          </div>
          <p className="text-muted-foreground">
            Powered by advanced AI technology for better interview preparation
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;