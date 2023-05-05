/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-require-imports */
import '../tests/mockNextAuth';

import subYears from 'date-fns/subYears';
import { rest } from 'msw';
import { GetServerSidePropsContext } from 'next';
import singletonRouter from 'next/router';
import React from 'react';

import { ROUTES } from '../domain/app/routes/constants';
import { enrolment } from '../domain/enrolment/__mocks__/enrolment';
import {
  NOTIFICATIONS,
  TEST_ENROLMENT_ID,
} from '../domain/enrolment/constants';
import { EnrolmentFormFields } from '../domain/enrolment/types';
import { event } from '../domain/event/__mocks__/event';
import { languagesResponse } from '../domain/language/__mocks__/languages';
import { registration } from '../domain/registration/__mocks__/registration';
import { TEST_REGISTRATION_ID } from '../domain/registration/constants';
import EditEnrolmentPage, {
  getServerSideProps as getEditEnrolmentPageServerSideProps,
} from '../pages/registration/[registrationId]/enrolment/[enrolmentId]/[accessCode]/edit/index';
import EnrolmentCancelledPage, {
  getServerSideProps as getEnrolmentCancelledPageServerSideProps,
} from '../pages/registration/[registrationId]/enrolment/cancelled/index';
import EnrolmentCompletedPage, {
  getServerSideProps as getEnrolmentCompletedPageServerSideProps,
} from '../pages/registration/[registrationId]/enrolment/completed/index';
import CreateEnrolmentPage, {
  getServerSideProps as getCreateEnrolmentPageServerSideProps,
} from '../pages/registration/[registrationId]/enrolment/create/index';
import SummaryPage, {
  getServerSideProps as getSummaryPageServerSideProps,
} from '../pages/registration/[registrationId]/enrolment/create/summary/index';
import formatDate from '../utils/formatDate';
import { EnrolmentServerSideProps } from '../utils/generateEnrolmentGetServerSideProps';
import {
  getMockedSeatsReservationData,
  setEnrolmentFormSessionStorageValues,
} from '../utils/mockDataUtils';
import { mockDefaultConfig } from '../utils/mockNextJsConfig';
import {
  loadingSpinnerIsNotInDocument,
  render,
  screen,
  setQueryMocks,
} from '../utils/testUtils';

jest.mock('next/dist/client/router', () => require('next-router-mock'));

beforeEach(() => {
  mockDefaultConfig();
  // values stored in tests will also be available in other tests unless you run
  localStorage.clear();
  sessionStorage.clear();
});

const isHeadingRendered = async (heading: string | RegExp) => {
  await loadingSpinnerIsNotInDocument();
  await screen.findByRole('heading', { name: heading }, { timeout: 5000 });
};

const enrolmentValues: EnrolmentFormFields = {
  accepted: true,
  attendees: [
    {
      city: 'City',
      dateOfBirth: formatDate(subYears(new Date(), 9)),
      extraInfo: '',
      inWaitingList: false,
      name: 'Participan name',
      streetAddress: 'Street address',
      zipcode: '00100',
    },
  ],
  email: 'participant@email.com',
  extraInfo: '',
  membershipNumber: '',
  nativeLanguage: 'fi',
  notifications: [NOTIFICATIONS.EMAIL],
  phoneNumber: '358 44 123 4567',
  serviceLanguage: 'fi',
};

const mocks = [
  rest.get('*/language/', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(languagesResponse))
  ),
  rest.get(`*/registration/${TEST_REGISTRATION_ID}/`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(registration))
  ),
  rest.get(`*/signup/*`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(enrolment))
  ),
];

describe('CreateEnrolmentPage', () => {
  it('should render heading', async () => {
    setQueryMocks(...mocks);

    setEnrolmentFormSessionStorageValues({
      enrolmentFormValues: { ...enrolmentValues, email: '' },
      registrationId: registration.id,
      seatsReservation: getMockedSeatsReservationData(1000),
    });

    singletonRouter.push({
      pathname: ROUTES.CREATE_ENROLMENT,
      query: { registrationId: registration.id },
    });

    render(<CreateEnrolmentPage />);

    await isHeadingRendered(event.name.fi as string);
  });

  it('should prefetch data', async () => {
    setQueryMocks(...mocks);

    const { props } = (await getCreateEnrolmentPageServerSideProps({
      locale: 'fi',
      query: { registrationId: registration.id },
    } as unknown as GetServerSidePropsContext)) as {
      props: EnrolmentServerSideProps;
    };

    expect(props.dehydratedState.queries).toEqual([
      {
        queryHash: `["registration","${TEST_REGISTRATION_ID}"]`,
        queryKey: ['registration', TEST_REGISTRATION_ID],
        state: expect.objectContaining({ data: registration }),
      },
    ]);
  });
});

