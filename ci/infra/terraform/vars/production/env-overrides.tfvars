# EDIT FOR ENVIRONMENT SPECIFIC ENV VARS for the app :: KEEP EMPTY IF NOT NEEDED

app_environment = {
  "APP_NAME" : "trading-hub",
  "MERCHANDISING_API_BASEURL" : "https://api.marksandspencer.com/merchandising",
  "NODE_OPTIONS" : "--max-http-header-size 32768",
  "NEXTAUTH_URL" : "https://merchandising-hub.search.marksandspencer.app/api/auth",
  "BUMP_ME_FOR_SECRETS_UPDATE" : "1",
  "NODE_ENV" : "production",
  "NODE_OPTIONS" : "--max-http-header-size 32768"
}
allowed_origins = ["marksandspencer.com"]

enable_frontdoor_waf = true
frontdoor_waf_mode   = "Prevention"
akamai_enabled       = true