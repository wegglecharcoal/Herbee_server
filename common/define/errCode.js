/**
 * Created by gunucklee on 2021. 09. 09.
 */
module.exports = {
    system:           200,        // 서버 시스템 및 db 에러 발생시 사용
    path:             201,        // api URL 경로 에러
    err:              400,        // 기본 에러
    param:            401,        // 파라미터 문제
    param_header:     402,        // 헤더 파라미터 문제
    empty:            403,        // 데이터가 없을 경우
    auth:             404,        // 인증 오류
    already:          405,        // 존재함
    already_email:    406,        // 존재함 - 이메일
    already_phone:    407,        // 존재함 - 연락처
    withdrawal:       408,        // 탈퇴
    empty_email:      409,        // 존재하지 않음 - 이메일
    empty_phone:      410,        // 존재하지 않음 - 연락처
    send_fail:        411,        // 보내기 실패
    time:             412,        // 시간 오류
    access_authority: 413,        // 접근권한 오류
    fail:             420,        // 실패

    server_msg:       999,        // 서버 메시지
}