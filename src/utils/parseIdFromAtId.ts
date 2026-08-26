const parseIdFromAtId = (atId: string | null): string | null =>
  atId?.split('/').findLast((t) => t) || null;

export default parseIdFromAtId;
