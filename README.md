# LeetTrack - LeetCode Profile Analyzer

LeetTrack is a full-stack application designed to analyze and compare LeetCode profiles, providing comprehensive scoring and insights for programmers looking to improve their problem-solving skills.

## 🚀 Features

- **Profile Analysis**: Get a detailed breakdown of your LeetCode performance with a score out of 100
- **Comparative Analysis**: Compare multiple LeetCode profiles side-by-side
- **Performance Metrics**: Track problem counts, difficulty distribution, consistency scores and more
- **Personalized Recommendations**: Receive tailored suggestions to improve your coding skills
- **User Authentication**: Secure login/register system to save your analyses

## 🛠️ Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Shadcn UI components
- TanStack Query for data fetching
- React Hook Form with Zod validation
- Wouter for routing

### Backend
- Node.js
- Express.js
- In-memory database (configurable for PostgreSQL)
- LeetCode API integration

## 📋 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/leettrack.git
cd leettrack
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5000](http://localhost:5000) in your browser

## 🖥️ Usage

1. Register or log in to your account
2. Choose between "Profile Analysis" or "Profile Comparison"
3. Enter LeetCode username(s)
4. View your detailed analysis with scores, metrics, and recommendations

## 📷 Screenshots

(Add screenshots of your application here)

## 📊 Scoring Algorithm

The profile scoring system uses a balanced 4-component approach:
- **Problem Count** (30 points): Based on the total number of problems solved
- **Difficulty Distribution** (30 points): Weighted analysis of easy/medium/hard problems
- **Consistency** (20 points): Measures regular practice patterns
- **Progress** (20 points): Tracks improvement over time

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Contact

Your Name - [your.email@example.com](mailto:your.email@example.com)

Project Link: [https://github.com/yourusername/leettrack](https://github.com/yourusername/leettrack)