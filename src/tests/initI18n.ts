import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import attendanceList from '../../public/locales/fi/attendanceList.json';
import common from '../../public/locales/fi/common.json';
import paymentCancelled from '../../public/locales/fi/paymentCancelled.json';
import paymentCompleted from '../../public/locales/fi/paymentCompleted.json';
import reservation from '../../public/locales/fi/reservation.json';
import signup from '../../public/locales/fi/signup.json';
import signups from '../../public/locales/fi/signups.json';
import summary from '../../public/locales/fi/summary.json';

const translations = {
  attendanceList,
  common,
  paymentCancelled,
  paymentCompleted,
  reservation,
  signup,
  signups,
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
