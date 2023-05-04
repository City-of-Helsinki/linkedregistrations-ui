import React from 'react';

import { Registration } from '../../registration/types';
import { getRegistrationFields } from '../../registration/utils';

type Props = {
  registration: Registration;
};

const ConfirmationMessage: React.FC<Props> = ({ registration }) => {
  const { confirmationMessage } = getRegistrationFields(registration);
  const confirmationMessageParts = confirmationMessage.split('\n');

  return (
    <>
      {confirmationMessageParts.map((part) => (
        <p key={part}>{part}</p>
      ))}
    </>
  );
};

export default ConfirmationMessage;