describe('SummaryPage', () => {
  it('should render heading', async () => {
    setQueryMocks(...mocks);

    setEnrolmentFormSessionStorageValues({
      enrolmentFormValues: { ...enrolmentValues, email: '' },
      registrationId: registration.id,
      seatsReservation: getMockedSeatsReservationData(1000),
    });

    singletonRouter.push({
      pathname: ROUTES.CREATE_ENROLMENT_SUMMARY,
      query: { registrationId: registration.id },
    });

    render(<SummaryPage />);

    await isHeadingRendered(event.name.fi as string);
  });

  it('should prefetch data', async () => {
    setQueryMocks(...mocks);

    const { props } = (await getSummaryPageServerSideProps({
      locale: 'fi',
      query: { registrationId: registration.id },
    } as unknown as GetServerSidePropsContext)) as {
      props: EnrolmentServerSideProps;
    };

    expect(props.dehydratedState.queries).toEqual([
      {
        queryHash: `["registration","${TEST_REGISTRATION_ID}"]`,
        queryKey: ['registration', TEST_REGISTRATION_ID],
        state: expect.objectContaining({ data: registration }),
      },
    ]);
  });
});

describe('EnrolmentCompletedPage', () => {
  it('should render heading', async () => {
    setQueryMocks(...mocks);

    singletonRouter.push({
      pathname: ROUTES.ENROLMENT_COMPLETED,
      query: { enrolmentId: enrolment.id, registrationId: registration.id },
    });

    render(<EnrolmentCompletedPage />);

    await isHeadingRendered('Kiitos ilmoittautumisestasi!');
  });

  it('should prefetch data', async () => {
    setQueryMocks(...mocks);

    const { props } = (await getEnrolmentCompletedPageServerSideProps({
      locale: 'fi',
      query: { registrationId: registration.id },
    } as unknown as GetServerSidePropsContext)) as {
      props: EnrolmentServerSideProps;
    };

    expect(props.dehydratedState.queries).toEqual([
      {
        queryHash: `["registration","${TEST_REGISTRATION_ID}"]`,
        queryKey: ['registration', TEST_REGISTRATION_ID],
        state: expect.objectContaining({ data: registration }),
      },
    ]);
  });
});

describe('EditEnrolmentPage', () => {
  it('should render heading', async () => {
    setQueryMocks(...mocks);

    singletonRouter.push({
      pathname: ROUTES.EDIT_ENROLMENT,
      query: {
        accessCode: enrolment.cancellation_code,
        enrolmentId: enrolment.id,
        registrationId: registration.id,
      },
    });

    render(<EditEnrolmentPage />);

    await isHeadingRendered(event.name.fi as string);
  });

  it('should prefetch data', async () => {
    setQueryMocks(...mocks);

    const { props } = (await getEditEnrolmentPageServerSideProps({
      locale: 'fi',
      query: {
        accessCode: enrolment.cancellation_code,
        enrolmentId: enrolment.id,
        registrationId: registration.id,
      },
    } as unknown as GetServerSidePropsContext)) as {
      props: EnrolmentServerSideProps;
    };

    expect(props.dehydratedState.queries).toEqual([
      {
        queryHash: `["registration","${TEST_REGISTRATION_ID}"]`,
        queryKey: ['registration', TEST_REGISTRATION_ID],
        state: expect.objectContaining({ data: registration }),
      },
      {
        queryHash: `["enrolment","${TEST_ENROLMENT_ID}"]`,
        queryKey: ['enrolment', TEST_ENROLMENT_ID],
        state: expect.objectContaining({ data: enrolment }),
      },
    ]);
  });
});

describe('EnrolmentCancelledPage', () => {
  it('should render heading', async () => {
    setQueryMocks(...mocks);

    singletonRouter.push({
      pathname: ROUTES.ENROLMENT_CANCELLED,
      query: { registrationId: registration.id },
    });

    render(<EnrolmentCancelledPage />);

    await isHeadingRendered('Ilmoittautumisesi on peruttu');
  });

  it('should prefetch data', async () => {
    setQueryMocks(...mocks);

    const { props } = (await getEnrolmentCancelledPageServerSideProps({
      locale: 'fi',
      query: { registrationId: registration.id },
    } as unknown as GetServerSidePropsContext)) as {
      props: EnrolmentServerSideProps;
    };

    expect(props.dehydratedState.queries).toEqual([
      {
        queryHash: `["registration","${TEST_REGISTRATION_ID}"]`,
        queryKey: ['registration', TEST_REGISTRATION_ID],
        state: expect.objectContaining({ data: registration }),
      },
    ]);
  });
});
