*** Settings ***
Library    RequestsLibrary
Library    JSONLibrary
Library    Collections
Library    String

*** Variables ***
${BASE_URL}        http://localhost:8000
${ADMIN_EMAIL}     admin@test.com
${ADMIN_PASSWORD}  password123
${USER_EMAIL}      user@test.com
${USER_PASSWORD}   password123
${TOKEN}           ${EMPTY}
${ADMIN_TOKEN}     ${EMPTY}