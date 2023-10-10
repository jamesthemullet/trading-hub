#CHANGEME as appropriate

service_name                   = "trading-hub"
support_team_emails            = ["name.name@marks-and-spencer.com"]
core_team_emails               = ["name.name@marks-and-spencer.com"]
synthetics_name                = "trading-hub-prod"
create_scripted_api_monitoring = true
create_alert_policy            = true
synthetics_script_location     = "./scripts/prod-monitoring-script.tpl"
synthetics_sla_threshold       = 0.5
