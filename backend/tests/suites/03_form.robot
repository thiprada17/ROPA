*** Settings ***
Resource         ../resources/keywords.resource
Suite Setup      Run Keywords
...              Create Session To API    AND
...              Get User Token

*** Variables ***
${CREATED_ACTIVITY_ID}    ${EMPTY}

*** Keywords ***
Get User Token
    ${token}=    Get Auth Token    ${USER_EMAIL}    ${USER_PASSWORD}
    Set Suite Variable    ${TOKEN}    ${token}

*** Test Cases ***

# ─── Form Options ────────────────────────────────────────────
TC01 - Get form options should return all required keys
    ${headers}=    Auth Header    ${TOKEN}
    ${resp}=    GET On Session
    ...    api
    ...    /api/form/options
    ...    headers=${headers}
    ...    expected_status=200
    ${data}=    Set Variable    ${resp.json()}
    FOR    ${key}    IN
    ...    activityNames    purposes    dataCategories    dataTypes
    ...    legalBases    departments    transferMethods    deletionMethods
        Dictionary Should Contain Key    ${data}    ${key}
    END

TC02 - Get form options without token should return 401
    ${resp}=    GET On Session
    ...    api
    ...    /api/form/options
    ...    expected_status=401

# ─── ROPA List ───────────────────────────────────────────────
TC03 - Get ROPA list should return array
    ${headers}=    Auth Header    ${TOKEN}
    ${resp}=    GET On Session
    ...    api
    ...    /api/form/ropa
    ...    headers=${headers}
    ...    expected_status=200
    ${data}=    Set Variable    ${resp.json()}
    Should Be True    isinstance($data, list)

TC04 - Each ROPA item should have required fields
    ${headers}=    Auth Header    ${TOKEN}
    ${resp}=    GET On Session
    ...    api
    ...    /api/form/ropa
    ...    headers=${headers}
    ...    expected_status=200
    ${data}=    Set Variable    ${resp.json()}
    Skip If    len($data) == 0    No ROPA data to validate
    ${first}=    Get From List    ${data}    0
    FOR    ${key}    IN    id    activity    status    risk    parties    legal    retention
        Dictionary Should Contain Key    ${first}    ${key}
    END

