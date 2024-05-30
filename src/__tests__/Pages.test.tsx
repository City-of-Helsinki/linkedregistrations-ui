/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-require-imports */
import '../tests/mockNextAuth';

import { DehydratedState } from '@tanstack/react-query';
import subYears from 'date-fns/subYears';
import { rest } from 'msw';
import { GetServerSidePropsContext } from 'next';
import singletonRouter from 'next/router';
import React from 'react';

import { ROUTES } from '../domain/app/routes/constants';
import { mockedRegistrationWithUserAccessResponse } from '../domain/attendanceList/__mocks__/attendanceListPage';
import { eventName } from '../domain/event/__mocks__/event';
import { mockedLanguagesResponses } from '../domain/language/__mocks__/languages';
import { TEST_ORDER_ID } from '../domain/order/constants';
import { registration } from '../domain/registration/__mocks__/registration';
import { TEST_REGISTRATION_ID } from '../domain/registration/constants';
import { signup } from '../domain/signup/__mocks__/signup';
import {
  TEST_CONTACT_PERSON_ID,
  TEST_SIGNUP_ID,
} from '../domain/signup/constants';
import { signupGroup } from '../domain/signupGroup/__mocks__/signupGroup';
import {
  NOTIFICATIONS,
  TEST_SIGNUP_GROUP_ID,
} from '../domain/signupGroup/constants';
import { SignupGroupFormFields } from '../domain/signupGroup/types';
import { mockedUserResponse } from '../domain/user/__mocks__/user';
import { TEST_USER_ID } from '../domain/user/constants';
import PaymentCancelledPage, {
  getServerSideProps as getPaymentCancelledPageServerSideProps,
} from '../pages/failure';
import LogoutPage, {
  getServerSideProps as getLogoutPageServerSideProps,
} from '../pages/logout';
import AttendanceListPage, {
  getServerSideProps as getAttendanceListPageServerSideProps,
} from '../pages/registration/[registrationId]/attendance-list/index';
import SignupCompletedPage, {
  getServerSideProps as getSignupCompletedPageServerSideProps,
} from '../pages/registration/[registrationId]/signup/[signupId]/completed';
import EditSignupPage, {
  getServerSideProps as getEditSignupPageServerSideProps,
} from '../pages/registration/[registrationId]/signup/[signupId]/edit/index';
import SignupCancelledPage, {
  getServerSideProps as getSignupCancelledPageServerSideProps,
} from '../pages/registration/[registrationId]/signup/cancelled/index';
import SignupsPage, {
  getServerSideProps as getSignupsPageServerSideProps,
} from '../pages/registration/[registrationId]/signup/index';
import SignupGroupCompletedPage, {
  getServerSideProps as getSignupGroupCompletedPageServerSideProps,
} from '../pages/registration/[registrationId]/signup-group/[signupGroupId]/completed';
import EditSignupGroupPage, {
  getServerSideProps as getEditSignupGroupPageServerSideProps,
} from '../pages/registration/[registrationId]/signup-group/[signupGroupId]/edit/index';
import SignupGroupCancelledPage, {
  getServerSideProps as getSignupGroupCancelledPageServerSideProps,
} from '../pages/registration/[registrationId]/signup-group/cancelled/index';
import CreateSignupGroupPage, {
  getServerSideProps as getCreateSignupGroupPageServerSideProps,
} from '../pages/registration/[registrationId]/signup-group/create/index';
import SummaryPage, {
  getServerSideProps as getSummaryPageServerSideProps,
} from '../pages/registration/[registrationId]/signup-group/create/summary/index';
import PaymentCompletedPage, {
  getServerSideProps as getPaymentCompletedPageServerSideProps,
} from '../pages/success';
import { ExtendedSSRConfig } from '../types';
import formatDate from '../utils/formatDate';
import {
  getMockedSeatsReservationData,
  setSignupGroupFormSessionStorageValues,
} from '../utils/mockDataUtils';
import { mockDefaultConfig } from '../utils/mockNextJsConfig';
import {
  fakeWebStoreOrder,
  fakeWebStorePayment,
} from '../utils/mockWebStoreDataUtils';
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

const order = fakeWebStoreOrder();
const payment = fakeWebStorePayment();

const isHeadingRendered = async (heading: string | RegExp) => {
  await loadingSpinnerIsNotInDocument();
  await screen.findByRole('heading', { name: heading }, { timeout: 5000 });
};

