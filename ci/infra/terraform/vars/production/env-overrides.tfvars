# EDIT FOR ENVIRONMENT SPECIFIC ENV VARS for the app :: KEEP EMPTY IF NOT NEEDED

app_environment = {
  "APP_NAME" : "trading-hub",
  "MERCHANDISING_API_BASEURL" : "https://api.marksandspencer.com/merchandising",
  "NEXTAUTH_URL" : "https://merchandising-hub.search.marksandspencer.app/api/auth",
  "BUMP_ME_FOR_SECRETS_UPDATE" : "1",
  "NODE_ENV" : "production",
  "NODE_OPTIONS" : "--max-http-header-size 32768",
  "DYNATRACE_RUM_SCRIPT_URL" : "https://js-cdn.dynatrace.com/jstag/15fc9f135f3/bf94809uzh/8b5fd38038e5e2d3_complete.js"
}
allowed_origins = ["marksandspencer.com"]

enable_frontdoor_waf = true
frontdoor_waf_mode   = "Prevention"
akamai_enabled       = true
