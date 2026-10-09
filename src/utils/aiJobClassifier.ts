export interface AIJobClassificationResult {
  isSkilledJob: boolean;
  detectedProfession?: string;
  reason?: string;
  warningMessage?: string;
  suggestedCategory?: string;
  confidenceScore: number;
}

const SKILLED_KEYWORDS_AND_TRADES = [
  { trade: 'Electrician', keywords: ['electrician', 'electrical', 'wiring', 'mcb', 'inverter repair', 'fuse box', 'phase wiring', 'appliance wiring', 'switchboard', 'voltage', 'circuit repair'] },
  { trade: 'Plumber', keywords: ['plumber', 'plumbing', 'pipe leak', 'drainage', 'sanitary', 'tap repair', 'bathroom fitting', 'water motor', 'pressure pump', 'concealed pipe'] },
  { trade: 'Professional Chef / Cook', keywords: ['chef', 'professional cook', 'culinary', 'gourmet cooking', 'head cook', 'pastry chef', 'sous chef', 'tandoor specialist'] },
  { trade: 'Painter', keywords: ['painter', 'painting', 'wall painting', 'whitewash', 'distemper', 'texture painting', 'waterproofing painter', 'spray paint'] },
  { trade: 'Technician / Appliance Repair', keywords: ['technician', 'ac repair', 'ac service', 'refrigerator repair', 'washing machine repair', 'tv repair', 'pcb repair', 'hvac repair', 'compressor'] },
  { trade: 'Carpenter', keywords: ['carpenter', 'carpentry', 'woodwork', 'furniture making', 'joinery', 'door framing', 'hydraulic hinges'] },
  { trade: 'Specialized Repair', keywords: ['specialized repair', 'welding', 'welder', 'mason', 'masonry', 'tile laying', 'flooring specialist'] },
];

/**
 * AI Classifier analyzing proposed job content for unauthorized specialized skills in Micro-Gig
 */
export async function classifyGigJobAI(
  title: string,
  description: string,
  skills: string[]
): Promise<AIJobClassificationResult> {
  // Simulate AI evaluation inference latency
  await new Promise((resolve) => setTimeout(resolve, 350));

  const textToScan = `${title} ${description} ${skills.join(' ')}`.toLowerCase();

  for (const item of SKILLED_KEYWORDS_AND_TRADES) {
    for (const kw of item.keywords) {
      // Check word boundary or substring match
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(textToScan) || textToScan.includes(kw)) {
        return {
          isSkilledJob: true,
          detectedProfession: item.trade,
          confidenceScore: 0.96,
          reason: `Detected specialized trade indicator: "${kw}".`,
          warningMessage: 'This job appears to require specialized experience. Gig Hosts cannot post experienced professional services in the Micro-Gig category. Please use the Local Services category instead.',
          suggestedCategory: 'Local Services Marketplace',
        };
      }
    }
  }

  return {
    isSkilledJob: false,
    confidenceScore: 0.98,
    reason: 'Job aligns with micro-gig entry-level criteria (event assistance, general packing, retail tagging, crowd handling).',
  };
}