const isWebStoreOrderInDehydratedState = (dehydratedState: DehydratedState) => {
  expect(dehydratedState.queries).toEqual(
    expect.arrayContaining([
      {
        queryHash: `["order","${TEST_ORDER_ID}"]`,
        queryKey: ['order', TEST_ORDER_ID],
        state: expect.objectContaining({ data: order }),
      },
    ])
  );
};

const isWebStorePaymentInDehydratedState = (
  dehydratedState: DehydratedState
) => {
  expect(dehydratedState.queries).toEqual(
    expect.arrayContaining([
      {
        queryHash: `["payment","${TEST_ORDER_ID}"]`,
        queryKey: ['payment', TEST_ORDER_ID],
        state: expect.objectContaining({ data: payment }),
      },
    ])
  );
};

const isRegistrationInDehydratedState = (dehydratedState: DehydratedState) => {
  expect(dehydratedState.queries).toEqual(
    expect.arrayContaining([
      {
        queryHash: `["registration","${TEST_REGISTRATION_ID}"]`,
        queryKey: ['registration', TEST_REGISTRATION_ID],
        state: expect.objectContaining({ data: registration }),
      },
    ])
  );
};

const isSignupInDehydratedState = (dehydratedState: DehydratedState) => {
  expect(dehydratedState.queries).toEqual(
    expect.arrayContaining([
      {
        queryHash: `["signup","${TEST_SIGNUP_ID}"]`,
        queryKey: ['signup', TEST_SIGNUP_ID],
        state: expect.objectContaining({ data: signup }),
      },
    ])
  );
};

const isSignupGroupInDehydratedState = (dehydratedState: DehydratedState) => {
  expect(dehydratedState.queries).toEqual(
    expect.arrayContaining([
      {
        queryHash: `["signupGroup","${TEST_SIGNUP_GROUP_ID}"]`,
        queryKey: ['signupGroup', TEST_SIGNUP_GROUP_ID],
        state: expect.objectContaining({ data: signupGroup }),
      },
    ])
  );
};

const signupGroupValues: SignupGroupFormFields = {
  contactPerson: {
    email: 'participant@email.com',
    firstName: 'First name',
    lastName: 'Last name',
    id: TEST_CONTACT_PERSON_ID,
    membershipNumber: '',
    nativeLanguage: 'fi',
    notifications: [NOTIFICATIONS.EMAIL],
    phoneNumber: '358 44 123 4567',
    serviceLanguage: 'fi',
  },
  extraInfo: '',
  signups: [
    {
      city: 'City',
      dateOfBirth: formatDate(subYears(new Date(), 9)),
      extraInfo: '',
      firstName: 'First name',
      id: TEST_SIGNUP_ID,
      inWaitingList: false,
      lastName: 'Last name',
      phoneNumber: '0441234567',
      priceGroup: '',
      streetAddress: 'Street address',
      zipcode: '00100',
    },
  ],
  userConsent: true,
};

const mocks = [
  ...mockedLanguagesResponses,
  mockedUserResponse,
  rest.get(`*/order/${TEST_ORDER_ID}`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(order))
  ),
  rest.get(`*/payment/${TEST_ORDER_ID}`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(payment))
  ),
  rest.get(`*/registration/${TEST_REGISTRATION_ID}/`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(registration))
  ),
  rest.get(`*/signup/*`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(signup))
  ),
  rest.get(`*/signup_group/*`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(signupGroup))
  ),
];

beforeEach(() => {
  setQueryMocks(...mocks);
});

describe('AttendanceListPage', () => {
  it('should render heading', async () => {
    setQueryMocks(mockedUserResponse, mockedRegistrationWithUserAccessResponse);
    singletonRouter.push({
      pathname: ROUTES.ATTENDANCE_LIST,
      query: { registrationId: registration.id },
    });

    render(<AttendanceListPage />);
    await loadingSpinnerIsNotInDocument(4000);

    await isHeadingRendered(eventName);
  });

  it('should prefetch data', async () => {
    const { props } = (await getAttendanceListPageServerSideProps({
      locale: 'fi',
      query: { registrationId: registration.id },
    } as unknown as GetServerSidePropsContext)) as {
      props: ExtendedSSRConfig;
    };

    isRegistrationInDehydratedState(props.dehydratedState);
  });
});

describe('SignupsPage', () => {
  it('should render heading', async () => {
    setQueryMocks(mockedUserResponse, mockedRegistrationWithUserAccessResponse);
    singletonRouter.push({
      pathname: ROUTES.SIGNUPS,
      query: { registrationId: registration.id },
    });

    render(<SignupsPage />);
    await loadingSpinnerIsNotInDocument(4000);

    await isHeadingRendered(eventName);
  });

  it('should prefetch data', async () => {
    const { props } = (await getSignupsPageServerSideProps({
      locale: 'fi',
      query: { registrationId: registration.id },
    } as unknown as GetServerSidePropsContext)) as {
      props: ExtendedSSRConfig;
    };

    isRegistrationInDehydratedState(props.dehydratedState);
  });
});

