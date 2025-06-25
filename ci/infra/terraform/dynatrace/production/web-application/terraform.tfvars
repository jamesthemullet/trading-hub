web_application = [
        {
            application_name             = "trading-hub"
            type                         = "MANUALLY_INJECTED"
            environment                  = "prod"
            real_user_monitoring_enabled = true
            monitoring_data_path         = "https://bf71713saa.bf.dynatrace.com/bf"
            injection_mode               = "JAVASCRIPT_TAG_COMPLETE"
            session_replay_enabled       = false
            application_detection_rules  = []
        }
    ]