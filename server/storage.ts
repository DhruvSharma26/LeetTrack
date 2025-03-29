import { 
  User, InsertUser, Problem, InsertProblem, 
  Topic, InsertTopic, ProblemTopic, InsertProblemTopic, 
  Difficulty, Platform, Stats
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Problem operations
  getProblems(userId: number): Promise<Problem[]>;
  getProblem(id: number): Promise<Problem | undefined>;
  createProblem(problem: InsertProblem): Promise<Problem>;
  updateProblem(id: number, problem: Partial<InsertProblem>): Promise<Problem | undefined>;
  deleteProblem(id: number): Promise<boolean>;
  
  // Topic operations
  getTopics(): Promise<Topic[]>;
  getTopic(id: number): Promise<Topic | undefined>;
  getTopicByName(name: string): Promise<Topic | undefined>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  
  // Problem Topic operations
  getProblemTopics(problemId: number): Promise<string[]>;
  addProblemTopic(problemTopic: InsertProblemTopic): Promise<ProblemTopic>;
  removeProblemTopic(problemId: number, topicName: string): Promise<boolean>;
  
  // Stats operations
  getUserStats(userId: number): Promise<Stats>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private problems: Map<number, Problem>;
  private topics: Map<number, Topic>;
  private problemTopics: Map<number, ProblemTopic>;
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private problemIdCounter: number;
  private topicIdCounter: number;
  private problemTopicIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.problems = new Map();
    this.topics = new Map();
    this.problemTopics = new Map();
    this.userIdCounter = 1;
    this.problemIdCounter = 1;
    this.topicIdCounter = 1;
    this.problemTopicIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize default topics
    const defaultTopics = [
      "Arrays", "Strings", "Linked Lists", "Trees", "Graphs", 
      "Dynamic Programming", "Recursion", "Sorting", "Binary Search", 
      "Hash Tables", "Heaps", "Greedy", "Backtracking", "Math", 
      "Bit Manipulation", "Stack", "Queue", "Sliding Window", 
      "Two Pointers", "Union Find", "Trie", "Design"
    ];
    
    defaultTopics.forEach(topic => {
      this.createTopic({ name: topic });
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Problem operations
  async getProblems(userId: number): Promise<Problem[]> {
    return Array.from(this.problems.values()).filter(
      (problem) => problem.userId === userId
    );
  }
  
  async getProblem(id: number): Promise<Problem | undefined> {
    return this.problems.get(id);
  }
  
  async createProblem(problem: InsertProblem): Promise<Problem> {
    const id = this.problemIdCounter++;
    const newProblem = { ...problem, id };
    this.problems.set(id, newProblem);
    return newProblem;
  }
  
  async updateProblem(id: number, problem: Partial<InsertProblem>): Promise<Problem | undefined> {
    const existingProblem = this.problems.get(id);
    if (!existingProblem) return undefined;
    
    const updatedProblem = { ...existingProblem, ...problem };
    this.problems.set(id, updatedProblem);
    return updatedProblem;
  }
  
  async deleteProblem(id: number): Promise<boolean> {
    // Delete problem topics first
    Array.from(this.problemTopics.entries())
      .filter(([_, pt]) => pt.problemId === id)
      .forEach(([ptId, _]) => this.problemTopics.delete(ptId));
    
    return this.problems.delete(id);
  }
  
  // Topic operations
  async getTopics(): Promise<Topic[]> {
    return Array.from(this.topics.values());
  }
  
  async getTopic(id: number): Promise<Topic | undefined> {
    return this.topics.get(id);
  }
  
  async getTopicByName(name: string): Promise<Topic | undefined> {
    return Array.from(this.topics.values()).find(
      (topic) => topic.name.toLowerCase() === name.toLowerCase()
    );
  }
  
  async createTopic(topic: InsertTopic): Promise<Topic> {
    // Check if topic already exists
    const existingTopic = await this.getTopicByName(topic.name);
    if (existingTopic) return existingTopic;
    
    const id = this.topicIdCounter++;
    const newTopic = { ...topic, id };
    this.topics.set(id, newTopic);
    return newTopic;
  }
  
  // Problem Topic operations
  async getProblemTopics(problemId: number): Promise<string[]> {
    return Array.from(this.problemTopics.values())
      .filter((pt) => pt.problemId === problemId)
      .map((pt) => pt.topicName);
  }
  
  async addProblemTopic(problemTopic: InsertProblemTopic): Promise<ProblemTopic> {
    // Check if already exists
    const exists = Array.from(this.problemTopics.values()).some(
      (pt) => pt.problemId === problemTopic.problemId && pt.topicName === problemTopic.topicName
    );
    
    if (exists) {
      return Array.from(this.problemTopics.values()).find(
        (pt) => pt.problemId === problemTopic.problemId && pt.topicName === problemTopic.topicName
      )!;
    }
    
    const id = this.problemTopicIdCounter++;
    const newProblemTopic = { ...problemTopic, id };
    this.problemTopics.set(id, newProblemTopic);
    return newProblemTopic;
  }
  
  async removeProblemTopic(problemId: number, topicName: string): Promise<boolean> {
    const entry = Array.from(this.problemTopics.entries()).find(
      ([_, pt]) => pt.problemId === problemId && pt.topicName === topicName
    );
    
    if (entry) {
      const [id, _] = entry;
      return this.problemTopics.delete(id);
    }
    
    return false;
  }
  
  // Helper function to get formatted date strings (YYYY-MM-DD)
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  // Stats operations
  async getUserStats(userId: number): Promise<Stats> {
    const userProblems = await this.getProblems(userId);
    
    // Total solved
    const totalSolved = userProblems.length;
    
    // Difficulty breakdown
    const difficultyBreakdown = {
      easy: userProblems.filter(p => p.difficulty === "EASY").length,
      medium: userProblems.filter(p => p.difficulty === "MEDIUM").length,
      hard: userProblems.filter(p => p.difficulty === "HARD").length,
    };
    
    // Platform breakdown
    const platformBreakdown = userProblems.reduce((acc, problem) => {
      const platform = problem.platform;
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Topic distribution
    const topicCounts = new Map<string, number>();
    
    // Process each problem's topics
    for (const problem of userProblems) {
      const topics = await this.getProblemTopics(problem.id);
      for (const topic of topics) {
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
      }
    }
    
    const topicDistribution = Array.from(topicCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    // Recent problems with topics
    const recentProblems = await Promise.all(
      userProblems
        .sort((a, b) => {
          // Sort by date, newest first
          const dateA = new Date(a.dateSolved).getTime();
          const dateB = new Date(b.dateSolved).getTime();
          return dateB - dateA;
        })
        .slice(0, 5) // Get most recent 5
        .map(async (problem) => {
          const topics = await this.getProblemTopics(problem.id);
          return {
            id: problem.id,
            title: problem.title,
            platformId: problem.platformId || undefined,
            platform: problem.platform,
            difficulty: problem.difficulty,
            topics,
            dateSolved: this.formatDate(new Date(problem.dateSolved)),
          };
        })
    );
    
    // Daily activity (for last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const dailyActivityMap = new Map<string, number>();
    
    // Initialize all days with 0 problems
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      dailyActivityMap.set(this.formatDate(date), 0);
    }
    
    // Count problems for each day
    userProblems.forEach(problem => {
      const problemDate = new Date(problem.dateSolved);
      if (problemDate >= thirtyDaysAgo && problemDate <= today) {
        const dateString = this.formatDate(problemDate);
        dailyActivityMap.set(dateString, (dailyActivityMap.get(dateString) || 0) + 1);
      }
    });
    
    const dailyActivity = Array.from(dailyActivityMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // Progress data (total problems solved over time)
    const progressMap = new Map<string, number>();
    const allDates = userProblems.map(p => new Date(p.dateSolved))
      .sort((a, b) => a.getTime() - b.getTime());
    
    if (allDates.length > 0) {
      let cumulativeTotal = 0;
      const startDate = allDates[0];
      const endDate = today;
      
      // Create list of days between start and end, taking 7 evenly spaced points
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const interval = Math.max(1, Math.floor(totalDays / 7));
      
      for (let i = 0; i <= totalDays; i += interval) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateString = this.formatDate(currentDate);
        
        // Count problems solved by this date
        cumulativeTotal = userProblems.filter(
          p => new Date(p.dateSolved) <= currentDate
        ).length;
        
        progressMap.set(dateString, cumulativeTotal);
      }
      
      // Ensure the end date is always included
      progressMap.set(this.formatDate(endDate), totalSolved);
    }
    
    const progressData = Array.from(progressMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // Calculate streak
    let currentStreak = 0;
    
    // Sort problems by date (newest first)
    const sortedProblems = [...userProblems].sort((a, b) => {
      const dateA = new Date(a.dateSolved).getTime();
      const dateB = new Date(b.dateSolved).getTime();
      return dateB - dateA;
    });
    
    // Calculate current streak
    if (sortedProblems.length > 0) {
      // Check if there's at least one problem solved today
      const todayStr = this.formatDate(today);
      const solvedToday = sortedProblems.some(p => this.formatDate(new Date(p.dateSolved)) === todayStr);
      
      if (solvedToday) {
        currentStreak = 1; // At least one day streak
        
        // Check previous consecutive days
        let prevDate = new Date(today);
        prevDate.setDate(prevDate.getDate() - 1);
        
        while (true) {
          const prevDateStr = this.formatDate(prevDate);
          const solvedOnPrevDate = sortedProblems.some(
            p => this.formatDate(new Date(p.dateSolved)) === prevDateStr
          );
          
          if (solvedOnPrevDate) {
            currentStreak++;
            prevDate.setDate(prevDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }
    
    // Calculate weekly average (problems per week for the last 4 weeks)
    let weeklyAverage = 0;
    
    if (userProblems.length > 0) {
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(today.getDate() - 28);
      
      const problemsLastFourWeeks = userProblems.filter(
        p => new Date(p.dateSolved) >= fourWeeksAgo
      ).length;
      
      weeklyAverage = Math.round((problemsLastFourWeeks / 4) * 10) / 10; // Round to 1 decimal place
    }
    
    return {
      totalSolved,
      currentStreak,
      weeklyAverage,
      difficultyBreakdown,
      platformBreakdown,
      topicDistribution,
      dailyActivity,
      recentProblems,
      progressData,
    };
  }
}

export const storage = new MemStorage();
