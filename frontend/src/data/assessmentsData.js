/**
 * Raah Assessment Center Catalog
 * 15 specialized psychometric and vocational assessments organized into 5 core dimensions.
 */

export const ASSESSMENT_CATEGORIES = [
  {
    id: 'all',
    label: 'All Assessments',
    icon: 'apps',
    color: '#4f46e5',
  },
  {
    id: 'cognitive',
    label: 'Cognitive/Analytical',
    icon: 'psychology',
    color: '#4f46e5',
    tagline: 'Measure systematic reasoning, pattern recognition, and problem framing.',
  },
  {
    id: 'interest',
    label: 'Interest/Passion',
    icon: 'explore',
    color: '#0284c7',
    tagline: 'Uncover intrinsic curiosities and high-affinity industry verticals.',
  },
  {
    id: 'personality',
    label: 'Personality/Work Style',
    icon: 'badge',
    color: '#7c3aed',
    tagline: 'Map operational behaviors, execution tempo, and collaboration preferences.',
  },
  {
    id: 'values',
    label: 'Values-Based',
    icon: 'favorite',
    color: '#db2777',
    tagline: 'Align your career trajectory with core motives, autonomy, and impact.',
  },
  {
    id: 'skills',
    label: 'Skills/Strengths',
    icon: 'construction',
    color: '#ea580c',
    tagline: 'Pinpoint signature execution strengths and high-leverage competencies.',
  },
]

