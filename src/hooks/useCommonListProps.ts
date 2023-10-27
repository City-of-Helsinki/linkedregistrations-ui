import omit from 'lodash/omit';
import { useRouter } from 'next/router';
import React from 'react';
import { scroller } from 'react-scroll';

import { Meta } from '../domain/api/types';
import { CommonListProps } from '../types';
import getPageCount from '../utils/getPageCount';
import replaceParamsToQueryString from '../utils/replaceParamsToQueryString';

type UseCommonListPropsState = {
  count: number;
} & CommonListProps;

type Props = {
  listId: string;
  meta: Meta | undefined;
  pageSize: number;
};

const useCommonListProps = ({
  listId,
  meta,
  pageSize,
}: Props): UseCommonListPropsState => {
  const router = useRouter();

  const replaceQueryParams = (queryParams: Record<string, unknown>) => {
    const [, search] = router.asPath.split('?');
    return replaceParamsToQueryString(
      search,
      queryParams,
      ({ value }) => value
    );
  };

  const onPageChange = (
    event:
      | React.MouseEvent<HTMLAnchorElement>
      | React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    event.preventDefault();

    const pageNumber = index + 1;
    router.push({
      pathname: router.pathname,
      query:
        pageNumber > 1
          ? { ...router.query, page: pageNumber }
          : omit(router.query, 'page'),
    });

    // Scroll to the beginning of the list
    scroller.scrollTo(listId, { offset: -100 });
  };

  const pageHref = (index: number) => {
    router.query;
    const [pathname] = router.asPath.split('?');
    const searchQuery = replaceQueryParams({ page: index > 1 ? index : null });

    return `${pathname}${searchQuery}`;
  };

  const count = meta?.count ?? 0;
  const pageCount = getPageCount(count, pageSize);

  return {
    count,
    onPageChange,
    pageCount,
    pageHref,
  };
};

export default useCommonListProps;
