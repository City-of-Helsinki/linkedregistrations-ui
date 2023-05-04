export type dateOrNull = Date | null;
export type numberOrNull = number | null;
export type stringOrNull = string | null;

export type LocalisedObject = {
  ar?: stringOrNull;
  en?: stringOrNull;
  fi?: stringOrNull;
  ru?: stringOrNull;
  sv?: stringOrNull;
  zh_hans?: stringOrNull;
};

export type Meta = {
  count: number;
  next: stringOrNull;
  previous: stringOrNull;
};