describe('CreateSignupGroupPage', () => {
  it('should render heading', async () => {
    setSignupGroupFormSessionStorageValues({
      registrationId: registration.id,
      seatsReservation: getMockedSeatsReservationData(1000),
      signupGroupFormValues: signupGroupValues,
    });

    singletonRouter.push({
      pathname: ROUTES.CREATE_SIGNUP_GROUP,
      query: { registrationId: registration.id },
    });

    render(<CreateSignupGroupPage />);

    await isHeadingRendered(eventName);
  });

  it('should prefetch data', async () => {
    const { props } = (await getCreateSignupGroupPageServerSideProps({
      locale: 'fi',
      query: { registrationId: registration.id },
    } as unknown as GetServerSidePropsContext)) as {
      props: ExtendedSSRConfig;
    };

    isRegistrationInDehydratedState(props.dehydratedState);
  });
});

describe('EditSignupGroupPage', () => {
  it('should render heading', async () => {
    singletonRouter.push({
      pathname: ROUTES.EDIT_SIGNUP_GROUP,
      query: {
        registrationId: registration.id,
        signupGroupId: signupGroup.id,
      },
    });

    render(<EditSignupGroupPage />);

    await isHeadingRendered(eventName);
  });

  it('should prefetch data', async () => {
    const { props } = (await getEditSignupGroupPageServerSideProps({
      locale: 'fi',
      query: {
        registrationId: registration.id,
        signupGroupId: signupGroup.id,
      },
    } as unknown as GetServerSidePropsContext)) as {
      props: ExtendedSSRConfig;
    };

    isRegistrationInDehydratedState(props.dehydratedState);
    isSignupGroupInDehydratedState(props.dehydratedState);
  });
});

describe('SignupGroupCancelledPage', () => {
  it('should render heading', async () => {
    singletonRouter.push({
      pathname: ROUTES.SIGNUP_GROUP_CANCELLED,
      query: { registrationId: registration.id },
    });

    render(<SignupGroupCancelledPage />);

    await isHeadingRendered('Ilmoittautumisesi on peruttu');
  });

  it('should prefetch data', async () => {
    const { props } = (await getSignupGroupCancelledPageServerSideProps({
      locale: 'fi',
      query: { registrationId: registration.id },
    } as unknown as GetServerSidePropsContext)) as {
      props: ExtendedSSRConfig;
    };

    isRegistrationInDehydratedState(props.dehydratedState);
  });
});

describe('SummaryPage', () => {
  it('should render heading', async () => {
    setSignupGroupFormSessionStorageValues({
      registrationId: registration.id,
      seatsReservation: getMockedSeatsReservationData(1000),
      signupGroupFormValues: signupGroupValues,
    });

    singletonRouter.push({
      pathname: ROUTES.CREATE_SIGNUP_GROUP_SUMMARY,
      query: { registrationId: registration.id },
    });

    render(<SummaryPage />);

    await isHeadingRendered(eventName);
  });

  it('should prefetch data', async () => {
    const { props } = (await getSummaryPageServerSideProps({
      locale: 'fi',
      query: { registrationId: registration.id },
    } as unknown as GetServerSidePropsContext)) as {
      props: ExtendedSSRConfig;
    };

    isRegistrationInDehydratedState(props.dehydratedState);
  });
});

describe('SignupCompletedPage', () => {
  it('should render heading', async () => {
    singletonRouter.push({
      pathname: ROUTES.SIGNUP_COMPLETED,
      query: { signupId: signup.id, registrationId: registration.id },
    });

    render(<SignupCompletedPage />);

    await isHeadingRendered('Kiitos ilmoittautumisestasi!');
  });

  it('should prefetch data', async () => {
    const { props } = (await getSignupCompletedPageServerSideProps({
      locale: 'fi',
      query: { registrationId: registration.id, signupId: signup.id },
    } as unknown as GetServerSidePropsContext)) as {
      props: ExtendedSSRConfig;
    };

    isRegistrationInDehydratedState(props.dehydratedState);
    isSignupInDehydratedState(props.dehydratedState);
  });
});

