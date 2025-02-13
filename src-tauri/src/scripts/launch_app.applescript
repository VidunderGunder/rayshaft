on run argv
    if (count of argv) < 1 then
        error "Missing argument: appName"
    end if

    set appName to item 1 of argv

    tell application "System Events"
        set frontApp to name of first application process whose frontmost is true
    end tell

    if frontApp is appName then
        tell application appName to hide
    else
        tell application appName to activate
    end if
end run
