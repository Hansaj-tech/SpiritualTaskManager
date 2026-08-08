export interface ChaturmasStrings {
  title: string
  subtitle: string
  seasonProgress: string
  viewOriginal: string
  viewStoryCards: string
  viewKeyTeaching: string
  viewMemorable: string
  reflection: string
  markAsRead: string
  alreadyRead: string
  savingRead: string
  feedbackPrompt: string
  feedbackSubmit: string
  feedbackThanks: string
  comingSoon: string
  notStarted: string
  seasonOver: string
}

export const chaturmasStrings: Record<'en' | 'gu', ChaturmasStrings> = {
  en: {
    title: 'Chaturmas Vanchan Niyam',
    subtitle: 'One reading a day, across four sacred texts',
    seasonProgress: 'Season Progress',
    viewOriginal: 'Original Text',
    viewStoryCards: 'Story Cards',
    viewKeyTeaching: 'Key Teaching',
    viewMemorable: 'Memorable Passage',
    reflection: 'Reflection',
    markAsRead: 'Mark as Read',
    alreadyRead: 'Read',
    savingRead: 'Saving...',
    feedbackPrompt: 'A line about how the niyam felt',
    feedbackSubmit: 'Share',
    feedbackThanks: 'Thank you for sharing',
    comingSoon: 'Coming soon',
    notStarted: "This year's Chaturmas hasn't started yet",
    seasonOver: "This year's Chaturmas has ended",
  },
  gu: {
    title: 'ચાતુર્માસ વાંચન નિયમ',
    subtitle: 'દરરોજ એક વાંચન, ચાર પવિત્ર ગ્રંથોમાંથી',
    seasonProgress: 'ઋતુ પ્રગતિ',
    viewOriginal: 'મૂળ પાઠ',
    viewStoryCards: 'વાર્તા કાર્ડ્સ',
    viewKeyTeaching: 'મુખ્ય બોધ',
    viewMemorable: 'યાદગાર પંક્તિ',
    reflection: 'ચિંતન',
    markAsRead: 'વંચાયું તરીકે નિશાની કરો',
    alreadyRead: 'વંચાયું',
    savingRead: 'સાચવાય છે...',
    feedbackPrompt: 'નિયમ કેવો લાગ્યો તે વિશે એક લીટી',
    feedbackSubmit: 'શેર કરો',
    feedbackThanks: 'શેર કરવા બદલ આભાર',
    comingSoon: 'ટૂંક સમયમાં આવે છે',
    notStarted: 'આ વર્ષનો ચાતુર્માસ હજુ શરૂ થયો નથી',
    seasonOver: 'આ વર્ષનો ચાતુર્માસ પૂરો થયો છે',
  },
}
