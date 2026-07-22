# EDIT FOR ENVIRONMENT SPECIFIC ENV VARS for the layer3 - KEEP EMPTY IF NOT NEEDED
app_environment = {
  "APP_NAME" : "trading-hub",
  "MERCHANDISING_API_BASEURL" : "https://api-dev.marksandspencer.com/merchandising",
  "NODE_OPTIONS" : "--max-http-header-size 32768",
  "BUMP_ME_FOR_SECRETS_UPDATE" : "2",
  "NEXTAUTH_URL" : "https://dev-merchandising-hub.search.marksandspencer.app/api/auth/",
  "DYNATRACE_RUM_SCRIPT_URL" : "https://js-cdn.dynatrace.com/jstag/164ae1b51de/bf71713saa/85234af123535b2_complete.js"
}

enable_frontdoor_waf = true
frontdoor_waf_mode   = "Prevention"
akamai_enabled       = true

private_vault = true
private_webapp = true
# Bump me for update of Bright Cloud latest changes 1
