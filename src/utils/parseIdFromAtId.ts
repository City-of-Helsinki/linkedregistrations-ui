const parseIdFromAtId = (atId: string | null): string | null =>
  atId?.split('/').findLast(Boolean) || null;

export default parseIdFromAtId;
