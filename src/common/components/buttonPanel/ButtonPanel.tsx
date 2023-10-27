import classNames from 'classnames';
import { IconArrowLeft } from 'hds-react';
import React from 'react';

import Button from '../../../common/components/button/Button';
import Container from '../../../domain/app/layout/container/Container';

import styles from './buttonPanel.module.scss';

export interface ButtonPanelProps {
  backButtonAriaLabel: string;
  onBack?: () => void;
  submitButtons?: React.ReactElement[];
  withOffset?: boolean;
}

const SCROLL_OFFSET = 40;

const ButtonPanel: React.FC<ButtonPanelProps> = ({
  backButtonAriaLabel,
  onBack,
  submitButtons,
  withOffset = true,
}) => {
  const buttonPanel = React.useRef<HTMLDivElement>(null);

  /* istanbul ignore next */
  const onDocumentFocusin = (event: FocusEvent) => {
    const target = event.target;

    if (
      target instanceof HTMLElement &&
      !buttonPanel.current?.contains(target)
    ) {
      const buttonPanelRect = buttonPanel.current?.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      if (
        buttonPanelRect &&
        buttonPanelRect.top < targetRect.bottom &&
        window.innerHeight === buttonPanelRect.bottom
      ) {
        window.scrollBy(
          0,
          targetRect.bottom - buttonPanelRect.top + SCROLL_OFFSET
        );
      }
    }
  };

  React.useEffect(() => {
    document.addEventListener('focusin', onDocumentFocusin);

    return () => {
      document.removeEventListener('focusin', onDocumentFocusin);
    };
  });

  return (
    <div ref={buttonPanel} className={styles.buttonPanel}>
      <Container
        className={classNames({ [styles.noOffset]: !withOffset })}
        withOffset={withOffset}
      >
        <div className={styles.formContainer}>
          <div className={styles.buttonsRow}>
            <div
              className={classNames(styles.submitButtons, {
                [styles.hideOnMobile]: !submitButtons?.length,
              })}
            >
              {submitButtons}
            </div>
            <div
              className={classNames(styles.otherButtons, {
                [styles.hideOnMobile]: !onBack,
              })}
            >
              {onBack && (
                <Button
                  className={classNames(styles.backButton, styles.smallButton)}
                  iconLeft={<IconArrowLeft aria-hidden />}
                  fullWidth={true}
                  onClick={onBack}
                  type="button"
                  variant="secondary"
                >
                  {backButtonAriaLabel}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ButtonPanel;
