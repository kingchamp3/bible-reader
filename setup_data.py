import os
import urllib.request
import json

def main():
    print("성경 데이터 다운로드 시작...")
    
    # data 폴더 생성
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
        print(f"디렉토리 생성됨: {data_dir}")
        
    url = "https://raw.githubusercontent.com/maatheusgois/bible/main/versions/ko/ko.json"
    target_path = os.path.join(data_dir, "ko_ko.json")
    
    try:
        # User-Agent 헤더 추가하여 요청
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req) as response:
            print("데이터 다운로드 중...")
            content = response.read().decode('utf-8-sig')
            
            # JSON 데이터 유효성 검증 겸 로드
            bible_data = json.loads(content)
            print(f"성경 데이터 다운로드 완료! 총 {len(bible_data)}개의 책을 불러왔습니다.")
            
            # 로컬 파일로 저장
            with open(target_path, "w", encoding="utf-8") as f:
                json.dump(bible_data, f, ensure_ascii=False, indent=2)
                
            print(f"성경 데이터 저장 완료: {target_path}")
            
    except Exception as e:
        print(f"에러 발생: {e}")

if __name__ == "__main__":
    main()
