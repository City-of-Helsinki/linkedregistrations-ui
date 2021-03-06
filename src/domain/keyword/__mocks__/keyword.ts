import range from 'lodash/range';

import {
  fakeKeywords,
  fakeLocalisedObject,
} from '../../../utils/mockDataUtils';
import { Keyword } from '../types';

export const keywordsOverrides: Partial<Keyword>[] = range(1, 5).map(
  (index) => ({
    id: `keyword:${index}`,
    name: fakeLocalisedObject(`Keyword name ${index}`),
  })
);
export const keywordName = keywordsOverrides[0].name?.fi;
export const keywordId = keywordsOverrides[0].id;
export const keywordsResponse = fakeKeywords(
  keywordsOverrides.length,
  keywordsOverrides
);
export const keyword = keywordsResponse.data[0];
