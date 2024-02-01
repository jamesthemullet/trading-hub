additional_tags = {
  IOCode             = "MA003025" # Required tag: IOCode of format eg 2000nnnn - can be provided by your delivery owner. #CHANGEME
  Portfolio          = "DotCom"   # Required tag: Change as required . #CHANGEME
  EA_Application_ID  = "A2654"    # Required tag: You should have received it from the ecosystem builder in your mailbox . #CHANGEME
  BC_Priority        = "M1"
  ExpiryDate         = ""
  SupportContact     = "grp-search-and-sort@mnscorp.onmicrosoft.com" # Required tag: your group mailbox eg: grp-adcp@mnscorp.onmicrosoft.com . #CHANGEME
  DataClassification = "Internal"
  deploy_app_name    = "trading-hub"
}
app_name         = "trading-hub" #CHANGEME # Required : Change this as you see appropriate "Preferrably: alphanumberical with hyphens as allowed characters"
github_repo_name = "trading-hub-release"
port             = "4200"
stack_version    = "1"

allowed_uris = ["/*"] #CHANGEME # Update to include your allowed paths

use_oidc  = "true" # Required tag: Set used_oidc as true for using Federated Credentials.

application_stack = "NODE|20-lts" # Required tag: Set the application stack as per your application. #CHANGEME

#duplicated from app_name as PR environemnts appname is overridden
newrelic_app_name = "trading-hub" #CHANGEME

# Custom DNS
# Uncomment & provide parent domain to be used if custom DNS is required (for production use-cases). This will deploy DNS zones.
# Otherwise, leave it commented and default Azure domains will be used (good for quick prototypes and demos)
domain_suffix = "web.engineering.mnscorp.net"
# override_appwebsite_name = "trading-hub"

site_config = {
  app_command_line = "node server.js"
}