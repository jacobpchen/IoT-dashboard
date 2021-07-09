import i18n from "i18next";
i18n
    // init i18next
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init({
        lng: "en",
        fallbackLng: "en",
        debug: true,
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        resources: {
            en:{},
            fr:{},
            es:{}
        }
    });

export default i18n;
