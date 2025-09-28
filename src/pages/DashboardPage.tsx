import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { setSearchQuery, setSortBy, setSortOrder } from '@/store/slices/candidatesSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BrainCircuit, 
  Search, 
  SortAsc, 
  SortDesc, 
  Users, 
  Award, 
  Clock, 
  TrendingUp,
  Eye,
  LogOut,
  ArrowLeft,
  Download
} from 'lucide-react';
import CandidateDetailView from '@/components/dashboard/CandidateDetailView';
import StatsCards from '@/components/dashboard/StatsCards';

const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated, userType } = useSelector((state: RootState) => state.auth);
  const { candidates, searchQuery, sortBy, sortOrder } = useSelector((state: RootState) => state.candidates);
  
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  // Redirect if not authenticated as interviewer
  if (!isAuthenticated || userType !== 'interviewer') {
    navigate('/login');
    return null;
  }

  // Filter and sort candidates
  const filteredCandidates = candidates
    .filter(candidate => 
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const modifier = sortOrder === 'asc' ? 1 : -1;
      
      switch (sortBy) {
        case 'score':
          return (a.finalScore - b.finalScore) * modifier;
        case 'name':
          return a.name.localeCompare(b.name) * modifier;
        case 'date':
          return (a.completedAt - b.completedAt) * modifier;
        default:
          return 0;
      }
    });

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-success';
    if (score >= 6) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 8) return 'default'; // Will use success colors from our design system
    if (score >= 6) return 'secondary';
    return 'destructive';
  };

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
              
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-gradient">Interview Dashboard</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage and review candidate interviews
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon">
                <Download className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <StatsCards candidates={candidates} />

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="card-interactive">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Filter Candidates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select
                    value={sortBy}
                    onValueChange={(value: 'score' | 'name' | 'date') => dispatch(setSortBy(value))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="score">Score</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => dispatch(setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'))}
                  >
                    {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Candidates List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {filteredCandidates.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
                <p className="text-muted-foreground">
                  {candidates.length === 0 
                    ? "No interviews have been completed yet." 
                    : "Try adjusting your search criteria."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredCandidates.map((candidate, index) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="card-interactive">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">
                              {candidate.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-semibold">{candidate.name}</h3>
                            <p className="text-muted-foreground">{candidate.email}</p>
                            {candidate.phone && (
                              <p className="text-sm text-muted-foreground">{candidate.phone}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getScoreColor(candidate.finalScore)}`}>
                              {candidate.finalScore}
                            </div>
                            <p className="text-xs text-muted-foreground">Score</p>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-lg font-semibold">
                              {candidate.duration}m
                            </div>
                            <p className="text-xs text-muted-foreground">Duration</p>
                          </div>
                          
                          <div className="text-center">
                            <Badge variant={getScoreBadgeVariant(candidate.finalScore)}>
                              {candidate.finalScore >= 8 ? 'Excellent' : 
                               candidate.finalScore >= 6 ? 'Good' : 'Needs Improvement'}
                            </Badge>
                          </div>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setSelectedCandidate(candidate.id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh]">
                              <DialogHeader>
                                <DialogTitle>
                                  Interview Details - {candidate.name}
                                </DialogTitle>
                              </DialogHeader>
                              <CandidateDetailView candidateId={candidate.id} />
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;