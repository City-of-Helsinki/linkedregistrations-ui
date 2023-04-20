import addDays from 'date-fns/addDays';
import subDays from 'date-fns/subDays';

import {
  fakeEvent,
  fakeRegistration,
  fakeRegistrations,
} from '../../../utils/mockDataUtils';
import { event } from '../../event/__mocks__/event';
import {
  TEST_EVENT_ID,
  TEST_EVENT_ID2,
  TEST_EVENT_ID3,
  TEST_EVENT_ID4,
  TEST_EVENT_ID5,
} from '../../event/constants';
import {
  REGISTRATION_MANDATORY_FIELDS,
  TEST_REGISTRATION_ID,
} from '../constants';
import { Registration } from '../types';

const now = new Date();
const enrolment_start_time = subDays(now, 1).toISOString();
const enrolment_end_time = addDays(now, 1).toISOString();
const registrationOverrides = {
  enrolment_end_time,
  enrolment_start_time,
  maximum_attendee_capacity: 10,
  waiting_list_capacity: 10,
};

const registration = fakeRegistration({
  ...registrationOverrides,
  id: TEST_REGISTRATION_ID,
  event,
  audience_max_age: 18,
  audience_min_age: 8,
  mandatory_fields: [REGISTRATION_MANDATORY_FIELDS.NAME],
});

const registrationsOverrides: Partial<Registration>[] = [
  {
    ...registrationOverrides,
    id: '1',
    event: fakeEvent({ id: TEST_EVENT_ID }),
    current_attendee_count: 0,
  },
  {
    ...registrationOverrides,
    id: '2',
    event: fakeEvent({ id: TEST_EVENT_ID2 }),
    current_attendee_count: registrationOverrides.maximum_attendee_capacity,
    current_waiting_list_count: 0,
  },
  {
    ...registrationOverrides,
    id: '3',
    event: fakeEvent({ id: TEST_EVENT_ID3 }),
    current_attendee_count: registrationOverrides.maximum_attendee_capacity,
    current_waiting_list_count: 0,
    waiting_list_capacity: null,
  },
  {
    ...registrationOverrides,
    id: '4',
    event: fakeEvent({ id: TEST_EVENT_ID4 }),
    current_attendee_count: registrationOverrides.maximum_attendee_capacity,
    current_waiting_list_count: registrationOverrides.waiting_list_capacity,
  },
  {
    ...registrationOverrides,
    id: '5',
    event: fakeEvent({ id: TEST_EVENT_ID5 }),
    current_attendee_count: 1000,
    maximum_attendee_capacity: 0,
  },
];

const registrationsResponse = fakeRegistrations(
  registrationsOverrides.length,
  registrationsOverrides
);

export { registration, registrationsResponse };