# ─── Submit Form ─────────────────────────────────────────────
TC05 - Submit form with valid payload should succeed
    ${headers}=    Auth Header    ${TOKEN}
    # โหลด options ก่อนเพื่อเอา id จริง
    ${opt_resp}=    GET On Session    api    /api/form/options    headers=${headers}
    ${opts}=        Set Variable    ${opt_resp.json()}
    ${activity}=    Get From List    ${opts['activityNames']}    0
    ${purpose}=     Get From List    ${opts['purposes']}    0
    ${category}=    Get From List    ${opts['dataCategories']}    0
    ${dtype}=       Get From List    ${opts['dataTypes']}    0
    ${source}=      Get From List    ${opts['dataSources']}    0
    ${method}=      Get From List    ${opts['acquisitionMethods']}    0
    ${legal}=       Get From List    ${opts['legalBases']}    0
    ${transfer}=    Get From List    ${opts['transferMethods']}    0
    ${deletion}=    Get From List    ${opts['deletionMethods']}    0
    ${storage_t}=   Get From List    ${opts['retentionStorageTypes']}    0
    ${storage_m}=   Get From List    ${opts['retentionStorageMethods']}    0
    ${access}=      Get From List    ${opts['accessRights']}    0
    ${dept}=        Get From List    ${opts['departments']}    0

    ${categories}=          Create List    ${category['value']}
    ${methods}=             Create List    ${method['value']}
    ${primary_bases}=       Create List    ${legal['value']}
    ${supplementary}=       Create List
    ${storage_types}=       Create List    ${storage_t['value']}
    ${storage_methods}=     Create List    ${storage_m['value']}
    ${access_rights}=       Create List    ${access['value']}
    ${protection}=          Create List
    ${exemption}=           Create List

    ${minor}=    Create Dictionary    under10=ผู้ปกครองให้ความยินยอม    age10to20=เจ้าตัวให้ความยินยอม

    ${step1}=    Create Dictionary
    ...    dataOwner=Robot Tester
    ...    departmentId=${dept['value']}
    ...    processActivity=${activity['value']}
    ...    processingPurpose=${purpose['value']}

    ${step2}=    Create Dictionary
    ...    dataClass=ข้อมูลทั่วไป
    ...    categories=${categories}
    ...    dataType=${dtype['value']}
    ...    methods=${methods}
    ...    dataSource=${source['value']}
    ...    description=test
    ...    otherText=${EMPTY}

    ${step3}=    Create Dictionary
    ...    primaryBases=${primary_bases}
    ...    supplementaryBases=${supplementary}
    ...    minorConsent=${minor}

    ${step4}=    Create Dictionary
    ...    hasTransferAbroad=ไม่มี
    ...    transferCountry=${EMPTY}
    ...    isToSubsidiary=ไม่ใช่
    ...    subsidiaryName=${EMPTY}
    ...    transferMethod=${transfer['value']}
    ...    dataProtectionStandard=${protection}
    ...    legalExemption=${exemption}

    ${step5}=    Create Dictionary
    ...    retentionDD=00
    ...    retentionMM=00
    ...    retentionYY=3
    ...    dataType=${storage_types}
    ...    storageMethod=${storage_methods}
    ...    accessRight=${access_rights}
    ...    destructionMethod=${deletion['value']}
    ...    usageStatus=ไม่มีการใช้
    ...    usagePurpose=${EMPTY}
    ...    refusalNote=${EMPTY}

    ${step6}=    Create Dictionary    selectedSecurity=&{EMPTY}    securityDetails=&{EMPTY}
    ${processors}=    Create List
    ${step7}=    Create Dictionary    processors=${processors}

    ${body}=    Create Dictionary
    ...    step1=${step1}
    ...    step2=${step2}
    ...    step3=${step3}
    ...    step4=${step4}
    ...    step5=${step5}
    ...    step6=${step6}
    ...    step7=${step7}

    ${resp}=    POST On Session
    ...    api
    ...    /api/form/submit
    ...    json=${body}
    ...    headers=${headers}
    ...    expected_status=200
    Response Should Have Key    ${resp}    activityId
    ${aid}=    Get From Dictionary    ${resp.json()}    activityId
    Set Suite Variable    ${CREATED_ACTIVITY_ID}    ${aid}

TC06 - Submit form without token should return 401
    ${body}=    Create Dictionary    step1=&{EMPTY}
    ${resp}=    POST On Session
    ...    api
    ...    /api/form/submit
    ...    json=${body}
    ...    expected_status=401

TC07 - Submit form with missing required fields should return 400
    ${headers}=    Auth Header    ${TOKEN}
    ${body}=    Create Dictionary
    ...    step1=&{EMPTY}
    ...    step2=&{EMPTY}
    ...    step3=&{EMPTY}
    ...    step4=&{EMPTY}
    ...    step5=&{EMPTY}
    ${resp}=    POST On Session
    ...    api
    ...    /api/form/submit
    ...    json=${body}
    ...    headers=${headers}
    ...    expected_status=400

# ─── Get Activity By ID ──────────────────────────────────────
TC08 - Get activity by valid ID should return data
    Skip If    '${CREATED_ACTIVITY_ID}' == '${EMPTY}'    No activity from TC05
    ${headers}=    Auth Header    ${TOKEN}
    ${resp}=    GET On Session
    ...    api
    ...    /api/form/ropa/${CREATED_ACTIVITY_ID}
    ...    headers=${headers}
    ...    expected_status=200
    ${data}=    Set Variable    ${resp.json()}
    FOR    ${key}    IN    id    step1    step2    step3    step4    step5
        Dictionary Should Contain Key    ${data}    ${key}
    END

TC09 - Get activity by invalid ID should return 400
    ${headers}=    Auth Header    ${TOKEN}
    ${resp}=    GET On Session
    ...    api
    ...    /api/form/ropa/not-a-uuid
    ...    headers=${headers}
    ...    expected_status=400

TC10 - Get activity by non-existent ID should return 404
    ${headers}=    Auth Header    ${TOKEN}
    ${resp}=    GET On Session
    ...    api
    ...    /api/form/ropa/00000000-0000-0000-0000-000000000000
    ...    headers=${headers}
    ...    expected_status=404