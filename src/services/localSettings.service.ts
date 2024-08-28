
export enum UserSettings {
    hideSuggestions = 'hideSuggestions',
    skipTour = 'skipTour',
    skipTourAnon = 'skipTourAnon',
}

export const localSettingsService = {
    getSetting,
    setSetting,
    toggleSetting
};

function getSetting(settingName: string) : boolean {
    if (settingName in UserSettings) {
        return localStorage.getItem(settingName) === 'true';
    }
    return false;
}

function setSetting(settingName: string, value: boolean) {
    if (settingName in UserSettings) {
        localStorage.setItem(settingName, value.toString());
    }
}

function toggleSetting(settingName: string) {
    if (settingName in UserSettings) {
        const oldVal = localStorage.getItem(UserSettings.hideSuggestions.toString());
        localStorage.setItem(settingName, oldVal === 'true' ? 'false' : 'true' );
    }       
}
