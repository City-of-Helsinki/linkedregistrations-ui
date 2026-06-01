import * as hds from 'hds-react';
import { getCriticalHdsRules } from 'hds-react';
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentProps,
} from 'next/document';
import Script from 'next/script';

type Props = {
  hdsCriticalRules: string;
} & DocumentProps;

class MyDocument extends Document<Props> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    const hdsCriticalRules = await getCriticalHdsRules(
      initialProps.html,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (hds as any).hdsStyles
    );

    return { ...initialProps, hdsCriticalRules };
  }

  render() {
    return (
      <Html>
        <Head>
          <style
            data-used-styles
            dangerouslySetInnerHTML={{ __html: this.props.hdsCriticalRules }}
          />
          <Script src="/env-config.js" strategy="beforeInteractive" />
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
