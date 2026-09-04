export const SUCCESS_PHRASES = [
  'يعطيك الصحة يا وحش! جابها فالشبكة!',
  'مخك خدام ماشاء الله! ودنيك فور بزاف!',
  'فنان والله غير فنان! طيارة فالعكس!',
  'سلكتها يا شاطر! قناص الحروف!',
  'برافو عليك راك فاهم اللعبة فالطاير!',
  'هادي هي الرجلة! ودن من ذهب!'
];

export const FAIL_PHRASES = [
  'وين راك عايش يا خو؟! راحت عليك!',
  'ودنيك فيهم غبرة روح دوشهم يا بوعلام!',
  'راحت في كيل الزيت! ما جبت فيها والو!',
  'راك تسمع بالركبة ولا واش؟! نوض نوض!',
  'يا حصراه على زمان! جيبها المرة الجاية!',
  'تخلطت عليك الحكاية قاع! هاردلك يا بطل!'
];

export const SUCCESS_PHRASES_EN = [
  'Legendary guess! You nailed it!',
  'Golden ears! Spot on imitation!',
  'Absolute mastermind! Perfectly decoded!',
  'Sharp mind! You got it right!',
  'Brilliant work! That sounded identical!'
];

export const FAIL_PHRASES_EN = [
  'Not even close! Better luck next time!',
  'Your ears need a tune-up!',
  'Total mystery! Nice try though!',
  'Lost in translation backwards!',
  'Almost had it, but missed the mark!'
];

export function getRandomSuccessPhrase(lang: 'ar' | 'en' = 'ar'): string {
  const list = lang === 'ar' ? SUCCESS_PHRASES : SUCCESS_PHRASES_EN;
  return list[Math.floor(Math.random() * list.length)];
}

export function getRandomFailPhrase(lang: 'ar' | 'en' = 'ar'): string {
  const list = lang === 'ar' ? FAIL_PHRASES : FAIL_PHRASES_EN;
  return list[Math.floor(Math.random() * list.length)];
}
