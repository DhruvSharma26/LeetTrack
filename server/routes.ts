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
import { LeetCode } from "@leetnotion/leetcode-api";

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

  // API route to analyze a LeetCode profile
  app.post("/api/analyze-profile", isAuthenticated, async (req, res) => {
    try {
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }
      
      // Fetch real data from LeetCode API
      try {
        // Create LeetCode client instance
        const leetcodeClient = new LeetCode();
        
        // Get user profile data
        const userProfile = await leetcodeClient.user(username);
        
        if (!userProfile || !userProfile.matchedUser) {
          return res.status(404).json({ message: "LeetCode user not found" });
        }
        
        // Get user's recent submissions for consistency analysis
        const submissions = await leetcodeClient.recent_user_submissions(username, 50);
        
        // Get problem solving stats
        const userProblems = await leetcodeClient.problems(username);
        
        // Calculate total problems
        const submitStats = userProfile.matchedUser.submitStats;
        const totalProblems = submitStats.acSubmissionNum.find(item => item.difficulty === "All")?.count || 0;
        const easyCount = submitStats.acSubmissionNum.find(item => item.difficulty === "Easy")?.count || 0;
        const mediumCount = submitStats.acSubmissionNum.find(item => item.difficulty === "Medium")?.count || 0;
        const hardCount = submitStats.acSubmissionNum.find(item => item.difficulty === "Hard")?.count || 0;
        
        // Calculate ranking (if available)
        const ranking = userProfile.matchedUser.profile.ranking || 0;
        
        // Calculate consistency score based on submission frequency
        let consistency = 0;
        if (submissions && submissions.length > 0) {
          // Check how regularly they solve problems
          const submissionDates = submissions.map(sub => new Date(sub.timestamp * 1000).toISOString().split('T')[0]);
          const uniqueDates = new Set(submissionDates);
          consistency = Math.min(100, Math.round((uniqueDates.size / 30) * 100));
        }
        
        // Extract topics/tags from the problems data
        const topicMap = new Map();
        
        if (userProblems && userProblems.matchedUser && userProblems.matchedUser.tagProblemCounts) {
          const tags = userProblems.matchedUser.tagProblemCounts;
          
          // Process each tag
          tags.forEach(tag => {
            topicMap.set(tag.tagName, {
              tagName: tag.tagName,
              problemsSolved: tag.problemsSolved,
              problemsTotal: tag.problemsTotal
            });
          });
        }
        
        // Convert to array for sorting
        const topicArray = Array.from(topicMap.values());
        
        // Identify strong topics (tags with highest solve count)
        const sortedTags = [...topicArray].sort((a, b) => b.problemsSolved - a.problemsSolved);
        const strongTopics = sortedTags.slice(0, 3).map(tag => tag.tagName);
        
        // Identify weak topics (tags with lowest solve percentage)
        const weakTopics = sortedTags.filter(tag => tag.problemsSolved > 0)
          .sort((a, b) => (a.problemsSolved / a.problemsTotal) - (b.problemsSolved / b.problemsTotal))
          .slice(0, 3).map(tag => tag.tagName);
        
        // Calculate problem-solving speed (based on acceptance rate)
        const problemSolvingSpeed = Math.min(100, Math.round(userProfile.matchedUser.submitStats.acRate));
        
        // Calculate total score (based on problems solved, difficulty distribution, consistency)
        // This is a custom formula that weighs different aspects of the profile
        const difficultyScore = (easyCount * 1 + mediumCount * 2 + hardCount * 3) / Math.max(1, totalProblems);
        
        // Enhanced calculation to ensure scores scale properly
        const problemsScore = Math.min(30, Math.round((totalProblems / 100) * 30)); // Scale up to 30 points max
        const difficultyScorePoints = Math.min(40, Math.round(difficultyScore * 40)); // Scale up to 40 points max
        const consistencyPoints = Math.min(20, Math.round(consistency * 0.2)); // Scale up to 20 points max
        const speedPoints = Math.min(10, Math.round(problemSolvingSpeed * 0.1)); // Scale up to 10 points max
        
        // Sum up the points to get total score out of 100
        const totalScore = problemsScore + difficultyScorePoints + consistencyPoints + speedPoints;
        
        console.log(`Score calculation for ${username}:
          Total Problems: ${totalProblems} → ${problemsScore} points
          Difficulty Score: ${difficultyScore.toFixed(2)} → ${difficultyScorePoints} points
          Consistency: ${consistency}% → ${consistencyPoints} points
          Speed: ${problemSolvingSpeed}% → ${speedPoints} points
          Total Score: ${totalScore}/100
        `);
        
        // Generate personalized recommendations
        const recommendations = [];
        
        if (hardCount / totalProblems < 0.1) {
          recommendations.push("Focus on solving more hard problems to improve your ranking");
        }
        
        if (consistency < 70) {
          recommendations.push("Practice more consistently with daily challenges");
        }
        
        if (weakTopics.length > 0) {
          recommendations.push(`Work on improving your weak areas, particularly in ${weakTopics[0]} problems`);
        }
        
        if (userProfile.matchedUser.userContestInfo?.attendedContestsCount < 5) {
          recommendations.push("Try participating in weekly contests to build problem-solving speed");
        }
        
        if (recommendations.length === 0) {
          recommendations.push("Continue your excellent work! Consider mentoring others in the community");
        }
        
        const analysisResult = {
          username,
          totalScore,
          totalProblems,
          easyCount,
          mediumCount,
          hardCount,
          strongTopics,
          weakTopics,
          consistency,
          problemSolvingSpeed,
          ranking,
          recommendations
        };
        
        res.json(analysisResult);
      } catch (error: any) {
        console.error("Error fetching LeetCode data:", error);
        return res.status(500).json({ 
          message: "Failed to fetch data from LeetCode. Please ensure the username is correct and the profile is public.",
          error: error.message
        });
      }
    } catch (error) {
      console.error("Error analyzing profile:", error);
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
      
      try {
        // Fetch real data for each profile
        const profilePromises = usernames.map(async (username) => {
          try {
            // Create LeetCode client instance
            const leetcodeClient = new LeetCode();
            
            // Get user profile data
            const userProfile = await leetcodeClient.user(username);
            
            if (!userProfile || !userProfile.matchedUser) {
              return null; // Skip invalid profiles
            }
            
            // Get user's recent submissions for consistency analysis
            const submissions = await leetcodeClient.recent_user_submissions(username, 20);
            
            // Get problem solving stats
            const userProblems = await leetcodeClient.problems(username);
            
            // Calculate total problems
            const submitStats = userProfile.matchedUser.submitStats;
            const totalProblems = submitStats.acSubmissionNum.find(item => item.difficulty === "All")?.count || 0;
            const easyCount = submitStats.acSubmissionNum.find(item => item.difficulty === "Easy")?.count || 0;
            const mediumCount = submitStats.acSubmissionNum.find(item => item.difficulty === "Medium")?.count || 0;
            const hardCount = submitStats.acSubmissionNum.find(item => item.difficulty === "Hard")?.count || 0;
            
            // Calculate ranking (if available)
            const ranking = userProfile.matchedUser.profile.ranking || 0;
            
            // Calculate consistency score
            let consistency = 0;
            if (submissions && submissions.length > 0) {
              const submissionDates = submissions.map(sub => new Date(sub.timestamp * 1000).toISOString().split('T')[0]);
              const uniqueDates = new Set(submissionDates);
              consistency = Math.min(100, Math.round((uniqueDates.size / 20) * 100));
            }
            
            // Extract topics/tags from the problems data
            const topicMap = new Map();
            
            if (userProblems && userProblems.matchedUser && userProblems.matchedUser.tagProblemCounts) {
              const tags = userProblems.matchedUser.tagProblemCounts;
              
              // Process each tag
              tags.forEach(tag => {
                topicMap.set(tag.tagName, {
                  tagName: tag.tagName,
                  problemsSolved: tag.problemsSolved,
                  problemsTotal: tag.problemsTotal
                });
              });
            }
            
            // Convert to array for sorting
            const topicArray = Array.from(topicMap.values());
            
            // Identify strong topics (tags with highest solve count)
            const sortedTags = [...topicArray].sort((a, b) => b.problemsSolved - a.problemsSolved);
            const strongTopics = sortedTags.slice(0, 3).map(tag => tag.tagName);
            
            // Calculate total score
            const difficultyScore = (easyCount * 1 + mediumCount * 2 + hardCount * 3) / Math.max(1, totalProblems);
            
            // Enhanced calculation to ensure scores scale properly
            const problemsScore = Math.min(30, Math.round((totalProblems / 100) * 30)); // Scale up to 30 points max
            const difficultyScorePoints = Math.min(40, Math.round(difficultyScore * 40)); // Scale up to 40 points max
            const consistencyPoints = Math.min(20, Math.round(consistency * 0.2)); // Scale up to 20 points max
            const speedPoints = Math.min(10, Math.round((userProfile.matchedUser.submitStats.acRate || 0) * 0.1)); // Scale up to 10 points max
            
            // Sum up the points to get total score out of 100
            const totalScore = problemsScore + difficultyScorePoints + consistencyPoints + speedPoints;
            
            return {
              username,
              totalScore,
              totalProblems,
              easyCount,
              mediumCount,
              hardCount,
              strongTopics,
              consistency,
              ranking,
            };
          } catch (err) {
            console.error(`Error fetching data for ${username}:`, err);
            return null;
          }
        });
        
        // Wait for all profile data to be fetched
        const profileResults = await Promise.all(profilePromises);
        
        // Filter out any null results (failed fetches)
        const profiles = profileResults.filter(profile => profile !== null);
        
        if (profiles.length < 2) {
          return res.status(400).json({ 
            message: "Could not retrieve enough valid LeetCode profiles for comparison"
          });
        }
        
        // Find common topics
        const allStrongTopics = profiles.map(p => p.strongTopics);
        const commonTopics = allStrongTopics[0].filter(topic => 
          allStrongTopics.every(topics => topics.includes(topic))
        );
        
        // Generate analysis based on the profiles
        let analysis = "";
        
        // Sort profiles by total score
        const sortedProfiles = [...profiles].sort((a, b) => b.totalScore - a.totalScore);
        const topProfile = sortedProfiles[0];
        const bottomProfile = sortedProfiles[sortedProfiles.length - 1];
        
        if (topProfile.totalScore - bottomProfile.totalScore > 30) {
          analysis = `There's a significant difference in performance across these profiles. ${topProfile.username} shows stronger overall metrics with ${topProfile.totalProblems} problems solved and a focus on ${topProfile.strongTopics.join(", ")}.`;
        } else {
          analysis = `These profiles show relatively similar performance levels. ${commonTopics.length > 0 ? `They share strengths in ${commonTopics.join(", ")}` : 'They focus on different topic areas'}.`;
        }
        
        // Add difficulty distribution analysis
        const hardRatios = profiles.map(p => p.hardCount / p.totalProblems);
        const maxHardRatio = Math.max(...hardRatios);
        const minHardRatio = Math.min(...hardRatios);
        
        if (maxHardRatio - minHardRatio > 0.1) {
          const hardFocusProfile = profiles[hardRatios.indexOf(maxHardRatio)];
          analysis += ` ${hardFocusProfile.username} tackles more challenging problems with ${hardFocusProfile.hardCount} hard problems solved.`;
        }
        
        // Add consistency analysis
        const maxConsistency = Math.max(...profiles.map(p => p.consistency));
        if (maxConsistency > 80) {
          const consistentProfile = profiles.find(p => p.consistency === maxConsistency);
          analysis += ` ${consistentProfile.username} shows excellent consistency in problem-solving practice.`;
        }
        
        const result = {
          profiles,
          commonTopics,
          analysis
        };
        
        res.json(result);
      } catch (error: any) {
        console.error("Error comparing profiles:", error);
        return res.status(500).json({ 
          message: "Failed to compare LeetCode profiles", 
          error: error.message 
        });
      }
    } catch (error) {
      console.error("Error processing comparison request:", error);
      res.status(500).json({ message: "Failed to compare LeetCode profiles" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
