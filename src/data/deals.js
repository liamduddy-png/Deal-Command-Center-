export const PIPELINE_DEALS = [
  // === GUT (8 deals) ===
  { id: 1, company: "Bell Construction", contact: "Ben Lambert", amount: 39525, stage: "Gut", closeDate: "2026-02-10", health: "warm", lastActivity: "2 days ago", ms: { change: "committed", technical: "fit", pricing: "aware", commercial: "nda", security: "started" } },
  { id: 2, company: "Mascaro Construction", contact: "Jason Rivera, VP Ops", amount: 52000, stage: "Gut", closeDate: "2026-02-18", health: "hot", lastActivity: "Today", ms: { change: "committed", technical: "fit", pricing: "aware", commercial: "nda", security: "started" } },
  { id: 3, company: "Brasfield & Gorrie", contact: "Mark Thompson, CTO", amount: 85000, stage: "Gut", closeDate: "2026-02-25", health: "warm", lastActivity: "1 day ago", ms: { change: "committed", technical: "fit", pricing: "aware", commercial: "nda", security: "not_started" } },
  { id: 4, company: "Robins & Morton", contact: "David Chen, Dir. Innovation", amount: 62000, stage: "Gut", closeDate: "2026-03-01", health: "hot", lastActivity: "Today", ms: { change: "committed", technical: "fit", pricing: "aware", commercial: "nda", security: "started" } },
  { id: 5, company: "Hensel Phelps", contact: "Sarah Williams, VP Tech", amount: 95000, stage: "Gut", closeDate: "2026-02-28", health: "warm", lastActivity: "3 days ago", ms: { change: "committed", technical: "eval", pricing: "aware", commercial: "nda", security: "not_started" } },
  { id: 6, company: "Whiting-Turner", contact: "Kevin O'Brien, Ops Dir.", amount: 78000, stage: "Gut", closeDate: "2026-03-05", health: "warm", lastActivity: "2 days ago", ms: { change: "committed", technical: "fit", pricing: "aware", commercial: null, security: "started" } },
  { id: 7, company: "Ryan Companies", contact: "Lisa Park, VP Construction", amount: 47000, stage: "Gut", closeDate: "2026-03-10", health: "hot", lastActivity: "Today", ms: { change: "committed", technical: "fit", pricing: "aware", commercial: "nda", security: "started" } },
  { id: 8, company: "Swinerton", contact: "Tom Garcia, Innovation Lead", amount: 55000, stage: "Gut", closeDate: "2026-03-12", health: "warm", lastActivity: "1 day ago", ms: { change: "committed", technical: "eval", pricing: "aware", commercial: null, security: "not_started" } },

  // === BEST CASE (12 deals) ===
  { id: 9, company: "ERMCO", contact: "Tech Team", amount: 100000, stage: "Best Case", closeDate: "2026-01-30", health: "hot", lastActivity: "1 day ago", ms: { change: "committed", technical: "eval", pricing: "not_given", commercial: null, security: "not_started" } },
  { id: 10, company: "LIV Development", contact: "Exec Team", amount: 35000, stage: "Best Case", closeDate: "2026-02-20", health: "warm", lastActivity: "3 days ago", ms: { change: "committed", technical: "fit", pricing: "aware", commercial: null, security: "not_started" } },
  { id: 11, company: "AVB", contact: "Ops Lead", amount: 55000, stage: "Best Case", closeDate: "2026-03-13", health: "warm", lastActivity: "1 day ago", ms: { change: "committed", technical: "eval", pricing: "not_given", commercial: null, security: "not_started" } },
  { id: 12, company: "McCarthy Building", contact: "Jim Walsh, VP Preconstruction", amount: 72000, stage: "Best Case", closeDate: "2026-03-20", health: "warm", lastActivity: "2 days ago", ms: { change: "committed", technical: "eval", pricing: "aware", commercial: null, security: "not_started" } },
  { id: 13, company: "Skanska USA", contact: "Anna Lindberg, Dir. Digital", amount: 120000, stage: "Best Case", closeDate: "2026-03-25", health: "hot", lastActivity: "Today", ms: { change: "committed", technical: "fit", pricing: "aware", commercial: null, security: "not_started" } },
  { id: 14, company: "PCL Construction", contact: "Mike Stevens, VP Technology", amount: 88000, stage: "Best Case", closeDate: "2026-03-15", health: "warm", lastActivity: "4 days ago", ms: { change: "committed", technical: "eval", pricing: "not_given", commercial: null, security: null } },
  { id: 15, company: "JE Dunn", contact: "Rachel Torres, Innovation Mgr", amount: 45000, stage: "Best Case", closeDate: "2026-04-01", health: "warm", lastActivity: "2 days ago", ms: { change: "committed", technical: "eval", pricing: "not_given", commercial: null, security: null } },
  { id: 16, company: "Mortenson", contact: "Eric Johnson, VP Ops", amount: 93000, stage: "Best Case", closeDate: "2026-03-30", health: "hot", lastActivity: "1 day ago", ms: { change: "committed", technical: "fit", pricing: "aware", commercial: null, security: "not_started" } },
  { id: 17, company: "Shawmut Design", contact: "Priya Patel, CTO", amount: 38000, stage: "Best Case", closeDate: "2026-04-10", health: "warm", lastActivity: "3 days ago", ms: { change: "committed", technical: "eval", pricing: "not_given", commercial: null, security: null } },
  { id: 18, company: "Structure Tone", contact: "Brian Kelly, Dir. Ops", amount: 64000, stage: "Best Case", closeDate: "2026-04-15", health: "cold", lastActivity: "9 days ago", ms: { change: "committed", technical: "eval", pricing: "not_given", commercial: null, security: null } },
  { id: 19, company: "Consigli Construction", contact: "Tony Romano, VP Field Ops", amount: 42000, stage: "Best Case", closeDate: "2026-04-05", health: "warm", lastActivity: "2 days ago", ms: { change: "committed", technical: "eval", pricing: "not_given", commercial: null, security: null } },
  { id: 20, company: "Webcor Builders", contact: "Diana Chen, Innovation Dir.", amount: 57000, stage: "Best Case", closeDate: "2026-04-20", health: "warm", lastActivity: "1 day ago", ms: { change: "committed", technical: "eval", pricing: "aware", commercial: null, security: null } },

  // === MEETING QUALIFIED (14 deals) ===
  { id: 21, company: "Carter Group, LLC", contact: "Seth Corley", amount: 20000, stage: "Meeting Qualified", closeDate: "2026-04-30", health: "cold", lastActivity: "8 days ago", ms: { change: "not_validated", technical: null, pricing: null, commercial: null, security: null } },
  { id: 22, company: "Ferguson Construction", contact: "Team", amount: 20000, stage: "Meeting Qualified", closeDate: "2026-04-27", health: "warm", lastActivity: "3 days ago", ms: { change: "committed", technical: "eval", pricing: "not_given", commercial: null, security: null } },
  { id: 23, company: "Jostin Construction", contact: "PM Team", amount: 20000, stage: "Meeting Qualified", closeDate: "2026-02-20", health: "hot", lastActivity: "Today", ms: { change: "committed", technical: "fit", pricing: "aware", commercial: null, security: null } },
  { id: 24, company: "Leapley Construction", contact: "Ops", amount: 20000, stage: "Meeting Qualified", closeDate: "2026-04-27", health: "warm", lastActivity: "2 days ago", ms: { change: "committed", technical: "eval", pricing: "not_given", commercial: null, security: null } },
  { id: 25, company: "Tonn and Blank", contact: "Leadership", amount: 20000, stage: "Meeting Qualified", closeDate: "2026-03-20", health: "cold", lastActivity: "12 days ago", ms: { change: "not_validated", technical: null, pricing: null, commercial: null, security: null } },
  { id: 26, company: "Performance Services", contact: "Ops Team", amount: 20000, stage: "Meeting Qualified", closeDate: "2026-03-03", health: "warm", lastActivity: "4 days ago", ms: { change: "committed", technical: "eval", pricing: "not_given", commercial: null, security: null } },
  { id: 27, company: "Sundt Construction", contact: "Carlos Mendez, VP Field", amount: 35000, stage: "Meeting Qualified", closeDate: "2026-05-10", health: "warm", lastActivity: "1 day ago", ms: { change: "committed", technical: "eval", pricing: null, commercial: null, security: null } },
  { id: 28, company: "Gilbane Building", contact: "Patrick O'Malley, Dir. Tech", amount: 48000, stage: "Meeting Qualified", closeDate: "2026-05-15", health: "warm", lastActivity: "3 days ago", ms: { change: "committed", technical: "eval", pricing: "not_given", commercial: null, security: null } },
  { id: 29, company: "Kiewit", contact: "Amanda Hughes, Ops Mgr", amount: 110000, stage: "Meeting Qualified", closeDate: "2026-05-20", health: "hot", lastActivity: "Today", ms: { change: "committed", technical: "eval", pricing: null, commercial: null, security: null } },
  { id: 30, company: "DPR Construction", contact: "Steve Lee, Innovation Lead", amount: 67000, stage: "Meeting Qualified", closeDate: "2026-05-25", health: "warm", lastActivity: "2 days ago", ms: { change: "committed", technical: null, pricing: null, commercial: null, security: null } },
  { id: 31, company: "Tutor Perini", contact: "Frank DeLuca, VP Ops", amount: 82000, stage: "Meeting Qualified", closeDate: "2026-06-01", health: "cold", lastActivity: "10 days ago", ms: { change: "not_validated", technical: null, pricing: null, commercial: null, security: null } },
  { id: 32, company: "Balfour Beatty US", contact: "Helen Nguyen, CTO", amount: 73000, stage: "Meeting Qualified", closeDate: "2026-05-30", health: "warm", lastActivity: "1 day ago", ms: { change: "committed", technical: "eval", pricing: null, commercial: null, security: null } },
  { id: 33, company: "AECOM Tishman", contact: "Robert Kim, Sr. PM", amount: 90000, stage: "Meeting Qualified", closeDate: "2026-06-10", health: "warm", lastActivity: "3 days ago", ms: { change: "committed", technical: null, pricing: null, commercial: null, security: null } },
  { id: 34, company: "Lendlease US", contact: "James Mitchell, Dir. Digital", amount: 105000, stage: "Meeting Qualified", closeDate: "2026-06-15", health: "warm", lastActivity: "2 days ago", ms: { change: "committed", technical: "eval", pricing: null, commercial: null, security: null } },

  // === MEETING SET (12 deals) ===
  { id: 35, company: "Clayco", contact: "VP Technology", amount: 45000, stage: "Meeting Set", closeDate: "2026-05-15", health: "warm", lastActivity: "1 day ago", ms: { change: null, technical: null, pricing: null, commercial: null, security: null } },
  { id: 36, company: "Holder Construction", contact: "Director of Ops", amount: 30000, stage: "Meeting Set", closeDate: "2026-05-01", health: "warm", lastActivity: "Today", ms: { change: null, technical: null, pricing: null, commercial: null, security: null } },
  { id: 37, company: "Barton Malow", contact: "Innovation Team", amount: 40000, stage: "Meeting Set", closeDate: "2026-05-20", health: "hot", lastActivity: "Today", ms: { change: null, technical: null, pricing: null, commercial: null, security: null } },
  { id: 38, company: "Clark Construction", contact: "Jennifer Adams, VP Preconstruction", amount: 98000, stage: "Meeting Set", closeDate: "2026-06-20", health: "warm", lastActivity: "Today", ms: { change: null, technical: null, pricing: null, commercial: null, security: null } },
  { id: 39, company: "Turner Construction", contact: "Michael Brown, Dir. Innovation", amount: 130000, stage: "Meeting Set", closeDate: "2026-06-25", health: "hot", lastActivity: "Today", ms: { change: null, technical: null, pricing: null, commercial: null, security: null } },
  { id: 40, company: "Bechtel", contact: "Laura Martinez, VP Digital", amount: 150000, stage: "Meeting Set", closeDate: "2026-07-01", health: "warm", lastActivity: "1 day ago", ms: { change: null, technical: null, pricing: null, commercial: null, security: null } },
  { id: 41, company: "Fluor Corporation", contact: "Daniel Wright, CTO", amount: 115000, stage: "Meeting Set", closeDate: "2026-07-10", health: "warm", lastActivity: "2 days ago", ms: { change: null, technical: null, pricing: null, commercial: null, security: null } },
  { id: 42, company: "Walsh Group", contact: "Sean Walsh, VP Technology", amount: 68000, stage: "Meeting Set", closeDate: "2026-06-30", health: "hot", lastActivity: "Today", ms: { change: null, technical: null, pricing: null, commercial: null, security: null } },
  { id: 43, company: "Granite Construction", contact: "Amy Foster, Innovation Mgr", amount: 54000, stage: "Meeting Set", closeDate: "2026-07-05", health: "warm", lastActivity: "1 day ago", ms: { change: null, technical: null, pricing: null, commercial: null, security: null } },
  { id: 44, company: "Jacobs Engineering", contact: "Chris Taylor, Dir. Construction Tech", amount: 87000, stage: "Meeting Set", closeDate: "2026-07-15", health: "warm", lastActivity: "3 days ago", ms: { change: null, technical: null, pricing: null, commercial: null, security: null } },
  { id: 45, company: "HITT Contracting", contact: "Nicole Stewart, VP Ops", amount: 42000, stage: "Meeting Set", closeDate: "2026-06-28", health: "warm", lastActivity: "2 days ago", ms: { change: null, technical: null, pricing: null, commercial: null, security: null } },
  { id: 46, company: "Suffolk Construction", contact: "Dan Murphy, Chief Innovation Officer", amount: 76000, stage: "Meeting Set", closeDate: "2026-07-20", health: "hot", lastActivity: "Today", ms: { change: null, technical: null, pricing: null, commercial: null, security: null } },
];

