import { Formik } from 'formik';
import React from 'react';

import {
  fakeLocalisedObject,
  fakePriceGroupDense,
  fakeRegistration,
  fakeRegistrationPriceGroup,
} from '../../../../../../utils/mockDataUtils';
import {
  configure,
  loadingSpinnerIsNotInDocument,
  render,
  screen,
} from '../../../../../../utils/testUtils';
import { registrationOverrides } from '../../../../../registration/__mocks__/registration';
import { SIGNUP_INITIAL_VALUES } from '../../../../constants';
import { SignupGroupFormProvider } from '../../../../signupGroupFormContext/SignupGroupFormContext';
import {
  HIDE_NOT_MANDATORY_FIELD_CASES,
  shouldRenderSignupFields,
} from '../../../../testUtils';
import Signup, { SignupProps } from '../Signup';

configure({ defaultHidden: true });

const TEST_REGISTRATION_PRICE_GROUP_ID = 1;
const registration = fakeRegistration(registrationOverrides);
const registrationWithPriceGroup = fakeRegistration({
  ...registrationOverrides,
  registration_price_groups: [
    fakeRegistrationPriceGroup({
      id: TEST_REGISTRATION_PRICE_GROUP_ID,
      price: '10.00',
      price_group: fakePriceGroupDense({
        description: fakeLocalisedObject('Price group 1'),
      }),
    }),
  ],
});

const defaultProps: SignupProps = {
  formDisabled: false,
  index: 0,
  isEditingMode: false,
  onDelete: jest.fn(),
  registration,
  showDelete: false,
  signup: SIGNUP_INITIAL_VALUES,
  signupPath: 'signup[0]',
};

const renderComponent = (props?: Partial<SignupProps>) =>
  render(
    <Formik initialValues={[]} onSubmit={jest.fn()}>
      <SignupGroupFormProvider
        registration={props?.registration ?? defaultProps.registration}
      >
        <Signup {...defaultProps} {...props} />
      </SignupGroupFormProvider>
    </Formik>
  );

test('should use default name in accordion label', async () => {
  renderComponent();
  await loadingSpinnerIsNotInDocument();

  expect(
    screen.getByRole('region', { name: 'Osallistuja 1' })
  ).toBeInTheDocument();
});

test('should shown name in accordion label', async () => {
  renderComponent({
    signup: {
      ...SIGNUP_INITIAL_VALUES,
      firstName: 'First',
      lastName: 'Last',
    },
  });
  await loadingSpinnerIsNotInDocument();

  expect(
    screen.getByRole('region', { name: 'First Last' })
  ).toBeInTheDocument();
});

test('should not show in waiting list text if signup is not in waiting list', async () => {
  renderComponent({
    signup: { ...SIGNUP_INITIAL_VALUES, inWaitingList: false },
  });

  expect(screen.queryByText('Jonopaikka')).not.toBeInTheDocument();
});

test('should show in waiting list text if signup is in waiting list', async () => {
  renderComponent({
    signup: { ...SIGNUP_INITIAL_VALUES, inWaitingList: true },
  });

  expect(screen.getByText('Jonopaikka')).toBeInTheDocument();
});

test('should show price group name in the accordion label', async () => {
  renderComponent({
    registration: registrationWithPriceGroup,
    signup: {
      ...SIGNUP_INITIAL_VALUES,
      priceGroup: TEST_REGISTRATION_PRICE_GROUP_ID.toString(),
    },
  });
  await loadingSpinnerIsNotInDocument();

  expect(
    screen.getByRole('region', {
      name: 'Osallistuja 1 — Price group 1 10,00 €',
    })
  ).toBeInTheDocument();
});

test('price group button should be disabled in editing mode', async () => {
  renderComponent({
    isEditingMode: true,
    registration: registrationWithPriceGroup,
    signup: {
      ...SIGNUP_INITIAL_VALUES,
      priceGroup: TEST_REGISTRATION_PRICE_GROUP_ID.toString(),
    },
  });
  await loadingSpinnerIsNotInDocument();

  expect(screen.getByRole('button', { name: 'Asiakasryhmä *' })).toBeDisabled();
});

test('should display all mandatory fields', () => {
  renderComponent();
  shouldRenderSignupFields();
});

test.each(HIDE_NOT_MANDATORY_FIELD_CASES)(
  'should hide not mandatory field, %s',
  (mandatoryField, hiddenFieldLabel) => {
    renderComponent({
      registration: fakeRegistration({
        ...registrationOverrides,
        mandatory_fields: registrationOverrides.mandatory_fields.filter(
          (i) => i !== mandatoryField
        ),
      }),
    });
    expect(screen.queryByLabelText(hiddenFieldLabel)).not.toBeInTheDocument();
  }
);
