import { screen } from '../../utils/testUtils';

export const shouldShowNotFoundPage = async () => {
  await screen.findByRole('heading', {
    name: 'Valitettavasti etsimääsi sivua ei löydy',
  });

  screen.getByText(
    'Hakemaasi sivua ei löytynyt. Yritä myöhemmin uudelleen. Jos ongelma jatkuu, ota meihin yhteyttä.'
  );
};

export const shouldShowInsufficientPermissionsPage = async () => {
  await screen.findByRole('heading', {
    name: 'Riittämättömät käyttöoikeudet',
  });

  screen.getByText(
    'Sinulla ei ole oikeuksia tämän sisällön näkemiseen. Kirjaudu ulos ja kokeile toisella käyttäjätunnuksella.'
  );
};

export const shouldShowSigninRequiredPage = async () => {
  await screen.findByRole('heading', { name: 'Kirjautuminen vaaditaan' });

  screen.getByText(
    'Sinun tulee olla kirjautunut tarkastellaksesi ilmoittautumisen tietoja.'
  );
};

export const shouldShowStrongIdentificationRequiredPage = async () => {
  await screen.findByRole('heading', {
    name: 'Vahva tunnistautuminen vaaditaan',
  });

  screen.getByText(
    'Tämän sisällön näkeminen edellyttää vahvaa tunnistautumista. Kirjaudu ulos ja kokeile toista kirjautumistapaa.'
  );
};