export const EXPANSION_DEALS = [
  { id: 101, company: "F&R Construction Group", contact: "Site Team", arr: 59742, renewalDate: "2026-11-10", health: "healthy", usage: "High", risk: "None identified", projects: 4 },
  { id: 102, company: "MCM", contact: "PM Team", arr: 10500, renewalDate: "2026-11-19", health: "at_risk", usage: "Medium", risk: "Low adoption on Project B", projects: 2 },
  { id: 103, company: "Linkous Construction", contact: "Ops Lead", arr: 24252, renewalDate: "2026-12-18", health: "healthy", usage: "High", risk: "Budget cycle timing", projects: 3 },
  { id: 104, company: "AVB", contact: "VP Ops", arr: 15000, renewalDate: "2026-10-31", health: "healthy", usage: "High", risk: "None", projects: 5 },
  { id: 105, company: "ERMCO", contact: "Director", arr: 13350, renewalDate: "2026-11-10", health: "monitor", usage: "Low", risk: "Champion left company", projects: 2 },
  { id: 106, company: "Del Valle Group", contact: "Owner", arr: 25000, renewalDate: "2027-01-06", health: "healthy", usage: "High", risk: "None", projects: 6 },
  { id: 107, company: "Bernards", contact: "Maria Santos, Ops Dir.", arr: 31500, renewalDate: "2026-12-01", health: "healthy", usage: "High", risk: "None", projects: 4 },
  { id: 108, company: "Dome Construction", contact: "Greg Palmer, VP Field Ops", arr: 18000, renewalDate: "2027-02-15", health: "monitor", usage: "Medium", risk: "New CTO evaluating alternatives", projects: 3 },
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
