export interface ThemeExperience {
  intro: string;
  whyItMatters: string;
  relatedTopics: string[];
}

export interface TopicExperience {
  intro?: string;
  whyMattersToday: string;
  currentChallenges: string[];
  studentRelevance: string;
  youthRelevance: string;
  relatedTopics: string[];
}

export const themeExperienceBySlug: Record<string, ThemeExperience> = {
  "self-discipline": {
    intro: "Self Discipline turns intention into daily action. It is the bridge between faith, study, and character.",
    whyItMatters: "In a distracted age, discipline protects your attention, your salah, and your long-term purpose.",
    relatedTopics: ["focus-productivity", "consistency", "laziness", "self-control", "anger-management"],
  },
  "leadership": {
    intro: "Leadership in Imam Ali's tradition begins with responsibility, justice, and service before status.",
    whyItMatters: "Young people are already leading in families, classrooms, and communities, whether they realize it or not.",
    relatedTopics: ["responsibility", "decision-making", "justice-in-leadership", "trust"],
  },
  "justice": {
    intro: "Justice is not abstract. It appears in speech, decisions, fairness, and moral courage.",
    whyItMatters: "Without justice, knowledge becomes pride and leadership becomes control.",
    relatedTopics: ["fairness", "rights", "truth", "accountability"],
  },
  "knowledge": {
    intro: "Knowledge in TheNahj means learning that transforms both mind and conduct.",
    whyItMatters: "Students need knowledge that builds clarity, resilience, and ethical action, not information overload.",
    relatedTopics: ["learning", "study-discipline", "seeking-knowledge", "critical-thinking"],
  },
  "patience": {
    intro: "Patience is disciplined steadiness under pressure, not passive surrender.",
    whyItMatters: "It helps youth navigate anxiety, delay, hardship, and uncertainty with dignity.",
    relatedTopics: ["sabr-in-hardship", "exam-stress", "resilience", "emotional-stability"],
  },
  "character": {
    intro: "Character is the visible shape of inner values: honesty, humility, respect, and integrity.",
    whyItMatters: "A strong character protects relationships, learning, and leadership from ego and impulse.",
    relatedTopics: ["honesty", "humility", "respect", "speech-discipline"],
  },
  "purpose": {
    intro: "Purpose gives direction to talent, time, and energy so life is lived intentionally.",
    whyItMatters: "Without purpose, distraction becomes default and comparison becomes identity.",
    relatedTopics: ["direction", "identity", "career-pressure", "meaningful-life"],
  },
  "relationships": {
    intro: "Relationships are a trust. They require boundaries, mercy, accountability, and truth.",
    whyItMatters: "Modern emotional confusion can be reduced when relationships are guided by wisdom and values.",
    relatedTopics: ["family", "friendship", "boundaries", "conflict-resolution"],
  },
  "time-management": {
    intro: "Time Management is stewardship of life itself. Every day is a limited trust.",
    whyItMatters: "When time is unmanaged, anxiety rises and meaningful work is replaced by noise.",
    relatedTopics: ["priorities", "planning", "procrastination", "deep-work"],
  },
  "spiritual-growth": {
    intro: "Spiritual Growth aligns actions with Allah-consciousness in ordinary daily life.",
    whyItMatters: "In a high-stimulation world, spirituality restores inner stability and moral direction.",
    relatedTopics: ["taqwa", "salah-discipline", "dua", "self-accountability"],
  },
};

export const topicExperienceBySlug: Record<string, TopicExperience> = {
  "focus-productivity": {
    intro: "Focus and Productivity are about protecting attention and completing meaningful work with ihsan.",
    whyMattersToday: "Modern students and youth face constant cognitive fragmentation through infinite-scroll environments.",
    currentChallenges: ["Dopamine-driven distractions", "Inconsistent routines", "Perfectionism and delay", "Low deep-work stamina"],
    studentRelevance: "Improves revision quality, exam preparation, and long-term learning retention.",
    youthRelevance: "Builds consistency in worship, career discipline, and emotional stability.",
    relatedTopics: ["time-management", "laziness", "dopamine-distraction"],
  },
  "exam-anxiety": {
    whyMattersToday: "Performance pressure can turn preparation into panic and overwhelm.",
    currentChallenges: ["Fear of failure", "Comparison loops", "Sleep disruption", "Overthinking"],
    studentRelevance: "Transforms stress into structured preparation and emotional composure.",
    youthRelevance: "Helps with confidence and resilience in any high-stakes phase of life.",
    relatedTopics: ["focus-productivity", "time-management", "overthinking"],
  },
  "social-media-addiction": {
    whyMattersToday: "Continuous feeds hijack focus, mood, and identity formation.",
    currentChallenges: ["Time leakage", "Low concentration", "Comparison anxiety", "Validation dependency"],
    studentRelevance: "Recovers study hours and cognitive clarity.",
    youthRelevance: "Protects emotional health and self-worth from algorithmic pressure.",
    relatedTopics: ["dopamine-distraction", "validation-addiction", "self-respect"],
  },
  "purpose": {
    whyMattersToday: "Without purpose, people drift into trends, comparison, and burnout.",
    currentChallenges: ["Identity confusion", "Career pressure", "Lack of direction", "Motivational instability"],
    studentRelevance: "Connects learning with long-term contribution and meaning.",
    youthRelevance: "Anchors identity and decisions in values rather than social pressure.",
    relatedTopics: ["identity-crisis", "career-pressure", "self-discipline"],
  },
};
