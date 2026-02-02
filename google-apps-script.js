/**
 * AI Study Circle — Google Apps Script
 *
 * 사용법:
 * 1. Google Sheets에서 새 스프레드시트 생성
 * 2. 시트 2개 만들기: "멤버가입", "모임참가"
 * 3. 확장 프로그램 → Apps Script 열기
 * 4. 이 코드를 붙여넣기
 * 5. 배포 → 새 배포 → 웹 앱 → 액세스: 모든 사용자 → 배포
 * 6. 생성된 URL을 main.js의 SCRIPT_URL에 붙여넣기
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.formType === 'membership') {
      const sheet = ss.getSheetByName('멤버가입') || ss.insertSheet('멤버가입');

      // 헤더가 없으면 추가
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['제출일시', '이름', '연락처', '관심분야', '멤버유형', '한마디']);
      }

      sheet.appendRow([
        new Date().toLocaleString('ko-KR'),
        data.name || '',
        data.contact || '',
        data.interests || '',
        data.memberType || '',
        data.message || ''
      ]);

    } else if (data.formType === 'attend') {
      const sheet = ss.getSheetByName('모임참가') || ss.insertSheet('모임참가');

      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['제출일시', '이름', '연락처', '참가모임', '메모']);
      }

      sheet.appendRow([
        new Date().toLocaleString('ko-KR'),
        data.name || '',
        data.contact || '',
        data.event || '',
        data.note || ''
      ]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
