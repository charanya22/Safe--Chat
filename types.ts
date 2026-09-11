export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ChatMessage {
  id: string;
  sender: 'child' | 'contact' | 'peer';
  displayName: string;
  text: string;
  sanitizedText?: string;
  timestamp: string;
  day: string;
  dayNumber: number;
  piiDetected?: string[];
  concerningSignal?: string;
}

export interface RiskCategoryScore {
  id: 'grooming' | 'cyberbullying' | 'harassment' | 'threats' | 'sexual_exploitation';
  name: string;
  score: number; // 0 to 100
  severity: RiskLevel;
  detected: boolean;
  description: string;
  exampleSignal: string;
}

export interface BehavioralPattern {
  id: string;
  name: string;
  description: string;
  evidenceType: string;
  severity: RiskLevel;
  confidence: number;
  firstObservedDay: string;
  detail: string;
  quoteMasked?: string;
}

export interface EscalationDataPoint {
  day: string;
  dayNumber: number;
  score: number;
  label: string;
  severity: RiskLevel;
  triggerEvent?: string;
}

export interface ParentActionRecommendation {
  id: string;
  title: string;
  priority: 'urgent' | 'important' | 'guidance';
  advice: string;
  conversationStarter: string;
}

export interface PrivacyMetrics {
  piiItemsRedacted: number;
  rawMessagesConcealed: number;
  privacyModeActive: boolean;
  parentGuarantee: string;
}

export interface SafetyAnalysisResult {
  risk_score: number; // 0-100
  risk_level: RiskLevel;
  confidence: number;
  primary_concern: string;
  categories: RiskCategoryScore[];
  behavioral_patterns: BehavioralPattern[];
  why_flagged: string[];
  evidence_summary: string;
  escalation_trend: {
    has_escalated: boolean;
    percentage_increase: number;
    trend_description: string;
    timeline: EscalationDataPoint[];
  };
  recommended_parent_action: ParentActionRecommendation[];
  privacy_metrics: PrivacyMetrics;
  scenario_id?: string;
  analyzed_at?: string;
  is_live_gemini?: boolean;
}

export interface ScenarioDefinition {
  id: string;
  title: string;
  category: 'grooming' | 'cyberbullying' | 'harassment' | 'threats' | 'normal';
  risk_level: RiskLevel;
  risk_score: number;
  child_name: string;
  child_age: number;
  contact_name: string;
  contact_tag: string;
  description: string;
  timeframe: string;
  badge_color: string;
  messages: ChatMessage[];
  benchmarkAnalysis: SafetyAnalysisResult;
}

// Product-level Types
export interface ParentUser {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  children_count: number;
}

export interface DeviceInfo {
  id: string;
  device_name: string;
  device_type: string;
  is_active: boolean;
  last_sync_at?: string;
  os_version?: string;
}

export interface ChildProfile {
  id: string;
  parent_id?: string;
  full_name: string;
  age: number;
  grade: string;
  avatar_url: string;
  safety_status: 'Safe' | 'Attention Needed' | 'Critical';
  protection_status?: 'ACTIVE' | 'ATTENTION_REQUIRED' | 'CRITICAL' | 'INACTIVE';
  overall_risk_score: number;
  active_device?: DeviceInfo;
  conversations_count: number;
  open_incidents_count: number;
}

export interface PairingSession {
  session_id: string;
  pairing_code: string;
  child_display_name: string;
  age_group?: string;
  expires_at: number;
  status: 'waiting' | 'connected' | 'expired' | 'canceled';
  paired_child?: ChildProfile | null;
}

export interface DeviceStatusResponse {
  device_id: string;
  child_id: string;
  child_name: string;
  device_name: string;
  is_active: boolean;
  last_sync_at: string;
  os_version: string;
  collector_status: string;
  connection_state: 'CONNECTED' | 'IDLE' | 'OFFLINE' | 'REVOKED';
  status_label: string;
  last_active_text: string;
}

export interface ChildProtectionSession {
  child_id: string;
  child_name: string;
  protection_status: 'ACTIVE' | 'INACTIVE';
  device_id: string;
  device_token: string;
  masked_parent: string;
  connected_at: string;
  messages_analyzed: number;
  safety_status: string;
  last_analysis_time?: string;
}

