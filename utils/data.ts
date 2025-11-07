export const countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'NG', name: 'Nigeria' },
];

export const states: { [countryCode: string]: { code: string, name: string }[] } = {
    US: [
        { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
        { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
        { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
        { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
        { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
        { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
        { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
        { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
        { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
        { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
        { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
        { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
        { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
        { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
        { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
        { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
        { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
    ],
    CA: [
        { code: 'AB', name: 'Alberta' }, { code: 'BC', name: 'British Columbia' }, { code: 'MB', name: 'Manitoba' },
        { code: 'NB', name: 'New Brunswick' }, { code: 'NL', name: 'Newfoundland and Labrador' }, { code: 'NS', name: 'Nova Scotia' },
        { code: 'ON', name: 'Ontario' }, { code: 'PE', name: 'Prince Edward Island' }, { code: 'QC', name: 'Quebec' },
        { code: 'SK', name: 'Saskatchewan' }
    ],
    AU: [
        { code: 'ACT', name: 'Australian Capital Territory' }, { code: 'NSW', name: 'New South Wales' }, { code: 'NT', name: 'Northern Territory' },
        { code: 'QLD', name: 'Queensland' }, { code: 'SA', name: 'South Australia' }, { code: 'TAS', name: 'Tasmania' },
        { code: 'VIC', name: 'Victoria' }, { code: 'WA', name: 'Western Australia' }
    ],
    NG: [
        { code: 'AB', name: 'Abia' }, { code: 'AD', name: 'Adamawa' }, { code: 'AK', name: 'Akwa Ibom' },
        { code: 'AN', name: 'Anambra' }, { code: 'BA', name: 'Bauchi' }, { code: 'BY', name: 'Bayelsa' },
        { code: 'BE', name: 'Benue' }, { code: 'BO', name: 'Borno' }, { code: 'CR', name: 'Cross River' },
        { code: 'DE', name: 'Delta' }, { code: 'EB', name: 'Ebonyi' }, { code: 'ED', name: 'Edo' },
        { code: 'EK', name: 'Ekiti' }, { code: 'EN', name: 'Enugu' }, { code: 'FC', name: 'FCT' },
        { code: 'GO', name: 'Gombe' }, { code: 'IM', name: 'Imo' }, { code: 'JI', name: 'Jigawa' },
        { code: 'KD', name: 'Kaduna' }, { code: 'KN', name: 'Kano' }, { code: 'KT', name: 'Katsina' },
        { code: 'KE', name: 'Kebbi' }, { code: 'KO', name: 'Kogi' }, { code: 'KW', name: 'Kwara' },
        { code: 'LA', name: 'Lagos' }, { code: 'NA', name: 'Nasarawa' }, { code: 'NI', name: 'Niger' },
        { code: 'OG', name: 'Ogun' }, { code: 'ON', name: 'Ondo' }, { code: 'OS', name: 'Osun' },
        { code: 'OY', name: 'Oyo' }, { code: 'PL', name: 'Plateau' }, { code: 'RI', name: 'Rivers' },
        { code: 'SO', name: 'Sokoto' }, { code: 'TA', name: 'Taraba' }, { code: 'YO', name: 'Yobe' },
        { code: 'ZA', name: 'Zamfara' }
    ]
};

export const phoneCodes = [
    { code: '+1', name: 'USA/Canada' },
    { code: '+44', name: 'UK' },
    { code: '+61', name: 'Australia' },
    { code: '+234', name: 'Nigeria' },
];

export const allCurrencies = [
  { code: 'USD', name: 'United States Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'GBP', name: 'British Pound Sterling', symbol: '£' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
];

export const allLanguages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'fr', name: 'Français (French)' },
  { code: 'de', name: 'Deutsch (German)' },
  { code: 'it', name: 'Italiano (Italian)' },
  { code: 'pt', name: 'Português (Portuguese)' },
  { code: 'ru', name: 'Русский (Russian)' },
  { code: 'zh', name: '中文 (Chinese)' },
  { code: 'ja', name: '日本語 (Japanese)' },
  { code: 'ko', name: '한국어 (Korean)' },
  { code: 'ar', name: 'العربية (Arabic)' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
];
