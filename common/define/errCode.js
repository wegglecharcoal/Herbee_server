/**
 * Created by gunucklee on 2021. 09. 09.
 */
module.exports = {
    // api err Code
    over_size_file:                 101,         //	파일 용량 초과
    over_param_length:              102,         //	파라미터 길이 초과
    over_header_param_length:       103,         //	헤더 파라미터 길이 초과
    over_retry_chatRoom:            104,         //	다시 대화 횟수 초과
    fail_upload_video:              201,         //	영상 업로드
    fail_exit_chatRoom:             202,         //	채팅방 퇴장 제약
    fail_delete_comment:            203,         //	댓글 삭제 실패
    fail_delete_nested_comment:     204,         //	대댓글 삭제 실패
    fail_delete_lifestyle:          205,         //	라이프스타일 삭제 실패
    fail_delete_local_review:       206,         //	동네후기 삭제 실패
    fail_delete_promise:            207,         //	약속 삭제 실패
    fail_refuse_promise:            208,         //	약속 거절 수행 실패
    non_exist_param:                301,         //	파라미터 빈 값
    non_exist_header_param:         302,         //	헤더 파라미터 빈 값
    non_exist_chatRoom:             303,         //	존재하지 않는 채팅방
    non_exist_file:                 304,         //	파일 존재 X
    non_exist_follow:               305,         //	팔로우 X
    non_exist_recommender_code:     306,         //	추천 코드 X
    non_exist_user:                 403,         //	회원가입 X @@@@@@@@@@ 추후 다시 307로 변경
    non_exist_access_token:         308,         //	접속 토큰 X
    non_exist_honey_kind:           309,         //	꿀 종류 X
    non_exist_manual_code:          310,         //	메뉴얼 코드 X
    non_exist_url:                  311,         //	url 경로 X
    non_enough_param_length:        401,         //	파라미터 길이 부족
    non_enough_header_param_length: 402,         //	헤더 파라미터 길이 부족
    non_enough_honey_1:             307,         //	꿀 소지 개수 부족_1 @@@@@@@@@@ 추후 다시 403로 변경
    non_enough_bee_coin:            404,         //	BEE coin 소지 개수 부족
    non_enough_fee:                 405,         //	수수료 비용 부족
    non_participating_chatRoom:     451,         //	채팅방 미참여
    non_authority_room_manager:     452,         //	방장 권한 X
    non_authority_promise_manager:  453,         //	약속 주최자 권한 x
    non_enough_honey_2:             457,         //	꿀 소지 개수 부족_2
    already_block:                  501,         //	차단 중복
    already_chatRoom:               502,         //	채팅방 참여 중복
    already_follow:                 503,         //	팔로우 중복
    already_lifestyle:              504,         //	라이프스타일 중복
    already_local_review:           505,         //	동네후기 중복
    already_history:                506,         //	기록 중복
    already_promise_enter:          507,         //	약속 참여 중복
    already_report:                 508,         //	신고 중복
    already_sign_up:                509,         //	회원가입 중복
    already_email:                  510,         //	이메일 중복
    already_nickname:               511,         //	닉네임 중복
    already_recommendee_code:       512,         //	추천 코드 중복
    still_conversation_chatRoom:    601,         //	진행 중인 채팅방
    still_withdrawl:                602,         //	이전 출금 미완료
    invalid_wallet_address:         701,         //	잘못된 지갑 주소 형식
    invalid_access_token:           702,         //	잘못된 접속 토큰 형식

    system:                         999,         // 서버 시스템 발생시 사용




}