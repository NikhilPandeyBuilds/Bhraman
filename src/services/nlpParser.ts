// Bhraman - Multilingual Natural Language & Voice Intent Parser
// Strictly PS6: Local & Experiences
// Identifies language and converts English, Hindi, or Marathi inputs into structured traveler constraints

import { TravelerConstraints, ParsedNLPResult, Category, TransportMode, TravelerGroup, SupportedLanguage } from '../types';
import { MUMBAI_BASE_HOTEL } from '../data/mumbaiPlaces';
import { LanguageService } from './i18n/languageService';

export class NLPParser {
  /**
   * Normalizes Devanagari numerals to standard Arabic digits
   */
  private static normalizeDevanagariDigits(str: string): string {
    const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    let normalized = str;
    devanagariDigits.forEach((digit, idx) => {
      normalized = normalized.split(digit).join(idx.toString());
    });
    return normalized;
  }

  /**
   * Parses natural language (voice transcript or typed text) into structured constraints
   */
  public static parse(input: string): ParsedNLPResult {
    const { language: detectedLanguage, confidence: languageConfidence } = LanguageService.identifyLanguage(input);
    const normalizedInput = this.normalizeDevanagariDigits(input);
    const text = normalizedInput.trim().toLowerCase();

    const extracted: Partial<TravelerConstraints> = {
      baseLocation: {
        name: MUMBAI_BASE_HOTEL.name,
        coordinates: MUMBAI_BASE_HOTEL.coordinates,
      },
      requiresReturn: true,
      minimumBufferMinutes: 15,
    };

    const missingFields: string[] = [];

    const wordNumbers: Record<string, number> = {
      one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
      // Hindi & Marathi words
      'एक': 1, 'दोन': 2, 'दो': 2, 'तीन': 3, 'चार': 4, 'पाच': 5, 'पांच': 5,
    };

    // 1. Extract Time (hours / minutes)
    // English, Hindi (घंटे), Marathi (तास)
    const hourMatch = text.match(/(\d+(?:\.\d+)?|one|two|three|four|five|six|एक|दोन|दो|तीन|चार|पाच|पांच)\s*(?:hours?|hrs?|h\b|तास|घंटे|घन्टे)/);
    const minuteMatch = text.match(/(\d+)\s*(?:minutes?|mins?|m\b|मिनिटे|मिनट)/);

    if (minuteMatch && (!hourMatch || text.indexOf(minuteMatch[0]) < text.indexOf(hourMatch[0]))) {
      extracted.availableMinutes = parseInt(minuteMatch[1], 10);
    } else if (hourMatch) {
      const hourVal = wordNumbers[hourMatch[1]] || parseFloat(hourMatch[1]);
      extracted.availableMinutes = Math.round(hourVal * 60);
    } else {
      extracted.availableMinutes = 180;
      missingFields.push('time');
    }

    // 2. Extract Budget
    const thousandWordMatch = text.match(/(one|two|three|four|five|six|seven|eight|nine|ten|एक|दोन|दो|तीन|चार|पाच|पांच)\s*(?:thousand|हजार)(?:\s*(?:rupees|रुपये|रु))?/);
    const budgetMatch = text.match(/(?:₹|rs\.?|inr|रु\.?)\s*([\d,]+)|(?:under|budget\s*of|have|माझ्याकडे|बजेट)\s*(?:₹|rs\.?|रु)?\s*([\d,]+)|([\d,]+)\s*(?:rupees|rs|bucks|रुपये|रु)/);

    if (thousandWordMatch) {
      const word = thousandWordMatch[1];
      const factor = wordNumbers[word] || 1;
      extracted.budget = factor * 1000;
    } else if (budgetMatch) {
      const rawNum = budgetMatch[1] || budgetMatch[2] || budgetMatch[3];
      extracted.budget = parseInt(rawNum.replace(/,/g, ''), 10);
    } else {
      const fallbackBudget = text.match(/\b([1-9]\d{2,4})\b/);
      if (fallbackBudget && parseInt(fallbackBudget[1], 10) >= 300) {
        extracted.budget = parseInt(fallbackBudget[1], 10);
      } else {
        extracted.budget = 3000;
        missingFields.push('budget');
      }
    }

    // 3. Extract Group Size & Type
    let groupCount = 1;
    let groupType: TravelerGroup = 'solo';

    const groupMatch = text.match(/(\d+|one|two|three|four|five|six|एक|दोन|दो|तीन|चार|पाच)\s*(?:friends?|people|guys|persons?|of us|मित्र|दोस्त|लोक|जण)/);
    if (groupMatch) {
      const countVal = wordNumbers[groupMatch[1]] || parseInt(groupMatch[1], 10);
      groupCount = countVal;
      groupType = 'friends';
    } else if (
      text.includes('couple') || text.includes('girlfriend') || text.includes('boyfriend') ||
      text.includes('जोडी') || text.includes('जोड़ा') || text.includes('पती') || text.includes('पत्नी')
    ) {
      groupCount = 2;
      groupType = 'couple';
    } else if (text.includes('family') || text.includes('कुटुंब') || text.includes('परिवार')) {
      const famMatch = text.match(/(?:family|कुटुंब|परिवार)\s*(?:of\s*)?(\d+)/);
      groupCount = famMatch ? parseInt(famMatch[1], 10) : 4;
      groupType = 'family';
    } else if (
      text.includes('solo') || text.includes('alone') || text.includes('myself') ||
      text.includes('एकटा') || text.includes('एकटी') || text.includes('अकेले') || text.includes('स्वयं')
    ) {
      groupCount = 1;
      groupType = 'solo';
    } else {
      if (text.includes('three') || text.includes('3') || text.includes('तीन')) {
        groupCount = 3;
        groupType = 'friends';
      }
    }
    extracted.groupSize = groupCount;
    extracted.groupType = groupType;

    // 4. Extract Interests (Multilingual)
    const detectedInterests: Category[] = [];
    if (
      text.includes('food') || text.includes('eat') || text.includes('snack') || text.includes('chaat') ||
      text.includes('जेवण') || text.includes('खाद्य') || text.includes('खाना') || text.includes('नाश्ता')
    ) {
      detectedInterests.push('food');
    }
    if (
      text.includes('culture') || text.includes('cultural') || text.includes('art') || text.includes('museum') ||
      text.includes('संस्कृती') || text.includes('सांस्कृतिक') || text.includes('कला') || text.includes('मंदिर')
    ) {
      detectedInterests.push('culture');
    }
    if (
      text.includes('photo') || text.includes('photography') || text.includes('scenic') || text.includes('sunset') ||
      text.includes('छायाचित्रण') || text.includes('फोटो') || text.includes('दृश्य')
    ) {
      detectedInterests.push('photography');
    }
    if (
      text.includes('nature') || text.includes('creek') || text.includes('flamingo') || text.includes('park') ||
      text.includes('निसर्ग') || text.includes('प्रकृति') || text.includes('खारफुटी')
    ) {
      detectedInterests.push('nature');
    }
    if (
      text.includes('hidden') || text.includes('gem') || text.includes('offbeat') || text.includes('secret') ||
      text.includes('अनोखे') || text.includes('गूढ') || text.includes('लपलेले') || text.includes('गुमनाम')
    ) {
      detectedInterests.push('hidden_gem');
    }
    if (
      text.includes('heritage') || text.includes('history') || text.includes('historic') || text.includes('fort') ||
      text.includes('वारसा') || text.includes('इतिहास') || text.includes('किल्ला')
    ) {
      detectedInterests.push('heritage');
    }
    if (
      text.includes('peace') || text.includes('peaceful') || text.includes('quiet') || text.includes('serene') ||
      text.includes('शांत') || text.includes('शांतता') || text.includes('सुकून')
    ) {
      detectedInterests.push('peaceful');
    }

    if (detectedInterests.length === 0) {
      detectedInterests.push('food', 'culture', 'photography');
      missingFields.push('interests');
    }
    extracted.interests = detectedInterests;

    // 5. Extract Transport Mode (Multilingual)
    let transport: TransportMode = 'bike';
    if (
      text.includes('walking') || text.includes('walk') || text.includes('on foot') ||
      text.includes('पायपीट') || text.includes('चालत') || text.includes('पैदल')
    ) {
      transport = 'walk';
    } else if (
      text.includes('bicycle') || text.includes('cycle') || text.includes('cycling') ||
      text.includes('सायकल')
    ) {
      transport = 'bicycle';
    } else if (
      text.includes('bike') || text.includes('motorcycle') || text.includes('scooter') ||
      text.includes('बाईक') || text.includes('मोटारसायकल') || text.includes('दोपहिया')
    ) {
      transport = 'bike';
    } else if (
      text.includes('auto') || text.includes('rickshaw') || text.includes('tuk tuk') ||
      text.includes('ऑटो') || text.includes('रिक्षा')
    ) {
      transport = 'auto';
    } else if (
      text.includes('cab') || text.includes('car') || text.includes('uber') || text.includes('taxi') ||
      text.includes('टॅक्सी') || text.includes('कॅब') || text.includes('गाडी')
    ) {
      transport = 'cab';
    } else {
      transport = 'bike';
      missingFields.push('transport');
    }
    extracted.transportMode = transport;

    // 6. Location override if specified
    if (text.includes('bandra') || text.includes('बांद्रा') || text.includes('वांद्रे')) {
      extracted.baseLocation = {
        name: "Bandra Hotel (Waterfield Rd)",
        coordinates: { latitude: 19.0596, longitude: 72.8295 },
      };
    } else if (text.includes('colaba') || text.includes('कुलाबा') || text.includes('fort') || text.includes('फोर्ट')) {
      extracted.baseLocation = {
        name: "Colaba Causeway Base",
        coordinates: { latitude: 18.9220, longitude: 72.8317 },
      };
    } else if (text.includes('juhu') || text.includes('जुहू')) {
      extracted.baseLocation = {
        name: "Juhu Beach Base",
        coordinates: { latitude: 19.0988, longitude: 72.8264 },
      };
    }

    const totalTargetFields = 6;
    const recognizedCount = totalTargetFields - missingFields.length;
    const confidence = Math.min(0.98, Math.max(0.65, recognizedCount / totalTargetFields));

    return {
      rawText: input,
      detectedLanguage,
      languageConfidence,
      constraints: extracted,
      confidence,
      missingFields,
    };
  }

  public static readonly DEMO_VOICE_SAMPLE = 
    "We are three friends in Bandra. We have three hours and three thousand rupees. We want local food, something cultural and a nice photography spot. We have a bike and need to return to our hotel.";

  public static readonly DEMO_VOICE_SAMPLE_EN = 
    "We are three friends in Bandra. We have three hours and three thousand rupees. We want local food, something cultural and a nice photography spot. We have a bike and need to return to our hotel.";

  public static readonly DEMO_VOICE_SAMPLE_MR = 
    "माझ्याकडे दोन तास आहेत आणि मला स्थानिक जेवण आणि शांत जागा पाहिजे. बाईकने प्रवास करायचा आहे.";

  public static readonly DEMO_VOICE_SAMPLE_HI = 
    "हम तीन दोस्त बांद्रा में हैं। हमारे पास तीन घंटे और तीन हज़ार रुपये हैं। हमें स्थानिक खाना, संस्कृति और फोटो की अच्छी जगह चाहिए।";
}
