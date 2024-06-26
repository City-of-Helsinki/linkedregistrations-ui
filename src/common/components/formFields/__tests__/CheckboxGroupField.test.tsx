import '@testing-library/jest-dom';
import { Field, Formik } from 'formik';
import range from 'lodash/range';
import React from 'react';

import { render, screen, userEvent } from '../../../../utils/testUtils';
import CheckboxGroupField, {
  CheckboxGroupFieldProps,
} from '../CheckboxGroupField';

const renderComponent = ({
  props,
  initialValues = { fieldName: [] },
}: {
  props?: Partial<CheckboxGroupFieldProps>;
  initialValues?: Record<string, unknown>;
}) =>
  render(
    <Formik initialValues={initialValues} onSubmit={() => undefined}>
      {() => (
        <Field
          name="fieldName"
          component={CheckboxGroupField}
          label={'Field label'}
          options={[]}
          {...props}
        />
      )}
    </Formik>
  );

test('should toggle visible options', async () => {
  const user = userEvent.setup();

  const visibleOptionAmount = 5;
  const options = range(1, visibleOptionAmount * 2).map((index) => ({
    label: `Option ${index}`,
    value: index.toString(),
  }));

  renderComponent({ props: { options, visibleOptionAmount } });
  const defaultOptions = options.slice(0, visibleOptionAmount);
  const restOptions = options.slice(visibleOptionAmount);

  defaultOptions.forEach(({ label }) => {
    screen.getByLabelText(label);
  });

  restOptions.forEach(({ label }) => {
    expect(screen.queryByLabelText(label)).not.toBeInTheDocument();
  });

  await user.click(screen.getByRole('button', { name: /näytä lisää/i }));
  restOptions.forEach(({ label }) => {
    screen.getByLabelText(label);
  });
  expect(
    await screen.findByText('Lisää vaihtoehtoja lisätty listaukseen')
  ).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /näytä vähemmän/i }));
  expect(screen.queryByLabelText(restOptions[0].label)).not.toBeInTheDocument();
  expect(
    await screen.findByText('Osa vaihtoehdoista piilotettu listauksesta')
  ).toBeInTheDocument();
});

test('should disable checked options if less than min option is checked', async () => {
  const optionAmount = 5;
  const options = range(1, optionAmount).map((index) => ({
    label: `Option ${index}`,
    value: index.toString(),
  }));

  renderComponent({
    initialValues: { fieldName: [options[0].value] },
    props: { options, min: 1 },
  });

  const checkbox = screen.getByRole('checkbox', { name: options[0].label });
  expect(checkbox).toBeChecked();
  expect(checkbox).toBeDisabled();
});

test('should show label with required indicator', async () => {
  const label = 'Label';
  renderComponent({ props: { label, required: true } });

  screen.getByRole('group', { name: label });
  screen.getByText('*');
});

test('should show label without required indicator', async () => {
  const label = 'Label';
  renderComponent({ props: { label, required: false } });

  screen.getByRole('group', { name: label });
  expect(screen.queryByText('*')).not.toBeInTheDocument();
});
