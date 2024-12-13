
export const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
};


export const getTargetLanguagesForSource = (
    sourceLocale,
    supportedLocales,
    languageDirections
) => {
    const targetLocales = languageDirections
        .filter(
            (dir) =>
                dir.source_locale === sourceLocale.value
        )
        .map((dir) => dir.target_locale);

    return supportedLocales
        .filter((locale) =>
            targetLocales.includes(locale.connector_locale)
        )
        .map((locale) => ({
            label: locale.locale_label,
            value: locale.connector_locale,
        }));
};