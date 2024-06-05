# EDIT FOR ENVIRONMENT SPECIFIC ENV VARS for the app :: KEEP EMPTY IF NOT NEEDED

app_environment = {
  "APP_NAME" : "trading-hub",
  "NEXTAUTH_URL" : "https://dev-trading-hub.azurewebsites.net",
  "NODE_ENV" : "production",
  "NODE_OPTIONS" : "--max-http-header-size 32768"
}
allowed_origins = ["marksandspencer.com"]

enable_frontdoor_waf = true
frontdoor_waf_mode   = "Prevention"
akamai_enabled       = true