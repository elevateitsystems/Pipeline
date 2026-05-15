import { Category, Presentation, Question } from "./types";

export const DEMO_PRESENTATION_ID = "demo-presentation-123";

export const DEMO_CATEGORIES = [
  { id: "cat-1", name: "Strategy & Planning", icon: "Target" },
  { id: "cat-2", name: "Operational Excellence", icon: "Activity" },
  { id: "cat-3", name: "Customer Experience", icon: "Users" },
  { id: "cat-4", name: "Financial Performance", icon: "TrendingUp" },
];

export const DEMO_QUESTIONS: any[] = [
  // Strategy & Planning
  {
    id: "q1-1",
    text: "How clearly defined is your company's long-term vision?",
    categoryId: "cat-1",
    category: { id: "cat-1", name: "Strategy & Planning" },
    options: [
      { id: "o1-1-1", text: "Not defined at all", points: 1 },
      { id: "o1-1-2", text: "Vaguely understood", points: 2 },
      { id: "o1-1-3", text: "Documented but rarely referenced", points: 3 },
      { id: "o1-1-4", text: "Clear and communicated to teams", points: 4 },
      { id: "o1-1-5", text: "Fully integrated into all operations", points: 5 },
    ],
  },
  {
    id: "q1-2",
    text: "How often do you review your strategic goals?",
    categoryId: "cat-1",
    category: { id: "cat-1", name: "Strategy & Planning" },
    options: [
      { id: "o1-2-1", text: "Never", points: 1 },
      { id: "o1-2-2", text: "Annually", points: 2 },
      { id: "o1-2-3", text: "Bi-annually", points: 3 },
      { id: "o1-2-4", text: "Quarterly", points: 4 },
      { id: "o1-2-5", text: "Monthly or more often", points: 5 },
    ],
  },
  {
    id: "q1-3",
    text: "Do you have a clear roadmap for the next 12-24 months?",
    categoryId: "cat-1",
    category: { id: "cat-1", name: "Strategy & Planning" },
    options: [
      { id: "o1-3-1", text: "No roadmap", points: 1 },
      { id: "o1-3-2", text: "Basic ideas only", points: 2 },
      { id: "o1-3-3", text: "Drafted roadmap", points: 3 },
      { id: "o1-3-4", text: "Comprehensive roadmap", points: 4 },
      { id: "o1-3-5", text: "Dynamic and agile roadmap", points: 5 },
    ],
  },
  {
    id: "q1-4",
    text: "How well are your resources aligned with your strategy?",
    categoryId: "cat-1",
    category: { id: "cat-1", name: "Strategy & Planning" },
    options: [
      { id: "o1-4-1", text: "No alignment", points: 1 },
      { id: "o1-4-2", text: "Poor alignment", points: 2 },
      { id: "o1-4-3", text: "Some alignment", points: 3 },
      { id: "o1-4-4", text: "Strong alignment", points: 4 },
      { id: "o1-4-5", text: "Perfectly optimized alignment", points: 5 },
    ],
  },

  // Operational Excellence
  {
    id: "q2-1",
    text: "How efficient are your core business processes?",
    categoryId: "cat-2",
    category: { id: "cat-2", name: "Operational Excellence" },
    options: [
      { id: "o2-1-1", text: "Extremely manual and slow", points: 1 },
      { id: "o2-1-2", text: "Inconsistent performance", points: 2 },
      { id: "o2-1-3", text: "Standardized but basic", points: 3 },
      { id: "o2-1-4", text: "Highly efficient and stable", points: 4 },
      { id: "o2-1-5", text: "World-class automation & efficiency", points: 5 },
    ],
  },
  {
    id: "q2-2",
    text: "How do you track operational performance?",
    categoryId: "cat-2",
    category: { id: "cat-2", name: "Operational Excellence" },
    options: [
      { id: "o2-2-1", text: "No tracking", points: 1 },
      { id: "o2-2-2", text: "Occasional checks", points: 2 },
      { id: "o2-2-3", text: "Basic KPIs", points: 3 },
      { id: "o2-2-4", text: "Real-time dashboards", points: 4 },
      { id: "o2-2-5", text: "Predictive analytics", points: 5 },
    ],
  },
  {
    id: "q2-3",
    text: "What is your level of process documentation?",
    categoryId: "cat-2",
    category: { id: "cat-2", name: "Operational Excellence" },
    options: [
      { id: "o2-3-1", text: "Nothing documented", points: 1 },
      { id: "o2-3-2", text: "Key steps only", points: 2 },
      { id: "o2-3-3", text: "Most processes documented", points: 3 },
      { id: "o2-3-4", text: "Fully documented & updated", points: 4 },
      { id: "o2-3-5", text: "Live, interactive documentation", points: 5 },
    ],
  },
  {
    id: "q2-4",
    text: "How effective is your internal communication?",
    categoryId: "cat-2",
    category: { id: "cat-2", name: "Operational Excellence" },
    options: [
      { id: "o2-4-1", text: "Siloed and non-existent", points: 1 },
      { id: "o2-4-2", text: "Frequent misunderstandings", points: 2 },
      { id: "o2-4-3", text: "Functional communication", points: 3 },
      { id: "o2-4-4", text: "Transparent and open", points: 4 },
      { id: "o2-4-5", text: "Seamless collaboration", points: 5 },
    ],
  },

  // Customer Experience
  {
    id: "q3-1",
    text: "How well do you understand your customers' needs?",
    categoryId: "cat-3",
    category: { id: "cat-3", name: "Customer Experience" },
    options: [
      { id: "o3-1-1", text: "We guess based on intuition", points: 1 },
      { id: "o3-1-2", text: "Basic feedback only", points: 2 },
      { id: "o3-1-3", text: "Periodic surveys", points: 3 },
      { id: "o3-1-4", text: "Deep data-driven insights", points: 4 },
      { id: "o3-1-5", text: "Total customer centricity", points: 5 },
    ],
  },
  {
    id: "q3-2",
    text: "How consistent is your service across different channels?",
    categoryId: "cat-3",
    category: { id: "cat-3", name: "Customer Experience" },
    options: [
      { id: "o3-2-1", text: "Highly inconsistent", points: 1 },
      { id: "o3-2-2", text: "Major variations", points: 2 },
      { id: "o3-2-3", text: "Fairly consistent", points: 3 },
      { id: "o3-2-4", text: "Unified experience", points: 4 },
      { id: "o3-2-5", text: "Perfect omnichannel harmony", points: 5 },
    ],
  },
  {
    id: "q3-3",
    text: "What is your average customer retention rate?",
    categoryId: "cat-3",
    category: { id: "cat-3", name: "Customer Experience" },
    options: [
      { id: "o3-3-1", text: "Very low (<50%)", points: 1 },
      { id: "o3-3-2", text: "Below average (50-70%)", points: 2 },
      { id: "o3-3-3", text: "Average (70-85%)", points: 3 },
      { id: "o3-3-4", text: "High (85-95%)", points: 4 },
      { id: "o3-3-5", text: "Exceptional (>95%)", points: 5 },
    ],
  },
  {
    id: "q3-4",
    text: "How quickly do you resolve customer issues?",
    categoryId: "cat-3",
    category: { id: "cat-3", name: "Customer Experience" },
    options: [
      { id: "o3-4-1", text: "Days or weeks", points: 1 },
      { id: "o3-4-2", text: "More than 48 hours", points: 2 },
      { id: "o3-4-3", text: "Within 24 hours", points: 3 },
      { id: "o3-4-4", text: "Within 4 hours", points: 4 },
      { id: "o3-4-5", text: "Instant resolution", points: 5 },
    ],
  },

  // Financial Performance
  {
    id: "q4-1",
    text: "How accurate is your financial forecasting?",
    categoryId: "cat-4",
    category: { id: "cat-4", name: "Financial Performance" },
    options: [
      { id: "o4-1-1", text: "Completely unpredictable", points: 1 },
      { id: "o4-1-2", text: "Frequent major variances", points: 2 },
      { id: "o4-1-3", text: "Generally accurate", points: 3 },
      { id: "o4-1-4", text: "Very high precision", points: 4 },
      { id: "o4-1-5", text: "Pinpoint accuracy with AI", points: 5 },
    ],
  },
  {
    id: "q4-2",
    text: "What is your current profit margin trend?",
    categoryId: "cat-4",
    category: { id: "cat-4", name: "Financial Performance" },
    options: [
      { id: "o4-2-1", text: "Rapidly declining", points: 1 },
      { id: "o4-2-2", text: "Slightly declining", points: 2 },
      { id: "o4-2-3", text: "Stable", points: 3 },
      { id: "o4-2-4", text: "Increasing", points: 4 },
      { id: "o4-2-5", text: "Consistently outperforming", points: 5 },
    ],
  },
  {
    id: "q4-3",
    text: "How well do you manage your cash flow?",
    categoryId: "cat-4",
    category: { id: "cat-4", name: "Financial Performance" },
    options: [
      { id: "o4-3-1", text: "Constant crises", points: 1 },
      { id: "o4-3-2", text: "Occasional shortages", points: 2 },
      { id: "o4-3-3", text: "Adequate management", points: 3 },
      { id: "o4-3-4", text: "Healthy reserves", points: 4 },
      { id: "o4-3-5", text: "Highly optimized liquidity", points: 5 },
    ],
  },
  {
    id: "q4-4",
    text: "What is your level of investment in innovation?",
    categoryId: "cat-4",
    category: { id: "cat-4", name: "Financial Performance" },
    options: [
      { id: "o4-4-1", text: "Zero investment", points: 1 },
      { id: "o4-4-2", text: "Minimal / Reactive", points: 2 },
      { id: "o4-4-3", text: "Consistent baseline", points: 3 },
      { id: "o4-4-4", text: "Strategic priority", points: 4 },
      { id: "o4-4-5", text: "Industry-leading R&D", points: 5 },
    ],
  },
];

export const DEMO_PRESENTATION: any = {
  id: DEMO_PRESENTATION_ID,
  title: "Demo Business Audit",
  categories: DEMO_CATEGORIES.map(cat => ({
    ...cat,
    questions: DEMO_QUESTIONS.filter(q => q.categoryId === cat.id)
  })),
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const DEMO_SUMMARY = {
  categoryRecommendations: [
    { categoryId: "cat-1", recommendation: "Focus on aligning long-term vision with daily activities." },
    { categoryId: "cat-2", recommendation: "Standardize process documentation to reduce variability." },
    { categoryId: "cat-3", recommendation: "Implement real-time customer feedback loops." },
    { categoryId: "cat-4", recommendation: "Increase R&D budget to drive future growth." },
  ],
  nextSteps: [
    { type: "high", content: "Conduct a strategic alignment workshop with senior leadership." },
    { type: "medium", content: "Review and update core business process documentation." },
    { type: "low", content: "Explore new customer retention software solutions." },
  ],
  overallDetails: "This demo audit shows a healthy foundation but highlights opportunities for optimization in strategy and innovation.",
};
