*** Settings ***
Resource         ../resources/keywords.resource
Suite Setup      Create Session To API

*** Variables ***
${NEW_USER_ID}    ${EMPTY}

*** Test Cases ***

# ─── Health Check ───────────────────────────────────────────
TC01 - Root endpoint should return running message
    ${resp}=    GET On Session    api    /
    Should Be Equal As Integers    ${resp.status_code}    200
    ${msg}=    Get From Dictionary    ${resp.json()}    message
    Should Contain    ${msg}    running

# ─── Auth ───────────────────────────────────────────────────
TC02 - Login with valid credentials should return token
    ${body}=    Create Dictionary
    ...    identifier=${ADMIN_EMAIL}
    ...    password=${ADMIN_PASSWORD}
    ${resp}=    POST On Session    api    /api/auth/login    json=${body}    expected_status=200
    Response Should Have Key    ${resp}    token
    Response Should Have Key    ${resp}    user
    ${user}=    Get From Dictionary    ${resp.json()}    user
    Dictionary Should Contain Key    ${user}    role

TC03 - Login with wrong password should return 401
    ${body}=    Create Dictionary
    ...    identifier=${ADMIN_EMAIL}
    ...    password=wrongpassword
    ${resp}=    POST On Session    api    /api/auth/login    json=${body}    expected_status=401

TC04 - Login with empty identifier should return 400
    ${body}=    Create Dictionary
    ...    identifier=${EMPTY}
    ...    password=${ADMIN_PASSWORD}
    ${resp}=    POST On Session    api    /api/auth/login    json=${body}    expected_status=400

TC05 - Login with missing password field should return 400
    ${body}=    Create Dictionary    identifier=${ADMIN_EMAIL}
    ${resp}=    POST On Session    api    /api/auth/login    json=${body}    expected_status=any
    Should Be True    ${resp.status_code} >= 400