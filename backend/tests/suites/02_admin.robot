*** Settings ***
Resource         ../resources/keywords.resource
Suite Setup      Run Keywords
...              Create Session To API    AND
...              Get Admin Token

*** Variables ***
${CREATED_USER_ID}    ${EMPTY}

*** Keywords ***
Get Admin Token
    ${token}=    Get Auth Token    ${ADMIN_EMAIL}    ${ADMIN_PASSWORD}
    Set Suite Variable    ${ADMIN_TOKEN}    ${token}

*** Test Cases ***

# ─── Get Users ──────────────────────────────────────────────
TC01 - Get all users should return list
    ${headers}=    Auth Header    ${ADMIN_TOKEN}
    ${resp}=    GET On Session
    ...    api
    ...    /api/admin/users
    ...    headers=${headers}
    ...    expected_status=200
    ${data}=    Set Variable    ${resp.json()}
    Should Not Be Empty    ${data}

TC02 - Get users without token should return 401
    ${resp}=    GET On Session
    ...    api
    ...    /api/admin/users
    ...    expected_status=401

# ─── Create User ────────────────────────────────────────────
TC03 - Create user with valid data should return 200
    ${headers}=    Auth Header    ${ADMIN_TOKEN}
    ${body}=    Create Dictionary
    ...    fullName=Test Robot User
    ...    email=robot_test_${RANDOM}@test.com
    ...    password=TestPass123
    ...    phone=0812345678
    ...    role=User
    ${resp}=    POST On Session
    ...    api
    ...    /api/admin/users
    ...    json=${body}
    ...    headers=${headers}
    ...    expected_status=200
    Response Should Have Key    ${resp}    message
    ${user}=    Get From Dictionary    ${resp.json()}    user
    ${uid}=     Get From Dictionary    ${user}    id
    Set Suite Variable    ${CREATED_USER_ID}    ${uid}

TC04 - Create user without required fields should return 400
    ${headers}=    Auth Header    ${ADMIN_TOKEN}
    ${body}=    Create Dictionary    phone=0812345678
    ${resp}=    POST On Session
    ...    api
    ...    /api/admin/users
    ...    json=${body}
    ...    headers=${headers}
    ...    expected_status=400

# ─── Edit User ──────────────────────────────────────────────
TC05 - Edit existing user should return success
    Skip If    '${CREATED_USER_ID}' == '${EMPTY}'    No user created in TC03
    ${headers}=    Auth Header    ${ADMIN_TOKEN}
    ${body}=    Create Dictionary
    ...    fullName=Updated Robot User
    ...    email=robot_updated@test.com
    ...    role=User
    ...    accountStatus=Active
    ...    lockStatus=Unlocked
    ${resp}=    PUT On Session
    ...    api
    ...    /api/admin/users/${CREATED_USER_ID}
    ...    json=${body}
    ...    headers=${headers}
    ...    expected_status=200
    Response Should Have Key    ${resp}    message

# ─── Delete User ────────────────────────────────────────────
TC06 - Delete existing user should return success
    Skip If    '${CREATED_USER_ID}' == '${EMPTY}'    No user created in TC03
    ${headers}=    Auth Header    ${ADMIN_TOKEN}
    ${resp}=    DELETE On Session
    ...    api
    ...    /api/admin/users/${CREATED_USER_ID}
    ...    headers=${headers}
    ...    expected_status=200
    Response Should Have Key    ${resp}    message

TC07 - Delete non-existent user should return error
    ${headers}=    Auth Header    ${ADMIN_TOKEN}
    ${resp}=    DELETE On Session
    ...    api
    ...    /api/admin/users/00000000-0000-0000-0000-000000000000
    ...    headers=${headers}
    ...    expected_status=any
    Should Be True    ${resp.status_code} >= 400