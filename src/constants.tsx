

const SITEURL_DEV = "http://localhost:9000";
const SITEURL_PROD = "https://ru-in.com";
const APIURL_DEV = "http://localhost:3000";
const APIURL_PROD = "";

export const SITEURL = process.env.NODE_ENV === "development" ? SITEURL_DEV : SITEURL_PROD;
export const APIURL = process.env.NODE_ENV === "development" ? APIURL_DEV : APIURL_PROD;
export const SITEURL_CLOUDFRONT = 'd90b7j8wcmcte.cloudfront.net';