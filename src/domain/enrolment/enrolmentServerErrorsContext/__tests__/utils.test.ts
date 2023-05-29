/* eslint-disable import/no-named-as-default-member */
/* eslint-disable @typescript-eslint/no-explicit-any */
import i18n from 'i18next';

import {
  parseEnrolmentServerErrors,
  parseSeatsReservationServerErrors,
} from '../utils';

describe('parseEnrolmentServerErrors', () => {
  it('should set server error items', async () => {
    const error = {
      name: ['The name must be specified.'],
      signups: [
        {
          non_field_errors: [
            'Kenttien email, registration tulee muodostaa uniikki joukko.',
          ],
        },
      ],
    };

    expect(parseEnrolmentServerErrors({ error, t: i18n.t.bind(i18n) })).toEqual(
      [
        { label: 'Nimi', message: 'Nimi on pakollinen.' },
        {
          label: '',
          message: 'Sähköpostiosoitteella on jo ilmoittautuminen.',
        },
      ]
    );
  });

  it('should return server error items when result is array', () => {
    const error = [
      { name: ['The name must be specified.'] },
      { name: ['The name must be specified.'] },
    ];

    expect(parseEnrolmentServerErrors({ error, t: i18n.t.bind(i18n) })).toEqual(
      [
        { label: 'Nimi', message: 'Nimi on pakollinen.' },
        { label: 'Nimi', message: 'Nimi on pakollinen.' },
      ]
    );
  });

  it('should return server error items when result is array of string', () => {
    const error = ['Could not find all objects to update.'];

    expect(parseEnrolmentServerErrors({ error, t: i18n.t.bind(i18n) })).toEqual(
      [{ label: '', message: 'Kaikkia päivitettäviä objekteja ei löytynyt.' }]
    );
  });
});

describe('parseSeatsReservationServerErrors', () => {
  it('should set server error items', async () => {
    const error = {
      name: ['The name must be specified.'],
    };

    expect(
      parseSeatsReservationServerErrors({ error, t: i18n.t.bind(i18n) })
    ).toEqual([{ label: 'name', message: 'Nimi on pakollinen.' }]);
  });

  it('should return server error items when result is array', () => {
    const error = [
      { name: ['The name must be specified.'] },
      { seats: ['Not enough seats available. Capacity left: 2.'] },
      { seats: ['Not enough capacity in the waiting list. Capacity left: 5.'] },
    ];

    expect(
      parseSeatsReservationServerErrors({ error, t: i18n.t.bind(i18n) })
    ).toEqual([
      { label: 'name', message: 'Nimi on pakollinen.' },
      {
        label: '',
        message: 'Paikkoja ei ole riittävästi jäljellä. Paikkoja jäljellä: 2.',
      },
      {
        label: '',
        message:
          'Jonopaikkoja ei ole riittävästi jäljellä. Paikkoja jäljellä: 5.',
      },
    ]);
  });

  it('should return server error items when result is array of string', () => {
    const error = ['Could not find all objects to update.'];

    expect(
      parseSeatsReservationServerErrors({ error, t: i18n.t.bind(i18n) })
    ).toEqual([
      { label: '', message: 'Kaikkia päivitettäviä objekteja ei löytynyt.' },
    ]);
  });
});
