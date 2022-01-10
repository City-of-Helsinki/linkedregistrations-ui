import * as Sentry from '@sentry/browser';

const reportError = ({
  data,
  message,
}: {
  data: { error: Record<string, unknown> } & Record<string, unknown>;
  message: string;
}): string => {
  const { error, ...restData } = data;
  const reportObject = {
    extra: {
      data: {
        ...restData,
        currentUrl: window.location.href,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        errorAsString: JSON.stringify(error),
      },
      level: 'error',
    },
  };

  return Sentry.captureException(message, reportObject);
};

export { reportError };
