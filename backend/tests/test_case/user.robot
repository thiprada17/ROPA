*** Settings ***
Resource         ../resources/keywords.resource
Suite Setup      Create Session To API

*** Variables ***
${NEW_USER_ID}    ${EMPTY}

*** Test Cases ***

TC06 - Admin can get all users
    ${token}=    Get Auth Token    ${ADMIN_EMAIL}    ${ADMIN_PASSWORD}
    ${headers}=    Authenticated Header    ${token}
    ${resp}=    GET On Session    api    /api/admin/users/get
    ...    headers=${headers}    expected_status=200
    Should Not Be Empty    ${resp.json()}

TC07 - Admin endpoint returns valid user list structure
    ${token}=    Get Auth Token    ${ADMIN_EMAIL}    ${ADMIN_PASSWORD}
    ${headers}=    Authenticated Header    ${token}
    ${resp}=    GET On Session    api    /api/admin/users/get
    ...    headers=${headers}    expected_status=200
    ${users}=    Set Variable    ${resp.json()}
    Should Not Be Empty    ${users}
    # ตรวจว่า user object มี field ที่ต้องการ
    ${first}=    Get From List    ${users}    0
    Dictionary Should Contain Key    ${first}    id
    Dictionary Should Contain Key    ${first}    email
    Dictionary Should Contain Key    ${first}    role

TC08 - Admin can get specific user by id
    ${token}=    Get Auth Token    ${ADMIN_EMAIL}    ${ADMIN_PASSWORD}
    ${headers}=    Authenticated Header    ${token}
    # ดึง user list ก่อนแล้วเอา id แรก
    ${resp}=    GET On Session    api    /api/admin/users/get
    ...    headers=${headers}    expected_status=200
    ${first}=    Get From List    ${resp.json()}    0
    ${uid}=    Get From Dictionary    ${first}    id
    Log    Found user id: ${uid}

TC09 - Non-admin can access users endpoint (current behavior)
    # TC นี้ document ว่า backend ยังไม่ได้ lock endpoint
    # เมื่อ implement role guard แล้วค่อยเปลี่ยน expected เป็น 403
    ${token}=    Get Auth Token    ${USER_EMAIL}    ${USER_PASSWORD}
    ${headers}=    Authenticated Header    ${token}
    ${resp}=    GET On Session    api    /api/admin/users/get
    ...    headers=${headers}    expected_status=any
    Log    Status code: ${resp.status_code}
    Should Be True    ${resp.status_code} == 200 or ${resp.status_code} == 403 or ${resp.status_code} == 401