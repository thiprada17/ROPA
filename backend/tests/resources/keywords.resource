*** Settings ***
Resource    common.resource

*** Keywords ***
Create Session To API
    Create Session    api    ${BASE_URL}    verify=False

Get Auth Token
    [Arguments]    ${email}    ${password}
    Create Session To API
    ${body}=    Create Dictionary
    ...    identifier=${email}
    ...    password=${password}
    ${resp}=    POST On Session
    ...    api
    ...    /api/auth/login
    ...    json=${body}
    ...    expected_status=200
    ${token}=    Get From Dictionary    ${resp.json()}    token
    RETURN    ${token}

Auth Header
    [Arguments]    ${token}
    ${headers}=    Create Dictionary
    ...    Authorization=Bearer ${token}
    ...    Content-Type=application/json
    RETURN    ${headers}

Response Should Have Key
    [Arguments]    ${resp}    ${key}
    Dictionary Should Contain Key    ${resp.json()}    ${key}

Response List Should Not Be Empty
    [Arguments]    ${resp}
    ${data}=    Set Variable    ${resp.json()}
    Should Not Be Empty    ${data}