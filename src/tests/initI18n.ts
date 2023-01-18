/* eslint-disable import/no-named-as-default-member */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import common from '../../public/locales/fi/common.json';
import enrolment from '../../public/locales/fi/enrolment.json';
import reservation from '../../public/locales/fi/reservation.json';
import summary from '../../public/locales/fi/summary.json';

const translations = {
  common,
  enrolment,
  reservation,
  summary,
};

i18n.use(initReactI18next).init({
  lng: 'fi',
  fallbackLng: 'fi',
  resources: {
    fi: translations,
  },
});

export default i18n;