export const ASSESSMENTS = [
  // ================= 1. Cognitive/Analytical =================
  {
    id: 'reasoning-compass',
    name: 'Reasoning Compass',
    categoryId: 'cognitive',
    categoryName: 'Cognitive/Analytical',
    tagline: 'Structured logic, pattern navigation, and deductive problem solving.',
    description:
      'Evaluates how you deconstruct complex scenarios, recognize underlying systemic patterns, and navigate multi-step logical decisions under uncertainty.',
    duration: '5–7 mins',
    questionsCount: 10,
    icon: 'explore',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    primaryTraits: ['Analytical', 'Building'],
    measures: 'Deductive logic, pattern recognition, quantitative reasoning',
  },
  {
    id: 'logic-lens',
    name: 'Logic Lens',
    categoryId: 'cognitive',
    categoryName: 'Cognitive/Analytical',
    tagline: 'Critical thinking, argument audit, and causal deduction under pressure.',
    description:
      'Tests your ability to separate signal from noise, evaluate contradictory evidence, and identify causal chains in real-world professional contexts.',
    duration: '5–7 mins',
    questionsCount: 10,
    icon: 'biotech',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    primaryTraits: ['Analytical', 'Organized'],
    measures: 'Causal inference, evidence evaluation, objective skepticism',
  },
  {
    id: 'problem-orientation-test',
    name: 'Problem Orientation Test',
    categoryId: 'cognitive',
    categoryName: 'Cognitive/Analytical',
    tagline: 'First-principles breakdown vs holistic conceptual problem framing.',
    description:
      'Identifies whether your natural cognitive instinct leans toward root-cause mathematical decomposition or integrative big-picture synthesis.',
    duration: '5–7 mins',
    questionsCount: 10,
    icon: 'tune',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    primaryTraits: ['Analytical', 'Creative'],
    measures: 'First-principles framing, conceptual model building, decomposition',
  },

  // ================= 2. Interest/Passion =================
  {
    id: 'domain-affinity-scan',
    name: 'Domain Affinity Scan',
    categoryId: 'interest',
    categoryName: 'Interest/Passion',
    tagline: 'Pinpoint knowledge sectors and industries that stimulate your focus.',
    description:
      'Discovers your intrinsic curiosity across emerging tech, scientific inquiry, commerce, media, human sciences, and high-craft trades.',
    duration: '5–7 mins',
    questionsCount: 10,
    icon: 'radar',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    primaryTraits: ['Creative', 'Analytical'],
    measures: 'Sector engagement, deep-dive enthusiasm, topical curiosity',
  },
  {
    id: 'interest-mapping-assessment',
    name: 'Interest Mapping Assessment',
    categoryId: 'interest',
    categoryName: 'Interest/Passion',
    tagline: 'Cross-functional interest cluster mapping for optimal career alignment.',
    description:
      'Evaluates which vocational intersections spark the highest motivation when working on extended multi-week initiatives.',
    duration: '5–7 mins',
    questionsCount: 10,
    icon: 'hub',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    primaryTraits: ['Social', 'Creative'],
    measures: 'Interdisciplinary curiosity, task sustainability, intrinsic joy',
  },
  {
    id: 'curiosity-index',
    name: 'Curiosity Index',
    categoryId: 'interest',
    categoryName: 'Interest/Passion',
    tagline: 'Epistemic curiosity and drive to explore frontier, uncharted fields.',
    description:
      'Quantifies your inclination toward continuous experimentation, intellectual wanderlust, and navigating ambiguous, emerging domains.',
    duration: '5–7 mins',
    questionsCount: 10,
    icon: 'auto_awesome',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    primaryTraits: ['Creative', 'Analytical'],
    measures: 'Intellectual hunger, exploratory risk tolerance, adaptive learning',
  },

  // ================= 3. Personality/Work Style =================
  {
    id: 'work-personality-profile',
    name: 'Work Personality Profile',
    categoryId: 'personality',
    categoryName: 'Personality/Work Style',
    tagline: 'Behavioral tendencies, collaboration dynamics, and execution style.',
    description:
      'Examines how you communicate with stakeholders, resolve disagreements, handle feedback loops, and structure your daily work output.',
    duration: '5–7 mins',
    questionsCount: 10,
    icon: 'groups',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    primaryTraits: ['Social', 'Leadership'],
    measures: 'Interpersonal synergy, autonomy preferences, conflict resolution',
  },
  {
    id: 'trait-orientation-survey',
    name: 'Trait Orientation Survey',
    categoryId: 'personality',
    categoryName: 'Personality/Work Style',
    tagline: 'Adaptive resilience, pacing under deadlines, and operational grit.',
    description:
      'Reveals how your operational temperament responds to shifting requirements, tight turnaround times, and high-responsibility leadership moments.',
    duration: '5–7 mins',
    questionsCount: 10,
    icon: 'speed',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    primaryTraits: ['Leadership', 'Organized'],
    measures: 'Pressure calibration, execution discipline, accountability',
  },
  {
    id: 'cognitive-style-scan',
    name: 'Cognitive Style Scan',
    categoryId: 'personality',
    categoryName: 'Personality/Work Style',
    tagline: 'Strategic visionary thinking vs high-precision tactical craft.',
    description:
      'Distinguishes whether you thrive steering strategic direction, orchestrating team workflows, or diving into deep, uninterrupted technical execution.',
    duration: '5–7 mins',
    questionsCount: 10,
    icon: 'neurology',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    primaryTraits: ['Building', 'Organized'],
    measures: 'Macro vs micro orientation, craftsmanship, workflow cadence',
  },

  // ================= 4. Values-Based =================
  {
    id: 'purpose-alignment-test',
    name: 'Purpose Alignment Test',
    categoryId: 'values',
    categoryName: 'Values-Based',
    tagline: 'Societal contribution, mission-driven ethics, and human welfare.',
    description:
      'Measures the importance of creating tangible positive externalities for people, local communities, and global sustainability through your career.',
    duration: '5–7 mins',
    questionsCount: 10,
    icon: 'volunteer_activism',
    badgeColor: 'bg-pink-50 text-pink-700 border-pink-200',
    primaryTraits: ['Social', 'Leadership'],
    measures: 'Ethical focus, social equity, mission-first orientation',
  },
  {
    id: 'career-values-inventory',
    name: 'Career Values Inventory',
    categoryId: 'values',
    categoryName: 'Values-Based',
    tagline: 'Trade-off hierarchy: Autonomy, compensation, security, and prestige.',
    description:
      'Ranks non-negotiable career pillars so you can select environments that will satisfy you over 5, 10, and 20-year horizons.',
    duration: '5–7 mins',
    questionsCount: 10,
    icon: 'balance',
    badgeColor: 'bg-pink-50 text-pink-700 border-pink-200',
    primaryTraits: ['Organized', 'Leadership'],
    measures: 'Value hierarchies, career trade-off boundaries, lifestyle design',
  },
  {
    id: 'drive-motivation-profile',
    name: 'Drive & Motivation Profile',
    categoryId: 'values',
    categoryName: 'Values-Based',
    tagline: 'Intrinsic mastery vs external recognition, competition, and rewards.',
    description:
      'Clarifies what fuels your sustained focus: technical craftsmanship, creative freedom, competitive triumph, or collaborative belonging.',
    duration: '5–7 mins',
    questionsCount: 10,
    icon: 'local_fire_department',
    badgeColor: 'bg-pink-50 text-pink-700 border-pink-200',
    primaryTraits: ['Leadership', 'Building'],
    measures: 'Incentive alignment, persistence drivers, self-determination',
  },

  // ================= 5. Skills/Strengths =================
  {
    id: 'strength-signal-assessment',
    name: 'Strength Signal Assessment',
    categoryId: 'skills',
    categoryName: 'Skills/Strengths',
    tagline: 'Natural cognitive leverage points and innate competitive edges.',
    description:
      'Identifies the activities and challenge types where you naturally achieve high velocity and flow without excessive friction.',
    duration: '5–7 mins',
    questionsCount: 10,
    icon: 'workspace_premium',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    primaryTraits: ['Building', 'Analytical'],
    measures: 'Zone of genius, execution momentum, cognitive leverage',
  },
  {
    id: 'skill-fit-scan',
    name: 'Skill Fit Scan',
    categoryId: 'skills',
    categoryName: 'Skills/Strengths',
    tagline: 'Applied competencies across technical, operational, and design domains.',
    description:
      'Audits your current problem-solving toolkit against high-demand modern industry tracks to pinpoint immediate career readiness.',
    duration: '5–7 mins',
    questionsCount: 10,
    icon: 'checklist',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    primaryTraits: ['Organized', 'Building'],
    measures: 'Operational readiness, capability depth, transferrable skills',
  },
  {
    id: 'capability-orientation-test',
    name: 'Capability Orientation Test',
    categoryId: 'skills',
    categoryName: 'Skills/Strengths',
    tagline: 'Tool adoption velocity, problem decompilation, and builder stamina.',
    description:
      'Measures how quickly you pick up new frameworks, deconstruct ambiguous requirements, and deliver working prototypes or solutions.',
    duration: '5–7 mins',
    questionsCount: 10,
    icon: 'rocket_launch',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    primaryTraits: ['Building', 'Leadership'],
    measures: 'Learning agility, technical prototyping, execution grit',
  },
]

export function getAssessmentById(id) {
  return ASSESSMENTS.find((a) => a.id === id || a.name.toLowerCase() === id.toLowerCase())
}

