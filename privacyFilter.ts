import { ChatMessage } from './types';

export interface SanitizationResult {
  sanitizedText: string;
  piiItems: string[];
  redactedCount: number;
}

export function sanitizeMessageContent(
  text: string,
  childName: string = 'Alex',
  contactName: string = 'User'
): SanitizationResult {
  let sanitized = text;
  const piiFound: string[] = [];

  // Phone numbers (US & International formats)
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const phoneMatches = sanitized.match(phoneRegex);
  if (phoneMatches) {
    phoneMatches.forEach((match) => {
      piiFound.push(`Phone Number: ${match.slice(0, 3)}***`);
    });
    sanitized = sanitized.replace(phoneRegex, '[PHONE_NUMBER_REDACTED]');
  }

  // Email addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const emailMatches = sanitized.match(emailRegex);
  if (emailMatches) {
    emailMatches.forEach((match) => {
      piiFound.push(`Email Address: ${match.split('@')[0].slice(0, 2)}***@...`);
    });
    sanitized = sanitized.replace(emailRegex, '[EMAIL_REDACTED]');
  }

  // Social handles
  const handleRegex = /@([a-zA-Z0-9_]{3,25})/g;
  const handleMatches = sanitized.match(handleRegex);
  if (handleMatches) {
    handleMatches.forEach((match) => {
      piiFound.push(`Social Handle: @***`);
    });
    sanitized = sanitized.replace(handleRegex, '[HANDLE_REDACTED]');
  }

  // Location / School regex
  const locationPatterns = [
    /\b\d{1,5}\s+[A-Za-z0-9\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Way|Lane|Ln)\b/gi,
    /\b(?:Lincoln|Washington|Roosevelt|Jefferson|Oak|Central|West|East|North|South)\s+(?:High School|Middle School|Elementary|Academy)\b/gi,
  ];

  locationPatterns.forEach((regex) => {
    const locMatches = sanitized.match(regex);
    if (locMatches) {
      locMatches.forEach((match) => {
        piiFound.push(`Location/School: ${match.slice(0, 4)}***`);
      });
      sanitized = sanitized.replace(regex, '[LOCATION_REDACTED]');
    }
  });

  // Name replacements (case insensitive)
  if (childName && childName.length > 1) {
    const childRegex = new RegExp(`\\b${childName}\\b`, 'gi');
    if (childRegex.test(sanitized)) {
      piiFound.push(`Child Name: ${childName}`);
      sanitized = sanitized.replace(childRegex, '[CHILD]');
    }
  }

  if (contactName && contactName.length > 1 && contactName !== 'User') {
    const contactRegex = new RegExp(`\\b${contactName}\\b`, 'gi');
    if (contactRegex.test(sanitized)) {
      piiFound.push(`Contact Name: ${contactName}`);
      sanitized = sanitized.replace(contactRegex, '[CONTACT]');
    }
  }

  return {
    sanitizedText: sanitized,
    piiItems: piiFound,
    redactedCount: piiFound.length,
  };
}

export function sanitizeConversationHistory(
  messages: ChatMessage[],
  childName: string = 'Alex',
  contactName: string = 'User'
): { sanitizedMessages: ChatMessage[]; totalPiiScrubbed: number } {
  let totalPiiScrubbed = 0;

  const sanitizedMessages = messages.map((msg) => {
    const { sanitizedText, piiItems, redactedCount } = sanitizeMessageContent(
      msg.text,
      childName,
      contactName
    );

    totalPiiScrubbed += redactedCount;

    return {
      ...msg,
      sanitizedText,
      piiDetected: piiItems,
    };
  });

  return {
    sanitizedMessages,
    totalPiiScrubbed,
  };
}
