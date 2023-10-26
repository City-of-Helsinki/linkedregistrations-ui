import classNames from 'classnames';
import { useTranslation } from 'next-i18next';
import React from 'react';

import MenuDropdown from '../../../../common/components/menuDropdown/MenuDropdown';
import { MenuItemOptionProps } from '../../../../common/components/menuDropdown/types';

import styles from './titleRow.module.scss';

type TitleRowProps = {
  actionItems?: MenuItemOptionProps[];
  editingInfo?: React.ReactElement;
  title: string;
};

const TitleRow = ({
  actionItems,
  editingInfo,
  title,
}: TitleRowProps): React.ReactElement => {
  const { t } = useTranslation('common');

  return (
    <div className={styles.titleRowWrapper}>
      <div className={styles.titleRow}>
        <div className={styles.title}>
          <h1>{title}</h1>
          {editingInfo}
        </div>
        <div className={classNames(styles.buttonWrapper)}>
          <div className={styles.actionsDropdown}>
            {!!actionItems?.length && (
              <MenuDropdown
                buttonLabel={t('common:buttonActions')}
                closeOnItemClick={true}
                items={actionItems}
                menuPosition="bottom"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitleRow;
