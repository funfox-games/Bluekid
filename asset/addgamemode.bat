@echo off

if "%1"=="/h" (
    echo ARGUMENTS
    echo    ID: The id of your gamemode
    echo:
    echo PARAMETERS
    echo    /f: Create a template, fast create
    echo    /h: Show help
    exit /b
)

if "%1"=="/f" (
    if NOT exist %~dp0gamemodes\ ( md "%~dp0gamemodes" )
    (
        echo {
        echo    "id": "",
        echo    "display": "",
        echo    "description": "",
        echo    "limitedAccess": false,
        echo    "tags": [],
        echo    "cover": "../asset/templates/kit_temp.png",
        echo    "settings": {}
        echo }
    ) > %~dp0gamemodes\gamemode_template.json

    echo Success! File located: %~dp0gamemodes\gamemode_template.json
    exit /b
)

if "%1"=="" (
    echo Needs to start with an ID.
    echo Use /h to get help.
    exit /b
)

cls

set gamemode_id=%1

set /p gamemode_name="What's the name? (%gamemode_id%) "
set /p gamemode_desc="(Optional) What's the description? "
set /p gamemode_limited="Is the gamemode limited? (n) "
set /p gamemode_tags="(Optional) What are the tags? Seperate them by commas. Close the tag with double quoutations. "
set /p gamemode_cover="What is the cover? ../asset/"

if "%gamemode_name%"=="" ( set gamemode_name=%gamemode_id% )
if "%gamemode_limited%"=="" ( set gamemode_limited="n" )

set gamemodeJSON_limitedAccess=false

if "%gamemode_limited%"=="y" ( set gamemodeJSON_limitedAccess=true )

if NOT exist %~dp0gamemodes\ ( md "%~dp0gamemodes" )

(
    echo {
    echo    "id": "%gamemode_id%",
    echo    "display": "%gamemode_name%",
    echo    "description": "%gamemode_desc%",
    echo    "limitedAccess": %gamemodeJSON_limitedAccess%,
    echo    "tags": [%gamemode_tags%],
    echo    "cover": "../asset/%gamemode_cover%",
    echo    "settings": {}
    echo }
) > %~dp0gamemodes\gamemode_%gamemode_id%.json

echo:
echo Success! File located: %~dp0gamemodes\gamemode_%gamemode_id%.json