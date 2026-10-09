import { User, ServiceListing, GigJob } from '../types';

export interface AIMatchResult {
  partner: User;
  service?: ServiceListing;
  rank: number;
  matchScore: number;
  distanceKm: number;
  highlight: string;
  reason: string;
}

export function matchPartnersWithAI(
  query: string,
  allUsers: User[],
  allServices: ServiceListing[],
  currentRole: string
): { replyText: string; matches: AIMatchResult[] } {
  const q = query.toLowerCase();

  // Determine intent: Service Partner matching vs Gig Partner matching
  const isLookingForService = 
    q.includes('electric') || 
    q.includes('plumb') || 
    q.includes('carpent') || 
    q.includes('technician') || 
    q.includes('ac') || 
    q.includes('repair') || 
    q.includes('service') || 
    q.includes('cook') || 
    q.includes('paint') ||
    currentRole === 'client';

  if (isLookingForService) {
    const servicePartners = allUsers.filter(u => u.role === 'service_partner' && !u.isSuspended);
    
    // Score based on skills match, rating, reliability score, and experience
    const scored = servicePartners.map((sp, idx) => {
      const relatedService = allServices.find(s => s.partnerId === sp.id);
      let score = sp.rating * 15 + sp.reliabilityScore * 0.4 + (sp.experienceYears || 1) * 2;
      
      const skillsMatch = sp.skills.some(skill => q.includes(skill.toLowerCase()) || q.includes(sp.role));
      const tradeMatch = relatedService && q.includes(relatedService.trade.toLowerCase());
      if (tradeMatch || skillsMatch) score += 30;

      // Simulated realistic distance
      const distance = 1.8 + idx * 1.4;

      return {
        partner: sp,
        service: relatedService,
        matchScore: Math.min(Math.round(score), 99),
        distanceKm: Number(distance.toFixed(1)),
        rank: 0,
        highlight: `${sp.rating} ★ • ${sp.experienceYears || 5}+ yrs exp • ${distance.toFixed(1)} km away`,
        reason: `High reliability (${sp.reliabilityScore}/100) and verified expertise in ${relatedService?.trade || sp.skills[0]}.`,
      };
    });

    // Rank descending
    scored.sort((a, b) => b.matchScore - a.matchScore);
    const ranked = scored.map((item, idx) => ({ ...item, rank: idx + 1 }));

    return {
      replyText: `I analyzed all verified local service partners near your area based on trade ratings, completed jobs, reliability scores, and proximity. Here are the top ranked recommendations for "${query}":`,
      matches: ranked.slice(0, 3),
    };
  } else {
    // Gig Partner matching for Gig Hosts
    const gigPartners = allUsers.filter(u => u.role === 'gig_partner' && !u.isSuspended);

    const scored = gigPartners.map((gp, idx) => {
      let score = gp.rating * 15 + gp.reliabilityScore * 0.4 + (gp.reviewCount * 0.2);
      if (gp.verificationStatus.kycGovtId) score += 10;
      if (gp.verificationStatus.skillVerified) score += 5;

      const distance = 1.2 + idx * 1.1;

      return {
        partner: gp,
        matchScore: Math.min(Math.round(score), 99),
        distanceKm: Number(distance.toFixed(1)),
        rank: 0,
        highlight: `${gp.rating} ★ • ${gp.reviewCount} jobs completed • ${distance.toFixed(1)} km away`,
        reason: `${gp.reliabilityScore}% reliability score, ${gp.skills.slice(0, 2).join(', ')} experience.`,
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    const ranked = scored.map((item, idx) => ({ ...item, rank: idx + 1 }));

    return {
      replyText: `Found ${ranked.length} verified Gig Partners nearby with exceptional punctuality and high reliability scores:`,
      matches: ranked.slice(0, 3),
    };
  }
}
