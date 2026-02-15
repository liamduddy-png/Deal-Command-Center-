export const PIPELINE_DEALS = [
  { id: 1, company: "Bell Construction", contact: "Ben Lambert", amount: 39525, stage: "Gut", closeDate: "2026-02-10", health: "warm", lastActivity: "2 days ago", ms: { change: "committed", technical: "fit", pricing: "aware", commercial: "nda", security: "started" } },
  { id: 2, company: "ERMCO", contact: "Tech Team", amount: 100000, stage: "Best Case", closeDate: "2026-01-30", health: "hot", lastActivity: "1 day ago", ms: { change: "committed", technical: "eval", pricing: "not_given", commercial: null, security: "not_started" } },
  { id: 3, company: "LIV Development", contact: "Exec Team", amount: 35000, stage: "Best Case", closeDate: "2026-02-20", health: "warm", lastActivity: "3 days ago", ms: { change: "committed", technical: "fit", pricing: "aware", commercial: null, security: "not_started" } },
  { id: 4, company: "AVB", contact: "Ops Lead", amount: 55000, stage: "Best Case", closeDate: "2026-03-13", health: "warm", lastActivity: "1 day ago", ms: { change: "committed", technical: "eval", pricing: "not_given", commercial: null, security: "not_started" } },
  { id: 5, company: "Carter Group, LLC", contact: "Seth Corley", amount: 20000, stage: "Meeting Qualified", closeDate: "2026-04-30", health: "cold", lastActivity: "8 days ago", ms: { change: "not_validated", technical: null, pricing: null, commercial: null, security: null } },
  { id: 6, company: "Ferguson Construction", contact: "Team", amount: 20000, stage: "Meeting Qualified", closeDate: "2026-04-27", health: "warm", lastActivity: "3 days ago", ms: { change: "committed", technical: "eval", pricing: "not_given", commercial: null, security: null } },
  { id: 7, company: "Jostin Construction", contact: "PM Team", amount: 20000, stage: "Meeting Qualified", closeDate: "2026-02-20", health: "hot", lastActivity: "Today", ms: { change: "committed", technical: "fit", pricing: "aware", commercial: null, security: null } },
  { id: 8, company: "Leapley Construction", contact: "Ops", amount: 20000, stage: "Meeting Qualified", closeDate: "2026-04-27", health: "warm", lastActivity: "2 days ago", ms: { change: "committed", technical: "eval", pricing: "not_given", commercial: null, security: null } },
  { id: 9, company: "Tonn and Blank", contact: "Leadership", amount: 20000, stage: "Meeting Qualified", closeDate: "2026-03-20", health: "cold", lastActivity: "12 days ago", ms: { change: "not_validated", technical: null, pricing: null, commercial: null, security: null } },
  { id: 10, company: "Performance Services", contact: "Ops Team", amount: 20000, stage: "Meeting Qualified", closeDate: "2026-03-03", health: "warm", lastActivity: "4 days ago", ms: { change: "committed", technical: "eval", pricing: "not_given", commercial: null, security: null } },
  { id: 11, company: "Clayco", contact: "VP Technology", amount: 45000, stage: "Meeting Set", closeDate: "2026-05-15", health: "warm", lastActivity: "1 day ago", ms: { change: null, technical: null, pricing: null, commercial: null, security: null } },
  { id: 12, company: "Holder Construction", contact: "Director of Ops", amount: 30000, stage: "Meeting Set", closeDate: "2026-05-01", health: "warm", lastActivity: "Today", ms: { change: null, technical: null, pricing: null, commercial: null, security: null } },
  { id: 13, company: "Barton Malow", contact: "Innovation Team", amount: 40000, stage: "Meeting Set", closeDate: "2026-05-20", health: "hot", lastActivity: "Today", ms: { change: null, technical: null, pricing: null, commercial: null, security: null } },
];

export const EXPANSION_DEALS = [
  { id: 101, company: "F&R Construction Group", contact: "Site Team", arr: 59742, renewalDate: "2026-11-10", health: "healthy", usage: "High", risk: "None identified", projects: 4 },
  { id: 102, company: "MCM", contact: "PM Team", arr: 10500, renewalDate: "2026-11-19", health: "at_risk", usage: "Medium", risk: "Low adoption on Project B", projects: 2 },
  { id: 103, company: "Linkous Construction", contact: "Ops Lead", arr: 24252, renewalDate: "2026-12-18", health: "healthy", usage: "High", risk: "Budget cycle timing", projects: 3 },
  { id: 104, company: "AVB", contact: "VP Ops", arr: 15000, renewalDate: "2026-10-31", health: "healthy", usage: "High", risk: "None", projects: 5 },
  { id: 105, company: "ERMCO", contact: "Director", arr: 13350, renewalDate: "2026-11-10", health: "monitor", usage: "Low", risk: "Champion left company", projects: 2 },
  { id: 106, company: "Del Valle Group", contact: "Owner", arr: 25000, renewalDate: "2027-01-06", health: "healthy", usage: "High", risk: "None", projects: 6 },
];

export const STAGES = ["Gut", "Best Case", "Meeting Qualified", "Meeting Set"];

export const MILESTONE_KEYS = ["change", "technical", "pricing", "commercial", "security"];

export const HEALTH_COLORS = {
  hot: "bg-green-500",
  warm: "bg-amber-500",
  cold: "bg-red-500",
  healthy: "bg-green-500",
  at_risk: "bg-red-500",
  monitor: "bg-amber-500",
};

export const HEALTH_TEXT_COLORS = {
  hot: "text-green-400",
  warm: "text-amber-400",
  cold: "text-red-400",
  healthy: "text-green-400",
  at_risk: "text-red-400",
  monitor: "text-amber-400",
};

export const MILESTONE_COLORS = {
  committed: "bg-green-500",
  fit: "bg-green-500",
  closure: "bg-green-500",
  complete: "bg-green-500",
  msa: "bg-green-500",
  not_validated: "bg-red-500",
  eval: "bg-amber-500",
  aware: "bg-amber-500",
  nda: "bg-amber-500",
  started: "bg-amber-500",
  not_given: "bg-slate-600",
  not_started: "bg-slate-600",
};
