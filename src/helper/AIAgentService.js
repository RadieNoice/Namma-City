import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "@langchain/openai";
import supabase from './supabaseClient';
import { ISSUE_CATEGORIES } from './issueClassifier';

class AIAgentService {
  constructor() {
    this.model = new ChatOpenAI({
      temperature: 0.7,
      modelName: "gpt-3.5-turbo",
    });
    this.embeddings = new OpenAIEmbeddings();
    this.vectorStore = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Fetch all existing issues for duplicate detection
      const { data: issues } = await supabase
        .from('issues')
        .select('*');

      if (issues && issues.length > 0) {
        // Create vector store for similarity search
        const texts = issues.map(issue => ({
          text: `${issue.title} ${issue.description}`,
          metadata: { id: issue.id, category: issue.category, status: issue.status }
        }));

        this.vectorStore = await HNSWLib.fromTexts(
          texts.map(t => t.text),
          texts.map(t => t.metadata),
          this.embeddings
        );
      } else {
        // Initialize empty vector store if no issues exist
        this.vectorStore = await HNSWLib.fromTexts(
          ["Initial empty store"],
          [{ id: "0", category: "none", status: "none" }],
          this.embeddings
        );
      }

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing AI Agent:', error);
      throw error;
    }
  }

  async findSimilarIssues(description, location) {
    if (!this.initialized) await this.initialize();

    try {
      const results = await this.vectorStore.similaritySearch(
        description,
        3,
        score => score > 0.8 // Only return highly similar issues
      );

      return results;
    } catch (error) {
      console.error('Error finding similar issues:', error);
      return [];
    }
  }

  async routeIssue(description, category) {
    const routingPrompt = PromptTemplate.fromTemplate(
      `Based on the issue description and category, determine the appropriate department and estimated resolution time.
      Issue description: {description}
      Category: {category}

      Provide response in this format:
      Department: [department name]
      Estimated Time: [number of days]
      Priority: [high/medium/low]
      Response: [natural language response to citizen]`
    );

    const chain = RunnableSequence.from([
      routingPrompt,
      this.model,
      new StringOutputParser()
    ]);

    try {
      const response = await chain.invoke({
        description,
        category
      });

      // Parse the response
      const department = response.match(/Department: (.*)/)?.[1] || '';
      const estimatedTime = response.match(/Estimated Time: (.*)/)?.[1] || '';
      const priority = response.match(/Priority: (.*)/)?.[1] || '';
      const userResponse = response.match(/Response: (.*)/)?.[1] || '';

      return {
        department,
        estimatedTime,
        priority,
        userResponse
      };
    } catch (error) {
      console.error('Error routing issue:', error);
      return null;
    }
  }

  async handleStatusQuery(userId, query) {
    if (!this.initialized) await this.initialize();

    try {
      // Fetch user's issues
      const { data: userIssues } = await supabase
        .from('issues')
        .select('*')
        .eq('user_id', userId);

      if (!userIssues || userIssues.length === 0) {
        return "You haven't reported any issues yet.";
      }

      const statusPrompt = PromptTemplate.fromTemplate(
        `A user is asking about their reported issues. Based on their query and the available issues, provide a natural response.
        
        User Query: {query}
        
        Available Issues:
        {issues}
        
        Provide a helpful, conversational response that addresses their query and includes relevant issue details.`
      );

      const chain = RunnableSequence.from([
        statusPrompt,
        this.model,
        new StringOutputParser()
      ]);

      const response = await chain.invoke({
        query,
        issues: JSON.stringify(userIssues, null, 2)
      });

      return response;
    } catch (error) {
      console.error('Error handling status query:', error);
      return "I'm having trouble retrieving your issue status. Please try again later.";
    }
  }

  async addIssueToVectorStore(issue) {
    if (!this.initialized) await this.initialize();

    try {
      await this.vectorStore.addDocuments([{
        pageContent: `${issue.title} ${issue.description}`,
        metadata: {
          id: issue.id,
          category: issue.category,
          status: issue.status
        }
      }]);
    } catch (error) {
      console.error('Error adding issue to vector store:', error);
    }
  }
}

// Create and export singleton instance
const aiAgent = new AIAgentService();
export default aiAgent;