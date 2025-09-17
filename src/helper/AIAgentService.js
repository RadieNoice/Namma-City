import OpenAI from 'openai';
import supabase from './supabaseClient';
import { ISSUE_CATEGORIES } from './issueClassifier';

class AIAgentService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // For demo purposes
    });
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    this.initialized = true;
  }

  async findSimilarIssues(description, location) {
    try {
      // Fetch recent issues
      const { data: issues } = await supabase
        .from('issues')
        .select('*')
        .limit(10);

      if (!issues || issues.length === 0) return [];

      // Use OpenAI to find similar issues
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant helping to identify similar civic issues. Compare the new issue with existing ones and return only truly similar issues."
          },
          {
            role: "user",
            content: `New Issue: ${description}\nLocation: ${location}\n\nExisting Issues:\n${JSON.stringify(issues, null, 2)}\n\nIdentify similar issues and explain why they are similar. Only return truly relevant matches.`
          }
        ]
      });

      const similarIssues = issues.filter(issue => 
        response.choices[0].message.content.toLowerCase().includes(issue.id.toString())
      );

      return similarIssues.map(issue => ({
        text: `${issue.title}: ${issue.description}`,
        metadata: {
          id: issue.id,
          category: issue.category,
          status: issue.status
        }
      }));
    } catch (error) {
      console.error('Error finding similar issues:', error);
      return [];
    }
  }

  async routeIssue(description, category) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a civic issue routing assistant. Based on the issue description and category, determine:
1. The appropriate department
2. Estimated resolution time
3. Priority level
4. A natural language response to the citizen

Format your response exactly as:
Department: [department name]
Estimated Time: [X days]
Priority: [high/medium/low]
Response: [your response]`
          },
          {
            role: "user",
            content: `Issue Description: ${description}\nCategory: ${category}`
          }
        ]
      });

      const result = response.choices[0].message.content;
      const lines = result.split('\n');
      let output = {
        department: '',
        estimatedTime: '',
        priority: '',
        userResponse: ''
      };

      lines.forEach(line => {
        if (line.startsWith('Department:')) output.department = line.substring(11).trim();
        if (line.startsWith('Estimated Time:')) output.estimatedTime = line.substring(15).trim();
        if (line.startsWith('Priority:')) output.priority = line.substring(9).trim().toLowerCase();
        if (line.startsWith('Response:')) output.userResponse = line.substring(9).trim();
      });

      return output;
    } catch (error) {
      console.error('Error routing issue:', error);
      return null;
    }
  }

  async handleStatusQuery(userId, query) {
    try {
      const { data: userIssues } = await supabase
        .from('issues')
        .select('*')
        .eq('user_id', userId);

      if (!userIssues || userIssues.length === 0) {
        return "You haven't reported any issues yet.";
      }

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful civic issue assistant. Provide clear, concise updates about reported issues in a friendly tone."
          },
          {
            role: "user",
            content: `User Query: ${query}\n\nUser's Issues:\n${JSON.stringify(userIssues, null, 2)}`
          }
        ]
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error handling status query:', error);
      return "I'm having trouble retrieving your issue status. Please try again later.";
    }
  }

}

// Create and export singleton instance
const aiAgent = new AIAgentService();
export default aiAgent;