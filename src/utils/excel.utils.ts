import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface QuestionTemplate {
  question: string;
  maxChoices: number;
  answer1: string;
  isCorrect1: boolean;
  answer2: string;
  isCorrect2: boolean;
  answer3?: string;
  isCorrect3?: boolean;
  answer4?: string;
  isCorrect4?: boolean;
  answer5?: string;
  isCorrect5?: boolean;
}

export interface ImportedQuestion {
  question: string;
  maxChoices: number;
  answers: Array<{
    answer: string;
    isCorrect: boolean;
  }>;
}

// Tạo template Excel để download
export const downloadQuestionTemplate = () => {
  const templateData: QuestionTemplate[] = [
    {
      question: 'React là gì?',
      maxChoices: 1,
      answer1: 'Một thư viện JavaScript để xây dựng giao diện người dùng',
      isCorrect1: true,
      answer2: 'Một framework backend',
      isCorrect2: false,
      answer3: 'Một cơ sở dữ liệu',
      isCorrect3: false,
      answer4: 'Một ngôn ngữ lập trình',
      isCorrect4: false
    },
    {
      question: 'Hook nào được sử dụng để quản lý state trong React?',
      maxChoices: 2,
      answer1: 'useState',
      isCorrect1: true,
      answer2: 'useEffect',
      isCorrect2: false,
      answer3: 'useReducer',
      isCorrect3: true,
      answer4: 'useContext',
      isCorrect4: false
    }
  ];

  // Tạo worksheet với headers tiếng Việt
  const headers = [
    'Câu hỏi (*)',
    'Số lựa chọn tối đa (*)',
    'Đáp án 1 (*)',
    'Đúng/Sai 1 (*)',
    'Đáp án 2 (*)', 
    'Đúng/Sai 2 (*)',
    'Đáp án 3',
    'Đúng/Sai 3',
    'Đáp án 4',
    'Đúng/Sai 4',
    'Đáp án 5',
    'Đúng/Sai 5'
  ];

  // Chuyển đổi data thành format Excel
  const excelData = templateData.map(item => [
    item.question,
    item.maxChoices,
    item.answer1,
    item.isCorrect1 ? 'ĐÚNG' : 'SAI',
    item.answer2,
    item.isCorrect2 ? 'ĐÚNG' : 'SAI',
    item.answer3 || '',
    item.answer3 ? (item.isCorrect3 ? 'ĐÚNG' : 'SAI') : '',
    item.answer4 || '',
    item.answer4 ? (item.isCorrect4 ? 'ĐÚNG' : 'SAI') : '',
    item.answer5 || '',
    item.answer5 ? (item.isCorrect5 ? 'ĐÚNG' : 'SAI') : ''
  ]);

  // Thêm headers vào đầu
  const worksheetData = [headers, ...excelData];

  // Tạo workbook và worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Thiết lập độ rộng cột
  const colWidths = [
    { wch: 50 }, // Câu hỏi
    { wch: 15 }, // Số lựa chọn
    { wch: 30 }, // Đáp án 1
    { wch: 12 }, // Đúng/Sai 1
    { wch: 30 }, // Đáp án 2
    { wch: 12 }, // Đúng/Sai 2
    { wch: 30 }, // Đáp án 3
    { wch: 12 }, // Đúng/Sai 3
    { wch: 30 }, // Đáp án 4
    { wch: 12 }, // Đúng/Sai 4
    { wch: 30 }, // Đáp án 5
    { wch: 12 }  // Đúng/Sai 5
  ];
  ws['!cols'] = colWidths;

  // Thêm worksheet vào workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Template Câu Hỏi');

  // Tạo file Excel và download
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  const fileName = `template-cau-hoi-${new Date().toISOString().split('T')[0]}.xlsx`;
  saveAs(data, fileName);
};

// Import và parse file Excel
export const parseExcelFile = (file: File): Promise<ImportedQuestion[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Lấy sheet đầu tiên
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Chuyển đổi thành JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Bỏ qua header row (row đầu tiên)
        const dataRows = jsonData.slice(1) as any[][];
        
        const questions: ImportedQuestion[] = [];
        
        dataRows.forEach((row, index) => {
          // Kiểm tra row có dữ liệu không
          if (!row[0] || !row[1]) return;
          
          const question = String(row[0]).trim();
          const maxChoices = parseInt(String(row[1])) || 1;
          
          const answers: Array<{ answer: string; isCorrect: boolean }> = [];
          
          // Xử lý các đáp án (từ cột 2 trở đi, mỗi đáp án có 2 cột: nội dung và đúng/sai)
          for (let i = 2; i < row.length; i += 2) {
            const answerText = row[i] ? String(row[i]).trim() : '';
            const isCorrectText = row[i + 1] ? String(row[i + 1]).trim().toUpperCase() : '';
            
            if (answerText) {
              const isCorrect = isCorrectText === 'ĐÚNG' || isCorrectText === 'TRUE' || isCorrectText === '1';
              answers.push({
                answer: answerText,
                isCorrect
              });
            }
          }
          
          // Kiểm tra validation
          if (question && answers.length >= 2) {
            const correctAnswersCount = answers.filter(a => a.isCorrect).length;
            
            if (correctAnswersCount === 0) {
              console.warn(`Câu hỏi dòng ${index + 2}: Không có đáp án đúng`);
              return;
            }
            
            if (correctAnswersCount > maxChoices) {
              console.warn(`Câu hỏi dòng ${index + 2}: Số đáp án đúng (${correctAnswersCount}) vượt quá số lựa chọn tối đa (${maxChoices})`);
              return;
            }
            
            questions.push({
              question,
              maxChoices,
              answers
            });
          }
        });
        
        resolve(questions);
      } catch (error) {
        reject(new Error('Lỗi khi đọc file Excel: ' + (error as Error).message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Lỗi khi đọc file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Validate imported questions
export const validateImportedQuestions = (questions: ImportedQuestion[]): string[] => {
  const errors: string[] = [];
  
  questions.forEach((q, index) => {
    const questionNumber = index + 1;
    
    if (!q.question.trim()) {
      errors.push(`Câu hỏi ${questionNumber}: Thiếu nội dung câu hỏi`);
    }
    
    if (q.answers.length < 2) {
      errors.push(`Câu hỏi ${questionNumber}: Phải có ít nhất 2 đáp án`);
    }
    
    const correctAnswers = q.answers.filter(a => a.isCorrect);
    if (correctAnswers.length === 0) {
      errors.push(`Câu hỏi ${questionNumber}: Phải có ít nhất 1 đáp án đúng`);
    }
    
    if (correctAnswers.length > q.maxChoices) {
      errors.push(`Câu hỏi ${questionNumber}: Số đáp án đúng (${correctAnswers.length}) vượt quá số lựa chọn tối đa (${q.maxChoices})`);
    }
    
    q.answers.forEach((answer, answerIndex) => {
      if (!answer.answer.trim()) {
        errors.push(`Câu hỏi ${questionNumber}, đáp án ${answerIndex + 1}: Thiếu nội dung đáp án`);
      }
    });
  });
  
  return errors;
};