export interface ChildConversation {
  id: string;
  child_id: string;
  source: 'whatsapp' | 'discord' | 'instagram' | 'sms' | 'roblox' | string;
  contact_name: string;
  contact_handle?: string;
  risk_score: number;
  risk_level: RiskLevel;
  primary_concern: string;
  message_count: number;
  is_flagged: boolean;
  last_message_at: string;
}

export interface ThreateningMessageEvidence {
  id: string;
  day: string; // e.g. "Day 1", "Day 3", "Day 5", "Day 7", "Day 10"
  timestamp: string;
  sender: 'child' | 'contact' | 'peer';
  sender_label: string;
  text: string; // Sanitized text (PII scrubbed, e.g. phone/names masked, but threatening dialogue visible)
  is_threatening: boolean;
  threat_category?: string; // e.g. "Grooming & Isolation", "Extortion / Doxxing Threat", "Emotional Manipulation"
  message_risk_score: number; // Tier 1: Message-level risk score (0-100)
  escalation_stage?: string; // e.g. "Initial Rapport", "Boundary Testing", "Secrecy Demand", "Direct Coercion"
  explanation?: string;
}

export interface PatternEscalationStep {
  day: string;
  day_number: number;
  phase_title: string;
  quote_excerpt: string;
  risk_score: number;
  danger_analysis: string;
  tactics: string[];
  severity: RiskLevel;
}

export interface FourTierAnalysis {
  message_level: {
    score: number;
    label: string;
    description: string;
    signals: string[];
  };
  conversation_level: {
    score: number;
    label: string;
    description: string;
    frequency: string;
  };
  time_escalation: {
    score: number;
    label: string;
    description: string;
    velocity_rate: string;
  };
  relationship_manipulation: {
    score: number;
    label: string;
    description: string;
    tactics_detected: string[];
  };
}

export interface ChildIncident {
  id: string;
  child_id: string;
  conversation_id: string;
  source: string;
  contact_name: string;
  risk_score: number;
  risk_level: RiskLevel;
  primary_concern: string;
  confidence: number;
  categories: RiskCategoryScore[];
  behavioral_patterns: BehavioralPattern[];
  why_flagged: string[];
  recommended_actions: ParentActionRecommendation[];
  status: 'open' | 'under_review' | 'resolved';
  created_at: string;
  // Threatening chat excerpts and 4-tier pattern analysis
  threatening_messages?: ThreateningMessageEvidence[];
  pattern_escalation?: PatternEscalationStep[];
  four_tier_analysis?: FourTierAnalysis;
}

export interface ParentNotification {
  id: string;
  child_id: string;
  child_name: string;
  incident_id?: string;
  title: string;
  message: string;
  severity: RiskLevel;
  delivery_channel: 'in_app' | 'push' | 'sms';
  is_read: boolean;
  created_at: string;
}

export type MessageDirection = 'SENT' | 'RECEIVED';

export interface CustomTestMessage {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  receiver_id: string;
  receiver_name: string;
  direction: MessageDirection; // 'SENT' (by child) or 'RECEIVED' (by child)
  message: string;
  timestamp: string;
  is_threatening?: boolean;
}

export interface CustomTestConversation {
  id: string;
  child_id: string;
  conversation_name: string;
  contact_name: string;
  contact_handle?: string;
  source: 'School Group' | 'Gaming' | 'Messaging' | 'Social Media' | 'Unknown Contact' | 'Direct Message' | string;
  is_test_data: boolean;
  messages: CustomTestMessage[];
  created_at: string;
  risk_assessment?: {
    risk_level: RiskLevel;
    risk_score: number;
    primary_concern: string;
    summary: string;
    concerning_messages_count: number;
    recommended_action: string;
    incident_id?: string;
  };
}

export interface RiskConcentrationItem {
  source: string;
  display_name: string;
  incidents_count: number;
  percentage: number;
  risk_level: RiskLevel;
  description?: string;
}

export interface RiskConcentrationReport {
  total_incidents: number;
  sources: RiskConcentrationItem[];
  primary_source: string;
}
