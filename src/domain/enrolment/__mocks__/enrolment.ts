import { fakeEnrolment } from '../../../utils/mockDataUtils';
import {
  TEST_ENROLMENT_CANCELLATION_CODE,
  TEST_ENROLMENT_ID,
} from '../constants';

const enrolment = fakeEnrolment({
  cancellation_code: TEST_ENROLMENT_CANCELLATION_CODE,
  id: TEST_ENROLMENT_ID,
});

export { enrolment };
