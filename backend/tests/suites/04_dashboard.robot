*** Settings ***
Resource         ../resources/keywords.resource
Suite Setup      Run Keywords
...              Create Session To API    AND
...              Get Token

*** Keywords ***
Get Token
    ${token}=    Get Auth Token    ${ADMIN_EMAIL}    ${ADMIN_PASSWORD}
    Set Suite Variable    ${TOKEN}    ${token}

*** Test Cases ***

TC01 - Dashboard total should return count and change percent
    ${headers}=    Auth Header    ${TOKEN}
    ${resp}=    GET On Session
    ...    api
    ...    /api/dashboard/total
    ...    headers=${headers}
    ...    expected_status=200
    FOR    ${key}    IN    total    newCount    changePercent
        Dictionary Should Contain Key    ${resp.json()}    ${key}
    END

TC02 - Dashboard approval should return approved count and growth
    ${headers}=    Auth Header    ${TOKEN}
    ${resp}=    GET On Session
    ...    api
    ...    /api/dashboard/approval
    ...    headers=${headers}
    ...    expected_status=200
    FOR    ${key}    IN    total    growth
        Dictionary Should Contain Key    ${resp.json()}    ${key}
    END

TC03 - Dashboard donut should return series and total
    ${headers}=    Auth Header    ${TOKEN}
    ${resp}=    GET On Session
    ...    api
    ...    /api/dashboard/donut
    ...    headers=${headers}
    ...    expected_status=200
    FOR    ${key}    IN    series    total
        Dictionary Should Contain Key    ${resp.json()}    ${key}
    END

TC04 - Dashboard trend with 1W range
    ${headers}=    Auth Header    ${TOKEN}
    ${resp}=    GET On Session
    ...    api
    ...    /api/dashboard/trend?range=1W
    ...    headers=${headers}
    ...    expected_status=200
    Dictionary Should Contain Key    ${resp.json()}    items
    ${items}=    Get From Dictionary    ${resp.json()}    items
    Length Should Be    ${items}    7

TC05 - Dashboard trend with 1M range
    ${headers}=    Auth Header    ${TOKEN}
    ${resp}=    GET On Session
    ...    api
    ...    /api/dashboard/trend?range=1M
    ...    headers=${headers}
    ...    expected_status=200
    Dictionary Should Contain Key    ${resp.json()}    items

TC06 - Dashboard comparison should return departments list
    ${headers}=    Auth Header    ${TOKEN}
    ${resp}=    GET On Session
    ...    api
    ...    /api/dashboard/comparison
    ...    headers=${headers}
    ...    expected_status=200
    Dictionary Should Contain Key    ${resp.json()}    departments

TC07 - Dashboard activities with default limit
    ${headers}=    Auth Header    ${TOKEN}
    ${resp}=    GET On Session
    ...    api
    ...    /api/dashboard/activities
    ...    headers=${headers}
    ...    expected_status=200
    Dictionary Should Contain Key    ${resp.json()}    items

TC08 - Dashboard activities filtered by risk Critical
    ${headers}=    Auth Header    ${TOKEN}
    ${resp}=    GET On Session
    ...    api
    ...    /api/dashboard/activities?risk=Critical
    ...    headers=${headers}
    ...    expected_status=200
    ${items}=    Get From Dictionary    ${resp.json()}    items
    FOR    ${item}    IN    @{items}
        ${risk}=    Get From Dictionary    ${item}    risk
        Should Be Equal    ${risk}    Critical
    END

TC09 - All dashboard endpoints require auth
    FOR    ${path}    IN
    ...    /api/dashboard/total
    ...    /api/dashboard/approval
    ...    /api/dashboard/donut
    ...    /api/dashboard/trend
    ...    /api/dashboard/comparison
        ${resp}=    GET On Session    api    ${path}    expected_status=401
    END