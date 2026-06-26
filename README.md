# 말씀길

여러 성경 번역본 읽기, 전체 본문 검색, 북마크, 글자 크기 조절을 제공하는 Expo 기반 Android 앱입니다.

## 실행

```bash
npm run start
```

Expo Go 앱으로 QR 코드를 스캔하면 휴대폰에서 바로 확인할 수 있습니다.

## 웹 페이지로 보기

가장 쉬운 방법은 아래 파일을 더블클릭하는 것입니다.

```text
malsseumgil-web-bible.html
```

이 파일 하나 안에 웹 화면과 개역한글 데이터가 모두 들어 있습니다.

서버 방식으로 보고 싶다면 아래 파일을 실행하면 웹 성경 서버가 켜지고 브라우저가 열립니다.

```text
open-web.bat
```

웹 페이지에서도 회원 관리, 회원별 즐겨찾기, 읽은 진도 확인, 번역본 선택, 66권 전체 읽기, 장 선택, 전체 검색, 글자 크기 조절, 다크 모드를 사용할 수 있습니다.

회원 정보는 현재 브라우저의 `localStorage`에 저장됩니다. 같은 기기와 같은 브라우저에서는 유지되지만, 다른 기기와 자동 동기화되지는 않습니다.

## GitHub Pages로 인터넷 공개

이 프로젝트에는 `.github/workflows/pages.yml` 배포 설정이 들어 있습니다. GitHub 저장소에 올린 뒤 GitHub Pages를 켜면 `web/` 폴더의 웹 성경이 인터넷에 공개됩니다.

1. GitHub에서 새 저장소를 만듭니다.
2. 이 프로젝트를 그 저장소에 push합니다.
3. GitHub 저장소의 `Settings > Pages`로 이동합니다.
4. `Build and deployment`의 Source를 `GitHub Actions`로 선택합니다.
5. `Actions` 탭에서 `Deploy web Bible to GitHub Pages`가 성공하면 Pages 주소가 생성됩니다.

GitHub CLI가 설치되어 있다면 예시는 아래와 같습니다.

```bash
git add -A
git commit -m "Initial Bible app and web reader"
git branch -M main
git remote add origin https://github.com/사용자명/저장소명.git
git push -u origin main
```

## 성경 데이터

- `src/data/bibles.json`에 개역한글, 개역개정, 공동번역, 현대어성경, NIV가 들어 있습니다.
- `web/bibles-data.js`는 웹 페이지가 바로 읽을 수 있게 같은 데이터를 변환한 파일입니다.
- 기존 `src/data/krv.json`은 개역한글 단일 데이터 보관용입니다.
- 원본 SQLite 파일은 `source-data/krv.sqlite`에 복사해 변환했고, 이 원본 폴더는 Git 추적에서 제외됩니다.
- 원본을 다시 바꾼 경우 아래 명령으로 앱용 JSON을 재생성할 수 있습니다.

```bash
python scripts/convert-bibles.py
```

## 배포 전 확인할 것

1. 개역한글 본문 라이선스
   - 현재 본문은 사용자가 제공한 개역한글 파일에서 변환했습니다.
   - 전체 개역한글 본문을 앱에 넣어 배포하려면 권리자 또는 관리 기관의 사용 허가 여부를 먼저 확인하세요.
   - 허가받은 원문 파일을 확보한 뒤 전체 성경 데이터로 교체해야 합니다.

2. 앱 정보
   - 앱 이름: 말씀길
   - Android 패키지 ID: `com.malsseumgil.bible`
   - 패키지 ID는 출시 후 바꾸기 어렵기 때문에 브랜드가 확정되면 최종 결정하세요.

3. 개인정보 처리방침
   - 로그인, 광고, 분석, 서버 저장, 푸시 알림을 넣는 경우 정책 문서가 필요합니다.
   - 단순 오프라인 앱이어도 Play Console의 데이터 보안 설문은 정확히 작성해야 합니다.

4. Play Store 빌드
   - Google Play에는 보통 Android App Bundle, 즉 `.aab` 파일로 올립니다.
   - Expo에서는 EAS Build를 쓰는 방식이 가장 쉽습니다.

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android
```

## 다음 개발 후보

- 전체 성경 데이터 탑재
- 장/절 선택 화면
- 오프라인 저장소
- 묵상 노트
- 오늘의 말씀 위젯
- 다크 모드
- 광고 또는 후원 모델
