# EDIT FOR ENVIRONMENT SPECIFIC ENV VARS for the layer3 - KEEP EMPTY IF NOT NEEDED
app_environment = {
  "APP_NAME" : "trading-hub",
  "MERCHANDISING_API_BASEURL" : "https://dev-search-service-v1-eun-layer3-app.azurewebsites.net/merchandising/",
  "NODE_OPTIONS" : "--max-http-header-size 32768",
  "BUMP_ME_FOR_SECRETS_UPDATE" : "1",
  "NEXTAUTH_URL": "https://dev-trading-hub-v1-eun-layer3-app.azurewebsites.net/api/auth/"
}

enable_frontdoor_waf = true
frontdoor_waf_mode   = "Prevention"
akamai_enabled       = true