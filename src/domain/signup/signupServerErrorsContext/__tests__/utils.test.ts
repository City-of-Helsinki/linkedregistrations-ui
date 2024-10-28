/* eslint-disable import/no-named-as-default-member */
/* eslint-disable @typescript-eslint/no-explicit-any */
import i18n from 'i18next';

import {
  parseSeatsReservationServerErrors,
  parseSignupGroupServerErrors,
} from '../utils';

describe('parseSignupGroupServerErrors', () => {
  it('should set server error items', async () => {
    const error = {
      contact_person: {
        email: ['Tämän kentän arvo ei voi olla "null".'],
      },
      registration: ['The name must be specified.'],
      signups: [
        {
          city: ['Tämän kentän arvo ei voi olla "null".'],
          detail: 'The participant is too old.',
          first_name: ['The name must be specified.'],
          non_field_errors: [
            'Kenttien email, registration tulee muodostaa uniikki joukko.',
            'Kenttien phone_number, registration tulee muodostaa uniikki joukko.',
          ],
        },
      ],
    };

    expect(
      parseSignupGroupServerErrors({ error, t: i18n.t.bind(i18n) })
    ).toEqual([
      {
        label: 'Sähköpostiosoite',
        message: 'Tämän kentän arvo ei voi olla "null".',
      },
      { label: 'Ilmoittautuminen', message: 'Nimi on pakollinen.' },
      { label: 'Kaupunki', message: 'Tämän kentän arvo ei voi olla "null".' },
      { label: '', message: 'Osallistuja on liian vanha.' },
      { label: 'Etunimi', message: 'Nimi on pakollinen.' },
      { label: '', message: 'Sähköpostiosoitteella on jo ilmoittautuminen.' },
    ]);

    expect(
      parseSignupGroupServerErrors({
        error: { contact_person: ['Tämän kentän arvo ei voi olla "null".'] },
        t: i18n.t.bind(i18n),
      })
    ).toEqual([
      {
        label: 'Yhteyshenkilö',
        message: 'Tämän kentän arvo ei voi olla "null".',
      },
    ]);
  });

  it('should return server error items when result is array', () => {
    const error = [
      { first_name: ['The name must be specified.'] },
      { last_name: ['The name must be specified.'] },
    ];

    expect(
      parseSignupGroupServerErrors({ error, t: i18n.t.bind(i18n) })
    ).toEqual([
      { label: 'Etunimi', message: 'Nimi on pakollinen.' },
      { label: 'Sukunimi', message: 'Nimi on pakollinen.' },
    ]);
  });

  it('should return server error items when result is array of string', () => {
    const error = ['Could not find all objects to update.'];

    expect(
      parseSignupGroupServerErrors({ error, t: i18n.t.bind(i18n) })
    ).toEqual([
      { label: '', message: 'Kaikkia päivitettäviä objekteja ei löytynyt.' },
    ]);
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
