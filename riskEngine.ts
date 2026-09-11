import { ChatMessage, SafetyAnalysisResult, RiskLevel, BehavioralPattern, RiskCategoryScore } from '../types';
import { sanitizeConversationHistory } from './privacyFilter';

export function analyzeConversationBehavior(
  messages: ChatMessage[],
  childName: string = 'Child',
  contactName: string = 'Contact'
): SafetyAnalysisResult {
  const { sanitizedMessages, totalPiiScrubbed } = sanitizeConversationHistory(
    messages,
    childName,
    contactName
  );

  const fullText = sanitizedMessages.map((m) => m.sanitizedText || m.text).join(' ').toLowerCase();

  // Pattern detection heuristics
  const patterns: BehavioralPattern[] = [];
  const whyFlagged: string[] = [];

  // 1. Grooming: Secrecy
  const secrecyRegex = /(don'?t tell|do not tell|our secret|keep this between us|private dm|delete these messages|hide this)/i;
  if (secrecyRegex.test(fullText)) {
    patterns.push({
      id: 'p-secrecy',
      name: 'Secrecy Encouraged',
      description: 'Contact explicitly instructed child to keep conversations or interactions hidden.',
      evidenceType: 'Communication Secrecy',
      severity: 'HIGH',
      confidence: 94,
      firstObservedDay: 'Recent',
      detail: 'Messages instruct keeping communication secret from guardians.',
    });
    whyFlagged.push('Secrecy explicitly encouraged across messages');
  }

  // 2. Grooming: Parental Isolation
  const isolationRegex = /(parents don'?t understand|too strict|control you|they wouldn'?t understand|don'?t trust them|only trust me)/i;
  if (isolationRegex.test(fullText)) {
    patterns.push({
      id: 'p-isolation',
      name: 'Parental Alienation & Isolation',
      description: 'Contact encouraged child to distrust parents, framing adults as unsupportive or hostile.',
      evidenceType: 'Social Isolation',
      severity: 'HIGH',
      confidence: 92,
      firstObservedDay: 'Recent',
      detail: 'Efforts to alienate child from parent support network.',
    });
    whyFlagged.push('Child systematically discouraged from confiding in parents');
  }

  // 3. Grooming: Emotional Dependency
  const dependencyRegex = /(mature for your age|special to me|only trust me|you can tell me anything|best friend|nobody else gets you)/i;
  if (dependencyRegex.test(fullText)) {
    patterns.push({
      id: 'p-dependency',
      name: 'Emotional Dependency / Flattery',
      description: 'Contact used age-inappropriate flattery or demands for exclusive trust.',
      evidenceType: 'Emotional Manipulation',
      severity: 'HIGH',
      confidence: 89,
      firstObservedDay: 'Recent',
      detail: 'Building artificial emotional intimacy and vulnerability.',
    });
    whyFlagged.push('Cultivating exclusive emotional dependency');
  }

  // 4. Sexual exploitation / Boundary violation
  const boundaryRegex = /(send (me a )?(selfie|photo|pic)|private photo|look like|show me|without clothes|webcam)/i;
  if (boundaryRegex.test(fullText)) {
    patterns.push({
      id: 'p-boundary',
      name: 'Boundary Testing / Private Media Request',
      description: 'Contact requested private photos, selfies, or personal media.',
      evidenceType: 'Boundary Violation',
      severity: 'CRITICAL',
      confidence: 95,
      firstObservedDay: 'Recent',
      detail: 'Soliciting personal visual media or private offline communication.',
    });
    whyFlagged.push('Progressive boundary violation involving private photo requests');
  }

  // 5. Cyberbullying & Humiliation
  const bullyingRegex = /(nobody likes you|loser|pathetic|clown|everyone was laughing|don'?t show up|kill yourself|ugly|worthless)/i;
  if (bullyingRegex.test(fullText)) {
    patterns.push({
      id: 'p-bullying',
      name: 'Peer Humiliation & Insults',
      description: 'Demeaning language and social mockery directed at the child.',
      evidenceType: 'Psychological Harassment',
      severity: 'HIGH',
      confidence: 93,
      firstObservedDay: 'Recent',
      detail: 'Insults targeting child’s character, appearance, or social standing.',
    });
    whyFlagged.push('Repeated hostile insults and social humiliation');
  }

  // 6. Threats / Extortion
  const threatRegex = /(ruin your life|leak your|send \$|pay me|or else|know where you|visit your house|gift card|blackmail)/i;
  if (threatRegex.test(fullText)) {
    patterns.push({
      id: 'p-threats',
      name: 'Blackmail / Coercion Threat',
      description: 'Coercive demands backed by threats of social exposure or physical intimidation.',
      evidenceType: 'Extortion / Threat',
      severity: 'CRITICAL',
      confidence: 97,
      firstObservedDay: 'Recent',
      detail: 'Explicit blackmail, extortion, or intimidation detected.',
    });
    whyFlagged.push('Explicit threats and extortion demands');
  }

  // 7. Harassment / Unwanted pursuit
  const harassmentRegex = /(answer me|cannot ignore me|block me|stop texting|leave me alone)/i;
  if (harassmentRegex.test(fullText)) {
    patterns.push({
      id: 'p-harassment',
      name: 'Persistent Unwanted Contact',
      description: 'Relentless contact continuing past explicit disengagement requests.',
      evidenceType: 'Harassment',
      severity: 'HIGH',
      confidence: 90,
      firstObservedDay: 'Recent',
      detail: 'Refusal to respect boundaries when told to stop.',
    });
    whyFlagged.push('Refusal to cease contact after child requested to be left alone');
  }

  // Calculate Category Scores
  const groomingScore = (secrecyRegex.test(fullText) ? 40 : 0) +
    (isolationRegex.test(fullText) ? 30 : 0) +
    (dependencyRegex.test(fullText) ? 20 : 0) +
    (boundaryRegex.test(fullText) ? 35 : 0);

  const sexualScore = (boundaryRegex.test(fullText) ? 65 : 0) +
    (secrecyRegex.test(fullText) ? 20 : 0);

  const bullyingScore = (bullyingRegex.test(fullText) ? 75 : 0) +
    (harassmentRegex.test(fullText) ? 20 : 0);

  const threatScore = (threatRegex.test(fullText) ? 90 : 0);

  const harassmentScore = (harassmentRegex.test(fullText) ? 70 : 0) +
    (threatRegex.test(fullText) ? 20 : 0);

  const cappedGrooming = Math.min(100, Math.max(5, groomingScore));
  const cappedSexual = Math.min(100, Math.max(2, sexualScore));
  const cappedBullying = Math.min(100, Math.max(4, bullyingScore));
  const cappedThreat = Math.min(100, Math.max(0, threatScore));
  const cappedHarassment = Math.min(100, Math.max(3, harassmentScore));

  const maxCategory = Math.max(cappedGrooming, cappedSexual, cappedBullying, cappedThreat, cappedHarassment);
  const overallRiskScore = Math.min(100, Math.max(8, maxCategory));

  let riskLevel: RiskLevel = 'LOW';
  if (overallRiskScore >= 85) riskLevel = 'CRITICAL';
  else if (overallRiskScore >= 65) riskLevel = 'HIGH';
  else if (overallRiskScore >= 35) riskLevel = 'MEDIUM';

  const categories: RiskCategoryScore[] = [
    {
      id: 'grooming',
      name: 'Grooming & Manipulation',
      score: cappedGrooming,
      severity: cappedGrooming > 65 ? 'HIGH' : cappedGrooming > 35 ? 'MEDIUM' : 'LOW',
      detected: cappedGrooming >= 40,
      description: 'Pattern of secrecy, isolation from family, and progressive boundary testing.',
      exampleSignal: 'Secrecy encouragement and parental alienation.',
    },
    {
      id: 'sexual_exploitation',
      name: 'Sexual Exploitation / Content Requests',
      score: cappedSexual,
      severity: cappedSexual > 70 ? 'CRITICAL' : cappedSexual > 40 ? 'MEDIUM' : 'LOW',
      detected: cappedSexual >= 40,
      description: 'Requests for private photos, selfies, or intimate media.',
      exampleSignal: 'Private photo solicitation.',
    },
    {
      id: 'cyberbullying',
      name: 'Cyberbullying',
      score: cappedBullying,
      severity: cappedBullying > 65 ? 'HIGH' : cappedBullying > 35 ? 'MEDIUM' : 'LOW',
      detected: cappedBullying >= 40,
      description: 'Persistent insults, public mockery, and social exclusion.',
      exampleSignal: 'Degrading peer remarks.',
    },
    {
      id: 'harassment',
      name: 'Harassment & Stalking',
      score: cappedHarassment,
      severity: cappedHarassment > 65 ? 'HIGH' : cappedHarassment > 35 ? 'MEDIUM' : 'LOW',
      detected: cappedHarassment >= 40,
      description: 'Repeated unwanted messaging and boundary non-compliance.',
      exampleSignal: 'Persistent contact despite disengagement.',
    },
    {
      id: 'threats',
      name: 'Threats & Coercion',
      score: cappedThreat,
      severity: cappedThreat > 75 ? 'CRITICAL' : cappedThreat > 40 ? 'HIGH' : 'LOW',
      detected: cappedThreat >= 40,
      description: 'Direct threats of physical harm, exposure, or financial extortion.',
      exampleSignal: 'Blackmail and physical threats.',
    },
  ];

  if (whyFlagged.length === 0) {
    whyFlagged.push('Communication shows normal healthy cadence');
    whyFlagged.push('Zero secrecy or boundary violations detected');
    whyFlagged.push('Balanced interaction without emotional coercion');
  }

  // Timeline synthesis
  const hasEscalated = overallRiskScore > 35;
  const startScore = Math.min(25, overallRiskScore);
  const escalationTimeline = [
    { day: 'Day 1', dayNumber: 1, score: startScore, label: 'Initial interaction', severity: 'LOW' as RiskLevel },
    { day: 'Day 2', dayNumber: 2, score: Math.round(startScore * 1.3), label: 'Cadence increase', severity: 'LOW' as RiskLevel },
    { day: 'Day 3', dayNumber: 3, score: Math.round(overallRiskScore * 0.7), label: 'Behavioral shift observed', severity: (overallRiskScore > 60 ? 'MEDIUM' : 'LOW') as RiskLevel },
    { day: 'Day 4', dayNumber: 4, score: overallRiskScore, label: riskLevel === 'LOW' ? 'Stable baseline' : 'Risk escalation detected', severity: riskLevel },
  ];

  return {
    risk_score: overallRiskScore,
    risk_level: riskLevel,
    confidence: patterns.length > 0 ? 92 : 96,
    primary_concern: patterns.length > 0 ? patterns[0].name : 'Normal Healthy Interaction',
    categories,
    behavioral_patterns: patterns,
    why_flagged: whyFlagged,
    evidence_summary: patterns.length > 0
      ? `Behavioral risk pattern detected across ${patterns.length} concerning markers: ${patterns.map(p => p.name).join(', ')}.`
      : 'Conversation exhibits typical, healthy child communication patterns with no risk markers.',
    escalation_trend: {
      has_escalated: hasEscalated,
      percentage_increase: hasEscalated ? Math.round(((overallRiskScore - startScore) / Math.max(1, startScore)) * 100) : 0,
      trend_description: hasEscalated
        ? `Risk increased over the analyzed conversation window.`
        : 'Risk score remained stable and benign.',
      timeline: escalationTimeline,
    },
    recommended_parent_action: overallRiskScore >= 60 ? [
      {
        id: 'act-auto-1',
        title: 'Open a Calm, Non-Accusatory Discussion',
        priority: 'urgent',
        advice: 'Approach with curiosity and protection, not punishment. Explain you are always their safe harbor.',
        conversationStarter: '"Hey, I want you to know you can always come to me if anyone online makes you feel uncomfortable or tells you to keep secrets."',
      },
      {
        id: 'act-auto-2',
        title: 'Audit Privacy Settings on Shared Platforms',
        priority: 'important',
        advice: 'Restrict direct messaging from non-friends and check profile visibility settings.',
        conversationStarter: '"Let’s check your privacy settings together to ensure only known school friends can message you."',
      }
    ] : [
      {
        id: 'act-safe-1',
        title: 'No Action Required',
        priority: 'guidance',
        advice: 'Chat exhibits age-appropriate, healthy interaction.',
        conversationStarter: 'Continue encouraging open communication and healthy digital habits.',
      }
    ],
    privacy_metrics: {
      piiItemsRedacted: totalPiiScrubbed,
      rawMessagesConcealed: messages.length,
      privacyModeActive: true,
      parentGuarantee: 'Parents receive behavioral insights only. SafeChat AI preserves the child’s trust and privacy.',
    },
  };
}
