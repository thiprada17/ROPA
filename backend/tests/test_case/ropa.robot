*** Settings ***
Resource         ../resources/keywords.resource
Suite Setup      Create Session To API

*** Test Cases ***

TC10 - User can get ROPA list
    ${token}=    Get Auth Token    ${USER_EMAIL}    ${USER_PASSWORD}
    ${headers}=    Authenticated Header    ${token}
    ${resp}=    GET On Session    api    /api/form/ropa
    ...    headers=${headers}    expected_status=200
    Should Not Be Empty    ${resp.json()}

TC11 - Unauthenticated request to ROPA returns data or 401
    ${resp}=    GET On Session    api    /api/form/ropa    expected_status=any
    Should Be True    ${resp.status_code} == 200 or ${resp.status_code} == 401

TC12 - DPO can get ROPA list
    ${token}=    Get Auth Token    ${DPO_EMAIL}    ${DPO_PASSWORD}
    ${headers}=    Authenticated Header    ${token}
    ${resp}=    GET On Session    api    /api/form/ropa
    ...    headers=${headers}    expected_status=200
    Should Not Be Empty    ${resp.json()}