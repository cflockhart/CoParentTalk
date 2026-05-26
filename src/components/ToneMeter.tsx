import React from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ToneMeterProps {
  text: string;
}

export interface ToneAnalysis {
  score: number; // 0 to 100
  status: 'positive' | 'neutral' | 'negative';
  title: string;
  advice: string;
  flaggedWords: string[];
}

export const analyzeTone = (text: string): ToneAnalysis => {
  const cleanText = text.toLowerCase();
  
  if (!cleanText.trim()) {
    return {
      score: 100,
      status: 'positive',
      title: 'Neutral & Clear',
      advice: 'Start typing to analyze message tone. Keep it objective.',
      flaggedWords: []
    };
  }

  // Define hostile or inflammatory keywords
  const hostilePatterns = [
    { word: 'always', alt: 'often' },
    { word: 'never', alt: 'frequently' },
    { word: 'fault', alt: 'responsibility' },
    { word: 'blame', alt: 'address' },
    { word: 'lazy', alt: 'unresponsive' },
    { word: 'selfish', alt: 'focused elsewhere' },
    { word: 'ridiculous', alt: 'difficult' },
    { word: 'liar', alt: 'misunderstood' },
    { word: 'lie', alt: 'mistake' },
    { word: 'hate', alt: 'dislike' },
    { word: 'stupid', alt: 'unwise' },
    { word: 'angry', alt: 'concerned' },
    { word: 'unfair', alt: 'challenging' },
    { word: 'bad parent', alt: 'different perspective' },
    { word: 'refuse', alt: 'decline' },
    { word: 'worst', alt: 'problematic' }
  ];

  // Define polite or constructive phrases that boost the score
  const politePhrases = [
    'please', 'thank you', 'appreciate', 'best interest', 'kids', 'children',
    'understand', 'agree', 'collaborate', 'cooperate', 'flexible', 'share'
  ];

  const flaggedWords: string[] = [];
  let score = 80; // default baseline score

  hostilePatterns.forEach(pattern => {
    if (cleanText.includes(pattern.word)) {
      flaggedWords.push(pattern.word);
      score -= 25;
    }
  });

  politePhrases.forEach(phrase => {
    if (cleanText.includes(phrase)) {
      score += 5;
    }
  });

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  let status: 'positive' | 'neutral' | 'negative' = 'neutral';
  let title = 'Neutral & Objective';
  let advice = 'Good. The message is factual. This is optimal for records.';

  if (score >= 85) {
    status = 'positive';
    title = 'Constructive & Supportive';
    advice = 'Excellent. Your message sounds cooperative and kid-focused.';
  } else if (score < 55) {
    status = 'negative';
    title = 'High Conflict Risk';
    
    // Create targeted rephrasing advice
    if (flaggedWords.length > 0) {
      const firstWord = flaggedWords[0];
      const match = hostilePatterns.find(p => p.word === firstWord);
      advice = `Consider rephrasing "${firstWord}" to "${match?.alt || 'a more direct fact'}" to keep discussions cooperative.`;
    } else {
      advice = 'Try to state facts about custody or schedules directly without emotional commentary.';
    }
  }

  return { score, status, title, advice, flaggedWords };
};

export const ToneMeter: React.FC<ToneMeterProps> = ({ text }) => {
  const analysis = analyzeTone(text);
  const { score, status, title, advice } = analysis;

  const getIcon = () => {
    switch (status) {
      case 'positive':
        return <CheckCircle2 size={16} className="text-success" style={{ color: 'var(--success)' }} />;
      case 'negative':
        return <ShieldAlert size={16} className="text-danger" style={{ color: 'var(--danger)' }} />;
      default:
        return <AlertCircle size={16} className="text-warning" style={{ color: 'var(--warning)' }} />;
    }
  };

  return (
    <div className="tone-meter-container">
      <div className="tone-meter-header">
        <span className="tone-label">ToneMeter™ Sentiment Check</span>
        <div className="tone-status">
          {getIcon()}
          <span style={{ 
            color: status === 'positive' ? 'var(--success)' : status === 'negative' ? 'var(--danger)' : 'var(--warning)',
            fontWeight: 700 
          }}>
            {title} ({score}%)
          </span>
        </div>
      </div>
      <div className="tone-feedback-msg">{advice}</div>
      <div className="tone-meter-bar-outer">
        <div 
          className={`tone-meter-bar-inner ${status}`}
          style={{ transform: `scaleX(${score / 100})` }}
        />
      </div>
    </div>
  );
};
