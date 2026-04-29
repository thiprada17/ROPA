*** Settings ***
Resource    common.resource

*** Keywords ***
Create Session To API
    Create Session    api    ${BASE_URL}    verify=False

Response Should Have Key
    [Arguments]    ${resp}    ${key}
    Dictionary Should Contain Key    ${resp.json()}    ${key}

Get Auth Token
    [Arguments]    ${email}    ${password}
    ${body}=    Create Dictionary    identifier=${email}    password=${password}
    ${resp}=    POST On Session    api    /api/auth/login    json=${body}    expected_status=200
    ${token}=    Get From Dictionary    ${resp.json()}    token
    RETURN    ${token}

Authenticated Header
    [Arguments]    ${token}
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    RETURN    ${headers}