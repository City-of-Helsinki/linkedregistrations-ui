import * as Sentry from '@sentry/browser';
import jsdom from 'jsdom';
import Document, {
  DocumentProps,
  Html,
  Head,
  Main,
  NextScript,
} from 'next/document';
import React from 'react';

process.on('unhandledRejection', (err) => {
  Sentry.captureException(err);
});

process.on('uncaughtException', (err) => {
  Sentry.captureException(err);
});

const document = new jsdom.JSDOM('<!DOCTYPE html>').window.document;
global.document = document;

class MyDocument extends Document<DocumentProps> {
  render(): React.ReactElement {
    return (
      <Html>
        <Head>
          {Array.from(document.head.getElementsByTagName('style')).map(
            (style, index) => (
              <style key={index} type={style.type}>
                {style.innerHTML}
              </style>
            )
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
