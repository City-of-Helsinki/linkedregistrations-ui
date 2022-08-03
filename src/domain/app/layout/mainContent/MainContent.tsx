import React from 'react';

import { MAIN_CONTENT_ID } from '../../../../constants';

interface Props {
  className?: string;
}

const MainContent: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  className,
}) => {
  const mainContent = React.useRef<HTMLDivElement>(null);

  return (
    <main className={className} id={MAIN_CONTENT_ID} ref={mainContent}>
      {children}
    </main>
  );
};

export default MainContent;