describe('SignupGroupCompletedPage', () => {
  it('should render heading', async () => {
    singletonRouter.push({
      pathname: ROUTES.SIGNUP_GROUP_COMPLETED,
      query: { signupGroupId: signupGroup.id, registrationId: registration.id },
    });

    render(<SignupGroupCompletedPage />);

    await isHeadingRendered('Kiitos ilmoittautumisestasi!');
  });

  it('should prefetch data', async () => {
    const { props } = (await getSignupGroupCompletedPageServerSideProps({
      locale: 'fi',
      query: { registrationId: registration.id, signupGroupId: signupGroup.id },
    } as unknown as GetServerSidePropsContext)) as {
      props: ExtendedSSRConfig;
    };

    isRegistrationInDehydratedState(props.dehydratedState);
    isSignupGroupInDehydratedState(props.dehydratedState);
  });
});

describe('EditSignupPage', () => {
  it('should render heading', async () => {
    singletonRouter.push({
      pathname: ROUTES.EDIT_SIGNUP,
      query: {
        registrationId: registration.id,
        signupId: signup.id,
      },
    });

    render(<EditSignupPage />);

    await isHeadingRendered(eventName);
  });

  it('should prefetch data', async () => {
    const { props } = (await getEditSignupPageServerSideProps({
      locale: 'fi',
      query: {
        registrationId: registration.id,
        signupId: signup.id,
      },
    } as unknown as GetServerSidePropsContext)) as {
      props: ExtendedSSRConfig;
    };

    isRegistrationInDehydratedState(props.dehydratedState);
    isSignupInDehydratedState(props.dehydratedState);
  });
});

describe('SignupCancelledPage', () => {
  it('should render heading', async () => {
    singletonRouter.push({
      pathname: ROUTES.SIGNUP_CANCELLED,
      query: { registrationId: registration.id },
    });

    render(<SignupCancelledPage />);

    await isHeadingRendered('Ilmoittautumisesi on peruttu');
  });

  it('should prefetch data', async () => {
    const { props } = (await getSignupCancelledPageServerSideProps({
      locale: 'fi',
      query: { registrationId: registration.id },
    } as unknown as GetServerSidePropsContext)) as {
      props: ExtendedSSRConfig;
    };

    isRegistrationInDehydratedState(props.dehydratedState);
  });
});

describe('LogoutPage', () => {
  it('should render heading', async () => {
    singletonRouter.push({ pathname: ROUTES.LOGOUT });

    render(<LogoutPage />);

    await isHeadingRendered('Uloskirjautuminen');
  });

  it('should get correct translations namespaces', async () => {
    const { props } = (await getLogoutPageServerSideProps({
      locale: 'fi',
      query: { registrationId: registration.id },
    } as unknown as GetServerSidePropsContext)) as {
      props: ExtendedSSRConfig;
    };

    expect(props._nextI18Next?.ns).toEqual(['common']);
  });
});

describe('PaymentCancelledPage', () => {
  it('should render heading', async () => {
    singletonRouter.push({ pathname: ROUTES.PAYMENT_CANCELLED });

    render(<PaymentCancelledPage />);

    await isHeadingRendered('Maksu on peruutettu');
  });

  it('should get correct translations namespaces', async () => {
    const { props } = (await getPaymentCancelledPageServerSideProps({
      locale: 'fi',
    } as GetServerSidePropsContext)) as { props: ExtendedSSRConfig };

    expect(props._nextI18Next?.ns).toEqual(['common', 'paymentCancelled']);
  });
});

describe('PaymentCompletedPage', () => {
  it('should render heading', async () => {
    singletonRouter.push({
      pathname: ROUTES.PAYMENT_SUCCESS,
      query: { orderId: TEST_ORDER_ID, user: TEST_USER_ID },
    });

    render(<PaymentCompletedPage />);

    await isHeadingRendered('Maksu on suoritettu onnistuneesti');
  });

  it('should get correct translations namespaces', async () => {
    const { props } = (await getPaymentCompletedPageServerSideProps({
      locale: 'fi',
      query: { orderId: TEST_ORDER_ID, user: TEST_USER_ID },
    } as unknown as GetServerSidePropsContext)) as {
      props: ExtendedSSRConfig;
    };

    expect(props._nextI18Next?.ns).toEqual(['common', 'paymentCompleted']);
  });

  it('should prefetch data', async () => {
    const { props } = (await getPaymentCompletedPageServerSideProps({
      locale: 'fi',
      query: { orderId: TEST_ORDER_ID, user: TEST_USER_ID },
    } as unknown as GetServerSidePropsContext)) as {
      props: ExtendedSSRConfig;
    };

    isWebStoreOrderInDehydratedState(props.dehydratedState);
    isWebStorePaymentInDehydratedState(props.dehydratedState);
  });
});
