const importProxy = async () => {
  vi.resetModules();
  return import('../proxy');
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('proxy', () => {
  it('does not set any CSP headers when no policy is configured', async () => {
    const { proxy } = await importProxy();
    const response = proxy();

    expect(response.headers.get('Content-Security-Policy')).toBeNull();
    expect(
      response.headers.get('Content-Security-Policy-Report-Only')
    ).toBeNull();
    expect(response.headers.get('Reporting-Endpoints')).toBeNull();
  });

  it.each([
    ['unset', undefined],
    ['any value other than "false"', 'true'],
  ])(
    'sets the report-only CSP header when NEXT_CSP_REPORT_ONLY is %s',
    async (_label, reportOnlyValue) => {
      vi.stubEnv('NEXT_CSP_POLICY', 'test-policy');
      if (reportOnlyValue !== undefined) {
        vi.stubEnv('NEXT_CSP_REPORT_ONLY', reportOnlyValue);
      }
      const { proxy } = await importProxy();
      const response = proxy();

      expect(response.headers.get('Content-Security-Policy-Report-Only')).toBe(
        'test-policy'
      );
      expect(response.headers.get('Content-Security-Policy')).toBeNull();
    }
  );

  it('sets the enforcing CSP header when NEXT_CSP_REPORT_ONLY is "false"', async () => {
    vi.stubEnv('NEXT_CSP_POLICY', 'test-policy');
    vi.stubEnv('NEXT_CSP_REPORT_ONLY', 'false');
    const { proxy } = await importProxy();
    const response = proxy();

    expect(response.headers.get('Content-Security-Policy')).toBe('test-policy');
    expect(
      response.headers.get('Content-Security-Policy-Report-Only')
    ).toBeNull();
  });

  it('sets the Reporting-Endpoints header alongside a configured CSP policy', async () => {
    vi.stubEnv('NEXT_CSP_POLICY', 'test-policy');
    vi.stubEnv('NEXT_CSP_REPORTING_ENDPOINTS', 'test-endpoint');
    const { proxy } = await importProxy();
    const response = proxy();

    expect(response.headers.get('Reporting-Endpoints')).toBe('test-endpoint');
  });

  it('does not set the Reporting-Endpoints header without a CSP policy', async () => {
    vi.stubEnv('NEXT_CSP_REPORTING_ENDPOINTS', 'test-endpoint');
    const { proxy } = await importProxy();
    const response = proxy();

    expect(response.headers.get('Reporting-Endpoints')).toBeNull();
  });

  it('exports a matcher config that excludes files with extensions', async () => {
    const { config } = await importProxy();

    expect(config.matcher).toBe('/((?!.*\\.).*)');
  });
});
