import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertProblemSchema, 
  insertTopicSchema, 
  insertProblemTopicSchema, 
  difficultyEnum,
  platformEnum,
  Problem
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // API middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Get all problems for the authenticated user
  app.get("/api/problems", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const problems = await storage.getProblems(userId);
      
      // Fetch topics for each problem
      const problemsWithTopics = await Promise.all(
        problems.map(async (problem) => {
          const topics = await storage.getProblemTopics(problem.id);
          return { ...problem, topics };
        })
      );
      
      res.json(problemsWithTopics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch problems" });
    }
  });

  // Get a specific problem
  app.get("/api/problems/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const problemId = parseInt(req.params.id);
      
      if (isNaN(problemId)) {
        return res.status(400).json({ message: "Invalid problem ID" });
      }
      
      const problem = await storage.getProblem(problemId);
      
      if (!problem) {
        return res.status(404).json({ message: "Problem not found" });
      }
      
      if (problem.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const topics = await storage.getProblemTopics(problemId);
      
      res.json({ ...problem, topics });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch problem" });
    }
  });

  // Create a new problem
  app.post("/api/problems", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Extract topics from request body
      const { topics, ...problemData } = req.body;
      
      // Set the user ID
      problemData.userId = userId;
      
      // Parse the form data
      const validationResult = insertProblemSchema.safeParse(problemData);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid problem data",
          errors: validationResult.error.format(),
        });
      }
      
      // Validate difficulty
      try {
        difficultyEnum.parse(problemData.difficulty);
      } catch (error) {
        return res.status(400).json({
          message: "Invalid difficulty value",
          validValues: difficultyEnum.options,
        });
      }
      
      // Validate platform
      try {
        platformEnum.parse(problemData.platform);
      } catch (error) {
        return res.status(400).json({
          message: "Invalid platform value",
          validValues: platformEnum.options,
        });
      }
      
      // Create the problem
      const problem = await storage.createProblem(validationResult.data);
      
      // Add topics if provided
      if (Array.isArray(topics) && topics.length > 0) {
        await Promise.all(
          topics.map(async (topicName: string) => {
            // Create the topic if it doesn't exist
            await storage.createTopic({ name: topicName });
            
            // Add the problem-topic relationship
            await storage.addProblemTopic({
              problemId: problem.id,
              topicName,
            });
          })
        );
      }
      
      // Get the topics that were just added
      const addedTopics = await storage.getProblemTopics(problem.id);
      
      res.status(201).json({ ...problem, topics: addedTopics });
    } catch (error) {
      res.status(500).json({ message: "Failed to create problem" });
    }
  });

  // Update a problem
  app.put("/api/problems/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const problemId = parseInt(req.params.id);
      
      if (isNaN(problemId)) {
        return res.status(400).json({ message: "Invalid problem ID" });
      }
      
      const existingProblem = await storage.getProblem(problemId);
      
      if (!existingProblem) {
        return res.status(404).json({ message: "Problem not found" });
      }
      
      if (existingProblem.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Extract topics from request body
      const { topics, ...problemData } = req.body;
      
      // Parse the form data
      const partialSchema = insertProblemSchema.partial();
      const validationResult = partialSchema.safeParse(problemData);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid problem data",
          errors: validationResult.error.format(),
        });
      }
      
      // Validate difficulty if provided
      if (problemData.difficulty) {
        try {
          difficultyEnum.parse(problemData.difficulty);
        } catch (error) {
          return res.status(400).json({
            message: "Invalid difficulty value",
            validValues: difficultyEnum.options,
          });
        }
      }
      
      // Validate platform if provided
      if (problemData.platform) {
        try {
          platformEnum.parse(problemData.platform);
        } catch (error) {
          return res.status(400).json({
            message: "Invalid platform value",
            validValues: platformEnum.options,
          });
        }
      }
      
      // Update the problem
      const updatedProblem = await storage.updateProblem(
        problemId,
        validationResult.data
      );
      
      if (!updatedProblem) {
        return res.status(404).json({ message: "Problem not found" });
      }
      
      // Update topics if provided
      if (Array.isArray(topics)) {
        // Get existing topics
        const existingTopics = await storage.getProblemTopics(problemId);
        
        // Remove topics that are not in the new list
        for (const existingTopic of existingTopics) {
          if (!topics.includes(existingTopic)) {
            await storage.removeProblemTopic(problemId, existingTopic);
          }
        }
        
        // Add new topics
        for (const topicName of topics) {
          if (!existingTopics.includes(topicName)) {
            // Create the topic if it doesn't exist
            await storage.createTopic({ name: topicName });
            
            // Add the problem-topic relationship
            await storage.addProblemTopic({
              problemId,
              topicName,
            });
          }
        }
      }
      
      // Get the updated topics
      const updatedTopics = await storage.getProblemTopics(problemId);
      
      res.json({ ...updatedProblem, topics: updatedTopics });
    } catch (error) {
      res.status(500).json({ message: "Failed to update problem" });
    }
  });

  // Delete a problem
  app.delete("/api/problems/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const problemId = parseInt(req.params.id);
      
      if (isNaN(problemId)) {
        return res.status(400).json({ message: "Invalid problem ID" });
      }
      
      const problem = await storage.getProblem(problemId);
      
      if (!problem) {
        return res.status(404).json({ message: "Problem not found" });
      }
      
      if (problem.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const deleted = await storage.deleteProblem(problemId);
      
      if (deleted) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Failed to delete problem" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete problem" });
    }
  });

  // Get all topics
  app.get("/api/topics", isAuthenticated, async (req, res) => {
    try {
      const topics = await storage.getTopics();
      res.json(topics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  // Get user statistics
  app.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // API route to analyze a LeetCode profile
  app.post("/api/analyze-profile", isAuthenticated, async (req, res) => {
    try {
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }
      
      // In a real implementation, this would fetch data from LeetCode's API
      // For demo purposes, we'll generate some realistic sample data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a realistic analysis result
      const totalProblems = Math.floor(Math.random() * 800) + 200;
      const easyCount = Math.floor(totalProblems * (0.4 + Math.random() * 0.2));
      const mediumCount = Math.floor(totalProblems * (0.3 + Math.random() * 0.2));
      const hardCount = totalProblems - easyCount - mediumCount;
      
      const analysisResult = {
        username,
        totalScore: Math.floor(Math.random() * 30) + 70, // Score between 70-100
        totalProblems,
        easyCount,
        mediumCount,
        hardCount,
        strongTopics: ["Arrays", "Dynamic Programming", "Binary Search", "Trees"].slice(0, Math.floor(Math.random() * 3) + 2),
        weakTopics: ["Graph", "Backtracking", "Bit Manipulation", "Design"].slice(0, Math.floor(Math.random() * 3) + 2),
        consistency: Math.floor(Math.random() * 40) + 60, // 60-100%
        problemSolvingSpeed: Math.floor(Math.random() * 30) + 70, // 70-100
        ranking: Math.floor(Math.random() * 50000) + 1000,
        recommendations: [
          "Focus on solving more hard problems to improve your ranking",
          "Practice more consistently with daily challenges",
          "Work on improving your weak areas, particularly in Graph algorithms",
          "Try participating in weekly contests to build problem-solving speed"
        ].slice(0, Math.floor(Math.random() * 2) + 3)
      };
      
      res.json(analysisResult);
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze LeetCode profile" });
    }
  });
  
  // API route to compare LeetCode profiles
  app.post("/api/compare-profiles", isAuthenticated, async (req, res) => {
    try {
      const { usernames } = req.body;
      
      if (!usernames || !Array.isArray(usernames) || usernames.length < 2) {
        return res.status(400).json({ message: "At least two usernames are required" });
      }
      
      // In a real implementation, this would fetch data from LeetCode's API
      // For demo purposes, we'll generate some realistic sample data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate realistic comparison results
      const profiles = usernames.map((username, index) => {
        const baseScore = 65 + (index * 5) % 30;
        const problemCount = 200 + (index * 50) % 300;
        const easyPercent = 40 + (index * 5) % 30;
        const mediumPercent = 30 + (index * 7) % 40;
        const hardPercent = 100 - easyPercent - mediumPercent;
        
        return {
          username,
          totalScore: baseScore,
          totalProblems: problemCount,
          easyCount: Math.round(problemCount * (easyPercent / 100)),
          mediumCount: Math.round(problemCount * (mediumPercent / 100)),
          hardCount: Math.round(problemCount * (hardPercent / 100)),
          strongTopics: ["Arrays", "Dynamic Programming", "Binary Search", "Trees", "Strings"].slice(0, 2 + (index % 3)),
          consistency: 60 + (index * 8) % 30,
          ranking: 50000 - (index * 10000),
        };
      });
      
      // Find common topics
      const allStrongTopics = profiles.map(p => p.strongTopics);
      const commonTopics = allStrongTopics[0].filter(topic => 
        allStrongTopics.every(topics => topics.includes(topic))
      );
      
      const result = {
        profiles,
        commonTopics,
        analysis: "Based on the profiles compared, there's a significant difference in problem-solving patterns and efficiency. Some users excel at harder problems while others have solved more problems overall. The consistency in problem solving varies across profiles."
      };
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to compare LeetCode profiles" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
