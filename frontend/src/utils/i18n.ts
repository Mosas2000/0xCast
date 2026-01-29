/**
 * Lightweight internationalization (i18n) utility.
 */
type Translations = Record<string, string>;

const en: Translations = {
    'nav.markets': 'Markets',
    'nav.create': 'Create',
    'nav.portfolio': 'Portfolio',
    'nav.activity': 'Activity',
    'button.connect': 'Connect Wallet',
    'button.stake': 'Place Stake',
    'market.status.active': 'Active',
    'market.status.resolved': 'Resolved',
    'error.generic': 'An unexpected error occurred.',
};

export class I18n {
    private currentLanguage: string = 'en';
    private translations: Record<string, Translations> = { en };

    /**
     * Sets the current language.
     */
    setLanguage(lang: string): void {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
        }
    }

    /**
     * Translates a key based on the current language.
     */
    t(key: string): string {
        return this.translations[this.currentLanguage]?.[key] || key;
    }
}

export const i18n = new I18n();
