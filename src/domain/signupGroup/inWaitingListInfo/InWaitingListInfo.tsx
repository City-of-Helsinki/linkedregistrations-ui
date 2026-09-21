import { Tooltip } from 'hds-react';
import { useTranslation } from 'next-i18next/pages';
import React, { FC } from 'react';

import styles from './inWaitingListInfo.module.scss';

const InWaitingListInfo: FC = () => {
  const { t } = useTranslation('signup');

  return (
    <span className={styles.inWaitingListInfo}>
      {t('inWaitingList.text')}
      <div>
        <Tooltip className={styles.tooltip}>
          {t('inWaitingList.tooltip')}
        </Tooltip>
      </div>
    </span>
  );
};

export default InWaitingListInfo;
