import { NextRequest, NextResponse } from 'next/server'
 
const cspReportingEndpoints = process.env.NEXT_CSP_REPORTING_ENDPOINTS;
const cspPolicy = process.env.NEXT_CSP_POLICY;
// default to report only, unless really set to 'false'
const cspReportOnly = !(process.env.NEXT_CSP_REPORT_ONLY === 'false')
const cspHeader = cspReportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';

export function middleware(request: NextRequest) {

  const response = NextResponse.next()

  if (cspPolicy) {
    response.headers.set(cspHeader, cspPolicy);
    if (cspReportingEndpoints) {
      response.headers.set('Reporting-Endpoints', cspReportingEndpoints);
    }
  }

  return response
}
