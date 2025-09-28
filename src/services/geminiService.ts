const GEMINI_API_KEY = 'AIzaSyDU7acDWYT0BP98WrPC4ZWTkt3P4nnu3NU';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export class GeminiService {
  private static async makeRequest(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || '';
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  static async generateInterviewQuestions(resumeText: string): Promise<any[]> {
    const prompt = `
Based on this resume for a Full Stack Developer (React/Node.js) position, generate exactly 6 interview questions in JSON format:
- 2 Easy questions (20 seconds each)
- 2 Medium questions (60 seconds each) 
- 2 Hard questions (120 seconds each)

Resume: ${resumeText}

Return a JSON array with this exact format:
[
  {
    "id": "q1",
    "question": "Easy question text here",
    "difficulty": "easy",
    "timeLimit": 20
  },
  {
    "id": "q2", 
    "question": "Easy question text here",
    "difficulty": "easy",
    "timeLimit": 20
  },
  {
    "id": "q3",
    "question": "Medium question text here", 
    "difficulty": "medium",
    "timeLimit": 60
  },
  {
    "id": "q4",
    "question": "Medium question text here",
    "difficulty": "medium", 
    "timeLimit": 60
  },
  {
    "id": "q5",
    "question": "Hard question text here",
    "difficulty": "hard",
    "timeLimit": 120
  },
  {
    "id": "q6",
    "question": "Hard question text here", 
    "difficulty": "hard",
    "timeLimit": 120
  }
]

Make questions specific to Full Stack development, React, Node.js, and tailor them to the candidate's experience level shown in the resume.`;

    const response = await this.makeRequest(prompt);
    
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (error) {
      console.error('Error parsing questions:', error);
      // Fallback questions
      return [
        { id: 'q1', question: 'What is React and why is it useful?', difficulty: 'easy', timeLimit: 20 },
        { id: 'q2', question: 'Explain the difference between let, const, and var in JavaScript.', difficulty: 'easy', timeLimit: 20 },
        { id: 'q3', question: 'How do React hooks work? Explain useState and useEffect.', difficulty: 'medium', timeLimit: 60 },
        { id: 'q4', question: 'What is the event loop in Node.js?', difficulty: 'medium', timeLimit: 60 },
        { id: 'q5', question: 'Design a REST API for a social media platform. Explain your architecture choices.', difficulty: 'hard', timeLimit: 120 },
        { id: 'q6', question: 'How would you optimize a React application for performance?', difficulty: 'hard', timeLimit: 120 }
      ];
    }
  }

  static async evaluateAnswer(question: string, answer: string): Promise<{ score: number; analysis: string }> {
    const prompt = `
Evaluate this interview answer for a Full Stack Developer position:

Question: ${question}
Answer: ${answer}

Provide a score from 0-10 and analysis in this exact JSON format:
{
  "score": 7,
  "analysis": "Good understanding shown but could improve on..."
}

Consider technical accuracy, depth of knowledge, and communication clarity.`;

    const response = await this.makeRequest(prompt);
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing evaluation:', error);
    }
    
    // Fallback evaluation
    const wordCount = answer.split(' ').length;
    const score = Math.min(10, Math.max(1, Math.floor(wordCount / 5)));
    return {
      score,
      analysis: 'Answer evaluated. Consider providing more technical details and examples.'
    };
  }

  static async generateFinalSummary(questions: any[], candidateName: string): Promise<{ score: number; summary: string }> {
    const totalScore = questions.reduce((sum, q) => sum + (q.score || 0), 0);
    const averageScore = Math.round((totalScore / questions.length) * 10) / 10;

    const prompt = `
Generate a final interview summary for ${candidateName}:

Questions and Scores:
${questions.map((q, i) => `${i + 1}. ${q.question}\nAnswer: ${q.answer || 'No answer'}\nScore: ${q.score || 0}/10\nAnalysis: ${q.aiAnalysis || 'Not analyzed'}`).join('\n\n')}

Average Score: ${averageScore}/10

Provide a JSON response with overall assessment:
{
  "score": ${averageScore},
  "summary": "Comprehensive summary of candidate's strengths, weaknesses, and recommendation"
}`;

    const response = await this.makeRequest(prompt);
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing summary:', error);
    }

    return {
      score: averageScore,
      summary: `${candidateName} completed the interview with an average score of ${averageScore}/10. Review individual answers for detailed assessment.`
    };
  }
}