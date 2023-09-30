import { screen, userEvent, within } from '../../utils/testUtils';

export const findFirstNameInput = () => {
  return screen.findByRole('textbox', { name: /etunimi/i });
};

export const getSignupFormElement = (
  key:
    | 'acceptCheckbox'
    | 'cancelButton'
    | 'cityInput'
    | 'dateOfBirthInput'
    | 'emailCheckbox'
    | 'emailInput'
    | 'firstNameInput'
    | 'lastNameInput'
    | 'nativeLanguageButton'
    | 'participantAmountInput'
    | 'phoneCheckbox'
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
        /hyväksyn tietojeni jakamisen järjestäjän kanssa/i
      );
    case 'cancelButton':
      return screen.getByRole('button', { name: /peruuta ilmoittautuminen/i });
    case 'cityInput':
      return screen.getByLabelText(/kaupunki/i);
    case 'dateOfBirthInput':
      return screen.getByLabelText(/syntymäaika/i);
    case 'emailCheckbox':
      return screen.getByLabelText(/sähköpostilla/i);
    case 'emailInput':
      return screen.getByLabelText(/sähköpostiosoite/i);
    case 'firstNameInput':
      return screen.getByLabelText(/etunimi/i);
    case 'lastNameInput':
      return screen.getByLabelText(/sukunimi/i);
    case 'nativeLanguageButton':
      return screen.getByRole('button', { name: /äidinkieli/i });
    case 'participantAmountInput':
      return screen.getByRole('spinbutton', {
        name: /ilmoittautujien määrä \*/i,
      });
    case 'phoneCheckbox':
      return screen.getByLabelText(/tekstiviestillä/i);
    case 'phoneInput':
      return screen.getByLabelText(/puhelinnumero/i);
    case 'serviceLanguageButton':
      return screen.getByRole('button', { name: /asiointikieli/i });
    case 'streetAddressInput':
      return screen.getByLabelText(/katuosoite/i);
    case 'submitButton':
      return screen.getByRole('button', { name: /jatka ilmoittautumiseen/i });
    case 'updateButton':
      return screen.getByRole('button', { name: /tallenna/i });
    case 'updateParticipantAmountButton':
      return screen.getByRole('button', { name: /päivitä/i });
    case 'zipInput':
      return screen.getByLabelText(/postinumero/i);
  }
};

export const shouldRenderSignupFormFields = async () => {
  await findFirstNameInput();
  getSignupFormElement('lastNameInput');
  getSignupFormElement('streetAddressInput');
  getSignupFormElement('dateOfBirthInput');
  getSignupFormElement('zipInput');
  getSignupFormElement('cityInput');
  getSignupFormElement('emailInput');
  getSignupFormElement('phoneInput');
  getSignupFormElement('emailCheckbox');
  getSignupFormElement('phoneCheckbox');
  getSignupFormElement('nativeLanguageButton');
  getSignupFormElement('serviceLanguageButton');
  getSignupFormElement('cancelButton');
  getSignupFormElement('updateButton');
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
