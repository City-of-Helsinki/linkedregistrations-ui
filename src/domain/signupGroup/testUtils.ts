import { screen, userEvent, within } from '../../utils/testUtils';
import { REGISTRATION_MANDATORY_FIELDS } from '../registration/constants';

export const findFirstNameInputs = () => {
  return screen.findAllByRole('textbox', { name: /etunimi/i });
};

export const getSignupFormElement = (
  key:
    | 'acceptCheckbox'
    | 'cancelButton'
    | 'cityInput'
    | 'contactPersonPhoneInput'
    | 'dateOfBirthInput'
    | 'emailCheckbox'
    | 'emailInput'
    | 'firstNameInput'
    | 'lastNameInput'
    | 'membershipNumberInput'
    | 'nativeLanguageButton'
    | 'participantAmountInput'
    | 'phoneInput'
    | 'serviceLanguageButton'
    | 'streetAddressInput'
    | 'submitButton'
    | 'updateButton'
    | 'updateParticipantAmountButton'
    | 'zipInput'
) => {
  switch (key) {
    case 'acceptCheckbox':
      return screen.getByLabelText(
        /Hyväksyn tietojen jakamisen tapahtuman järjestäjän kanssa./i
      );
    case 'cancelButton':
      return screen.getByRole('button', { name: /peruuta ilmoittautuminen/i });
    case 'cityInput':
      return screen.getAllByLabelText(/kaupunki/i)[0];
    case 'contactPersonPhoneInput':
      return screen.getAllByLabelText(/puhelinnumero/i)[1];
    case 'dateOfBirthInput':
      return screen.getByLabelText(/syntymäaika/i);
    case 'emailCheckbox':
      return screen.getByLabelText(/sähköpostilla/i);
    case 'emailInput':
      return screen.getByLabelText(/sähköpostiosoite/i);
    case 'firstNameInput':
      return screen.getAllByLabelText(/etunimi/i)[0];
    case 'lastNameInput':
      return screen.getAllByLabelText(/sukunimi/i)[0];
    case 'membershipNumberInput':
      return screen.getByLabelText(/jäsenkortin numero/i);
    case 'nativeLanguageButton':
      return screen.getByRole('button', { name: /äidinkieli/i });
    case 'participantAmountInput':
      return screen.getByRole('spinbutton', {
        name: /ilmoittautujien määrä \*/i,
      });
    case 'phoneInput':
      return screen.getAllByLabelText(/puhelinnumero/i)[0];
    case 'serviceLanguageButton':
      return screen.getByRole('button', { name: /asiointikieli/i });
    case 'streetAddressInput':
      return screen.getByLabelText(/katuosoite/i);
    case 'submitButton':
      return screen.getByRole('button', { name: /jatka ilmoittautumiseen/i });
    case 'updateButton':
      return screen.getByRole('button', { name: /tallenna/i });
    case 'updateParticipantAmountButton':
      return screen.getByRole('button', {
        name: /tallenna ilmoittautujamäärä/i,
      });
    case 'zipInput':
      return screen.getByLabelText(/postinumero/i);
  }
};

export const shouldRenderSignupFormFields = async () => {
  await findFirstNameInputs();
  getSignupFormElement('lastNameInput');
  getSignupFormElement('streetAddressInput');
  getSignupFormElement('dateOfBirthInput');
  getSignupFormElement('zipInput');
  getSignupFormElement('cityInput');
  getSignupFormElement('emailInput');
  getSignupFormElement('contactPersonPhoneInput');
  getSignupFormElement('emailCheckbox');
  getSignupFormElement('membershipNumberInput');
  getSignupFormElement('nativeLanguageButton');
  getSignupFormElement('serviceLanguageButton');
  getSignupFormElement('cancelButton');
  getSignupFormElement('updateButton');
};

export const shouldRenderSignupFormReadOnlyFields = async () => {
  const firstNameInput = (await findFirstNameInputs())[0];
  const lastNameInput = getSignupFormElement('lastNameInput');
  const streetAddressInput = getSignupFormElement('streetAddressInput');
  const dateOfBirthInput = getSignupFormElement('dateOfBirthInput');
  const zipInput = getSignupFormElement('zipInput');
  const cityInput = getSignupFormElement('cityInput');
  const emailInput = getSignupFormElement('emailInput');
  const phoneInput = getSignupFormElement('contactPersonPhoneInput');
  const membershipNumberInput = getSignupFormElement('membershipNumberInput');
  const nativeLanguageButton = getSignupFormElement('nativeLanguageButton');
  const serviceLanguageButton = getSignupFormElement('serviceLanguageButton');
  expect(firstNameInput).toHaveAttribute('readOnly');
  expect(lastNameInput).toHaveAttribute('readOnly');
  expect(streetAddressInput).toHaveAttribute('readOnly');
  expect(dateOfBirthInput).toHaveAttribute('readOnly');
  expect(zipInput).toHaveAttribute('readOnly');
  expect(cityInput).toHaveAttribute('readOnly');
  expect(emailInput).toHaveAttribute('readOnly');
  expect(phoneInput).toHaveAttribute('readOnly');
  expect(membershipNumberInput).toHaveAttribute('readOnly');
  expect(nativeLanguageButton).toBeDisabled();
  expect(serviceLanguageButton).toBeDisabled();
};

export const tryToCancel = async () => {
  const user = userEvent.setup();
  const cancelButton = getSignupFormElement('cancelButton');
  await user.click(cancelButton);

  const modal = await screen.findByRole('dialog', {
    name: 'Haluatko varmasti poistaa ilmoittautumisen?',
  });
  const withinModal = within(modal);
  const cancelSignupButton = withinModal.getByRole('button', {
    name: 'Peruuta ilmoittautuminen',
  });
  await user.click(cancelSignupButton);
};

export const tryToUpdate = async () => {
  const user = userEvent.setup();
  const updateButton = getSignupFormElement('updateButton');
  await user.click(updateButton);
};

export const shouldRenderSignupFields = () => {
  screen.getByLabelText(/etunimi/i);
  screen.getByLabelText(/sukunimi/i);
  screen.getByLabelText(/puhelinnumero/i);
  screen.getByLabelText(/katuosoite/i);
  screen.getByLabelText(/postinumero/i);
  screen.getByLabelText(/kaupunki/i);
};

export const HIDE_NOT_MANDATORY_FIELD_CASES = [
  [REGISTRATION_MANDATORY_FIELDS.FIRST_NAME, /etunimi/i],
  [REGISTRATION_MANDATORY_FIELDS.LAST_NAME, /sukunimi/i],
  [REGISTRATION_MANDATORY_FIELDS.PHONE_NUMBER, /puhelinnumero/i],
  [REGISTRATION_MANDATORY_FIELDS.STREET_ADDRESS, /katuosoite/i],
  [REGISTRATION_MANDATORY_FIELDS.ZIPCODE, /postinumero/i],
  [REGISTRATION_MANDATORY_FIELDS.CITY, /kaupunki/i],
];
