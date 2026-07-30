# Google Play 출시 체크리스트

## 1. 출시 전 고정할 정보

- [x] 앱 이름: 성경을 읽다
- [x] Android 패키지: `com.kingchamp3.biblereader`
- [x] 첫 버전: `1.0.0` / versionCode `1`
- [x] 앱 아이콘과 적응형 아이콘
- [x] 개인정보처리방침 앱 내 링크
- [ ] Play Console에 표시할 개발자 이메일 확인
- [ ] `bible-text-rights.md` 기준으로 성경 번역본별 전자 복제·배포 권한 확인

패키지 이름은 첫 AAB를 Play Console에 올린 뒤 바꿀 수 없습니다.

## 2. 빌드와 내부 테스트

- [ ] Expo 계정 로그인
- [ ] EAS 프로젝트 연결
- [ ] 본문 배포 권한 확인 또는 허가된 테스트 데이터로 교체
- [ ] `eas build --platform android --profile preview`로 APK 생성
- [ ] 실제 Android 기기에서 읽기, 검색, 즐겨찾기, 앱 재실행을 점검
- [ ] `eas build --platform android --profile production`으로 AAB 생성
- [ ] Play Console 내부 테스트 트랙에 AAB 업로드
- [ ] 테스터 이메일 목록 또는 Google 그룹 등록

## 3. Play Console 앱 콘텐츠

- [ ] 앱 액세스: 모든 기능을 로그인 없이 이용 가능
- [ ] 광고: 광고 없음
- [ ] 콘텐츠 등급 설문
- [ ] 타겟층과 콘텐츠: 실제 대상 연령에 맞게 답변
- [ ] 뉴스 앱: 아니요
- [ ] 데이터 보안: `data-safety-draft.md` 기준으로 입력
- [ ] 개인정보처리방침 URL 등록
- [ ] 정부 앱 여부: 아니요
- [ ] 금융 기능: 현재 Android 앱에는 없음

## 4. 스토어 등록정보

- [x] 앱 아이콘 512 x 512
- [x] 기능 그래픽 1024 x 500
- [ ] 실제 앱 화면 휴대전화 스크린샷 최소 2장, 권장 4장
- [x] 간단한 설명
- [x] 자세한 설명
- [x] 출시 노트
- [ ] 문의 이메일과 개발자 프로필 확인

## 5. 공개 전 필수 검증

- [ ] 개인정보처리방침 URL이 인터넷에서 열림
- [ ] AAB의 target API와 권한 검토
- [ ] 비정상 종료와 빈 성경 화면이 없음
- [ ] 오프라인 상태에서도 본문이 열림
- [ ] 저작권 증빙이 없는 번역본을 공개 빌드에서 제외
- [ ] 새 개인 개발자 계정이면 Play Console이 요구하는 비공개 테스트 조건 충족
