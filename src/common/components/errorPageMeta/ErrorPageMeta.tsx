import Head from 'next/head';
import React from 'react';

export type ErrorPageMetaProps = {
  title: string;
  description: string;
};

const ErrorPageMeta: React.FC<ErrorPageMetaProps> = ({
  title,
  description,
}) => {
  const openGraphProperties = { description, title };

  return (
    <Head>
      <title>{openGraphProperties.title}</title>
      <meta name="description" content={openGraphProperties.description} />
      <meta name="twitter:card" content="summary" />
      {Object.entries(openGraphProperties)
        .filter((p) => p)
        .map(([property, value]) => (
          <meta key={property} property={`og:${property}`} content={value} />
        ))}
    </Head>
  );
};

export default ErrorPageMeta;
