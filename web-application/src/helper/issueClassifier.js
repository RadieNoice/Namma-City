import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

// Define issue categories
export const ISSUE_CATEGORIES = {
  ROADS: 'Roads and Infrastructure',
  SANITATION: 'Sanitation and Cleanliness',
  ELECTRICITY: 'Electricity and Power',
  WATER: 'Water Supply',
  TRAFFIC: 'Traffic and Transportation',
  SAFETY: 'Public Safety',
  OTHER: 'Other Issues'
};

class IssueClassifier {
  constructor() {
    this.encoder = null;
    this.model = null;
    this.isReady = false;
  }

  async initialize() {
    try {
      // Load Universal Sentence Encoder
      this.encoder = await use.load();
      
      // Create a simple classification model
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ units: 128, activation: 'relu', inputShape: [512] }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: Object.keys(ISSUE_CATEGORIES).length, activation: 'softmax' })
        ]
      });

      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });

      this.isReady = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize issue classifier:', error);
      return false;
    }
  }

  async preprocessText(text) {
    // Basic text preprocessing
    const cleanedText = text.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .trim();
    
    // Encode the text using Universal Sentence Encoder
    const embeddings = await this.encoder.embed(cleanedText);
    return embeddings;
  }

  async classifyIssue(description) {
    if (!this.isReady) {
      throw new Error('Classifier is not initialized');
    }

    try {
      // Preprocess and encode the text
      const embeddings = await this.preprocessText(description);
      
      // Make prediction
      const prediction = this.model.predict(embeddings);
      const probabilities = await prediction.array();
      
      // Get category with highest probability
      const categoryIndex = probabilities[0].indexOf(Math.max(...probabilities[0]));
      const category = Object.keys(ISSUE_CATEGORIES)[categoryIndex];
      
      return {
        category: ISSUE_CATEGORIES[category],
        confidence: probabilities[0][categoryIndex]
      };
    } catch (error) {
      console.error('Error classifying issue:', error);
      return {
        category: ISSUE_CATEGORIES.OTHER,
        confidence: 0
      };
    }
  }

  async train(trainingData) {
    if (!this.isReady) {
      throw new Error('Classifier is not initialized');
    }

    try {
      // Prepare training data
      const descriptions = trainingData.map(item => item.description);
      const embeddings = await this.encoder.embed(descriptions);
      
      // Convert categories to one-hot encoded labels
      const labels = tf.oneHot(
        trainingData.map(item => Object.keys(ISSUE_CATEGORIES).indexOf(item.category)),
        Object.keys(ISSUE_CATEGORIES).length
      );

      // Train the model
      await this.model.fit(embeddings, labels, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
          }
        }
      });

      return true;
    } catch (error) {
      console.error('Error training classifier:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
const issueClassifier = new IssueClassifier();
export default issueClassifier;