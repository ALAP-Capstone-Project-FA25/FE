import { useState } from "react";

const SUBJECTS = {
  MATH: {
    name: "Toán học",
    explanation:
      "Bạn hay chọn các tình huống dùng con số, công thức. Hợp với môn cần tư duy logic, chính xác."
  },
  CHEM: {
    name: "Hóa học",
    explanation:
      "Bạn thích thí nghiệm và phản ứng giữa các chất. Hợp với môn tìm hiểu cấu tạo và biến đổi vật chất."
  },
  PHYS: {
    name: "Vật lý",
    explanation:
      "Bạn quan tâm hiện tượng tự nhiên và câu hỏi 'tại sao'. Hợp với môn kết hợp suy luận và quan sát."
  },
  BIO: {
    name: "Sinh học",
    explanation:
      "Bạn hứng thú với cơ thể, sinh vật sống và môi trường. Hợp với môn về thế giới sống và sức khỏe."
  },
  ENG_LIT: {
    name: "Văn học Anh",
    explanation:
      "Bạn thích đọc, phân tích truyện và nhân vật. Hợp với môn dùng nhiều ngôn ngữ và cảm nhận."
  },
  HISTORY: {
    name: "Lịch sử",
    explanation:
      "Bạn chú ý mốc thời gian và sự kiện. Hợp với môn tìm hiểu quá khứ để hiểu hiện tại."
  },
  GEO: {
    name: "Địa lý",
    explanation:
      "Bạn quan tâm bản đồ, vùng miền và khí hậu. Hợp với môn nghiên cứu mối liên hệ người–môi trường."
  },
  LING: {
    name: "Ngôn ngữ học",
    explanation:
      "Bạn thích cấu trúc câu, từ và học nhiều ngôn ngữ. Hợp với môn phân tích cách ngôn ngữ vận hành."
  },
  MEDIA: {
    name: "Truyền thông",
    explanation:
      "Bạn quan tâm mạng xã hội, video và nội dung số. Hợp với môn tạo và phân tích nội dung truyền thông."
  },
  IT: {
    name: "Công nghệ thông tin",
    explanation:
      "Bạn thích máy tính, phần mềm, lập trình. Hợp với môn dùng công nghệ để giải quyết vấn đề."
  },
  BUSINESS: {
    name: "Kinh doanh",
    explanation:
      "Bạn hay nghĩ đến tiền, thị trường và kế hoạch. Hợp với môn về kinh doanh và quản lý."
  },
  ART_DESIGN: {
    name: "Nghệ thuật và thiết kế",
    explanation:
      "Bạn thích vẽ, thiết kế và hình ảnh. Hợp với môn thể hiện ý tưởng bằng yếu tố trực quan."
  },
  PE: {
    name: "Thể thao",
    explanation:
      "Bạn yêu vận động và thể thao. Hợp với môn liên quan thể lực và làm việc nhóm."
  },
  PSY: {
    name: "Tâm lý học",
    explanation:
      "Bạn quan tâm cảm xúc, hành vi và động lực con người. Hợp với môn tìm hiểu cách con người suy nghĩ và cư xử."
  }
};

const QUESTIONS = [
  {
    id: 1,
    text: "Trong các hoạt động sau, bạn thấy hứng thú nhất với việc nào?",
    options: [
      {
        code: "A",
        text: "Giải những bài toán logic, câu đố số học khó.",
        target_subjects: ["MATH", "PHYS", "IT"]
      },
      {
        code: "B",
        text: "Làm thí nghiệm, trộn các dung dịch xem phản ứng ra sao.",
        target_subjects: ["CHEM", "BIO"]
      },
      {
        code: "C",
        text: "Đọc truyện, phân tích nhân vật và ý nghĩa câu chuyện.",
        target_subjects: ["ENG_LIT", "PSY"]
      },
      {
        code: "D",
        text: "Vẽ, thiết kế poster, bìa sách hoặc hình minh họa.",
        target_subjects: ["ART_DESIGN", "MEDIA"]
      }
    ]
  },
  {
    id: 2,
    text: "Ở trường, bạn thường được khen vì:",
    options: [
      {
        code: "A",
        text: "Tính toán nhanh, làm bài có nhiều công thức chính xác.",
        target_subjects: ["MATH", "PHYS"]
      },
      {
        code: "B",
        text: "Ghi nhớ tốt các mốc thời gian, sự kiện, thông tin chi tiết.",
        target_subjects: ["HISTORY", "GEO"]
      },
      {
        code: "C",
        text: "Nói chuyện tự tin, thuyết trình, thuyết phục người khác.",
        target_subjects: ["BUSINESS", "MEDIA"]
      },
      {
        code: "D",
        text: "Khả năng vận động, thể lực tốt, chơi thể thao ổn.",
        target_subjects: ["PE"]
      }
    ]
  },
  {
    id: 3,
    text: "Nếu có một buổi chiều rảnh, bạn thích:",
    options: [
      {
        code: "A",
        text: "Chơi game, mày mò máy tính, phần mềm, app.",
        target_subjects: ["IT"]
      },
      {
        code: "B",
        text: "Chơi thể thao ngoài trời, vận động với bạn bè.",
        target_subjects: ["PE", "BIO"]
      },
      {
        code: "C",
        text: "Xem phim, lướt mạng xã hội, xem các kênh review, vlog.",
        target_subjects: ["MEDIA", "BUSINESS"]
      },
      {
        code: "D",
        text: "Đọc sách, tìm hiểu kiến thức mới về thế giới xung quanh.",
        target_subjects: ["HISTORY", "ENG_LIT", "PSY"]
      }
    ]
  },
  {
    id: 4,
    text: "Kiểu câu hỏi nào bạn thấy thú vị nhất?",
    options: [
      {
        code: "A",
        text: "“Tại sao vật này rơi nhanh hơn vật kia?”",
        target_subjects: ["PHYS"]
      },
      {
        code: "B",
        text: "“Chất này phản ứng thế nào với chất kia?”",
        target_subjects: ["CHEM"]
      },
      {
        code: "C",
        text: "“Vì sao con người lại suy nghĩ và cư xử như vậy?”",
        target_subjects: ["PSY"]
      },
      {
        code: "D",
        text: "“Vì sao một quốc gia phát triển nhanh hơn quốc gia khác?”",
        target_subjects: ["HISTORY", "BUSINESS", "GEO"]
      }
    ]
  },
  {
    id: 5,
    text: "Khi nhìn vào bản đồ thế giới, bạn:",
    options: [
      {
        code: "A",
        text: "Chỉ nhìn lướt qua, không để ý nhiều.",
        target_subjects: []
      },
      {
        code: "B",
        text: "Hứng thú xem các châu lục, khí hậu, địa hình, dân cư.",
        target_subjects: ["GEO"]
      },
      {
        code: "C",
        text: "Nghĩ về giao thương, kinh tế, du lịch giữa các vùng.",
        target_subjects: ["BUSINESS", "GEO"]
      },
      {
        code: "D",
        text: "Nghĩ xem nếu đến đó mình sẽ chụp gì, quay vlog, kể chuyện gì.",
        target_subjects: ["MEDIA", "ART_DESIGN"]
      }
    ]
  },
  {
    id: 6,
    text: "Về ngôn ngữ, bạn thấy mình:",
    options: [
      {
        code: "A",
        text: "Thích phân tích cấu trúc câu, từ, ngữ pháp, hệ thống của ngôn ngữ.",
        target_subjects: ["LING"]
      },
      {
        code: "B",
        text: "Thích viết truyện, thơ, cảm nhận văn chương.",
        target_subjects: ["ENG_LIT"]
      },
      {
        code: "C",
        text: "Thích học nhiều thứ tiếng để giao tiếp với người khác.",
        target_subjects: ["LING", "MEDIA"]
      },
      {
        code: "D",
        text: "Không hứng thú lắm, chỉ học cho đủ điểm.",
        target_subjects: []
      }
    ]
  },
  {
    id: 7,
    text: "Bạn thích kiểu dự án nhóm nào nhất?",
    options: [
      {
        code: "A",
        text: "Lập trình một ứng dụng hoặc website nhỏ.",
        target_subjects: ["IT"]
      },
      {
        code: "B",
        text: "Lập kế hoạch mở một cửa hàng/brand giả định.",
        target_subjects: ["BUSINESS"]
      },
      {
        code: "C",
        text: "Tổ chức giải thể thao hoặc hoạt động vận động cho lớp/trường.",
        target_subjects: ["PE", "PSY"]
      },
      {
        code: "D",
        text: "Làm video, poster, chiến dịch quảng bá cho một sự kiện.",
        target_subjects: ["MEDIA", "ART_DESIGN"]
      }
    ]
  },
  {
    id: 8,
    text: "Bạn dễ tập trung hơn khi:",
    options: [
      {
        code: "A",
        text: "Làm bài tập có quy tắc rõ ràng, cách giải cụ thể.",
        target_subjects: ["MATH", "IT"]
      },
      {
        code: "B",
        text: "Tự tay làm thí nghiệm, quan sát hiện tượng trực tiếp.",
        target_subjects: ["CHEM", "PHYS", "BIO"]
      },
      {
        code: "C",
        text: "Nghe kể các câu chuyện, ví dụ thực tế, tình huống đời sống.",
        target_subjects: ["HISTORY", "PSY", "BUSINESS"]
      },
      {
        code: "D",
        text: "Được tự do sáng tạo, không bị bó buộc bởi khuôn mẫu.",
        target_subjects: ["ART_DESIGN", "MEDIA"]
      }
    ]
  },
  {
    id: 9,
    text: "Nếu phải chọn một chủ đề thuyết trình, bạn sẽ chọn:",
    options: [
      {
        code: "A",
        text: "Ứng dụng trí tuệ nhân tạo trong cuộc sống hiện đại.",
        target_subjects: ["IT", "MATH"]
      },
      {
        code: "B",
        text: "Tác động của con người đến môi trường và hệ sinh thái.",
        target_subjects: ["BIO", "GEO"]
      },
      {
        code: "C",
        text: "Ảnh hưởng của mạng xã hội lên giới trẻ.",
        target_subjects: ["MEDIA", "PSY"]
      },
      {
        code: "D",
        text: "Những phong trào nghệ thuật nổi bật trong thời hiện đại.",
        target_subjects: ["ART_DESIGN", "ENG_LIT"]
      }
    ]
  },
  {
    id: 10,
    text: "Về các môn Khoa học tự nhiên (Toán – Lý – Hóa – Sinh), bạn:",
    options: [
      {
        code: "A",
        text: "Thích tất cả, đặc biệt là được làm thí nghiệm.",
        target_subjects: ["CHEM", "PHYS", "BIO"]
      },
      {
        code: "B",
        text: "Thích phần tính toán, công thức, suy luận.",
        target_subjects: ["MATH", "PHYS"]
      },
      {
        code: "C",
        text: "Chỉ thích phần liên quan đến cơ thể, sức khỏe, sinh vật sống.",
        target_subjects: ["BIO", "PSY"]
      },
      {
        code: "D",
        text: "Không thích lắm, thường chỉ làm cho xong bài.",
        target_subjects: []
      }
    ]
  }
];

interface TestResult {
  recommended: [string, number][];
  scores: Record<string, number>;
}

export default function EntryTestPage() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<TestResult | null>(null);

  const handleChange = (questionId: number, optionCode: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionCode
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const scores: Record<string, number> = {};
    QUESTIONS.forEach((q) => {
      const selectedCode = answers[q.id];
      if (!selectedCode) return;
      const option = q.options.find((o) => o.code === selectedCode);
      if (!option) return;
      option.target_subjects.forEach((subj) => {
        scores[subj] = (scores[subj] || 0) + 1;
      });
    });

    const sorted = Object.entries(scores)
      .filter(([, score]) => (score as number) > 0)
      .sort((a, b) => (b[1] as number) - (a[1] as number));

    const top = sorted.slice(0, 3);
    setResult({
      recommended: top,
      scores
    });
  };

  const allAnswered = QUESTIONS.every((q) => answers[q.id]);

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-start py-6 px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Entry Test – A-level Adaptive Learning
        </h1>
        <p className="text-sm text-slate-500 mt-1 mb-5">
          Trả lời nhanh các câu hỏi dưới đây để xem bạn phù hợp với những môn A-level nào.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {QUESTIONS.map((q) => (
            <div
              key={q.id}
              className="border border-slate-200 rounded-xl bg-slate-50 px-4 py-3"
            >
              <div className="mb-2">
                <span className="inline-flex items-center justify-center text-xs font-semibold text-blue-700 bg-blue-50 rounded-full px-2 py-0.5 mr-2">
                  Câu {q.id}
                </span>
                <span className="font-semibold text-sm text-slate-800">
                  {q.text}
                </span>
              </div>
              <div className="space-y-1">
                {q.options.map((opt) => (
                  <label
                    key={opt.code}
                    className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={opt.code}
                      className="mt-0.5 accent-blue-600"
                      checked={answers[q.id] === opt.code}
                      onChange={() => handleChange(q.id, opt.code)}
                    />
                    <span>
                      <span className="font-semibold mr-1">
                        {opt.code}.
                      </span>
                      {opt.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-2">
            <button
              type="submit"
              disabled={!allAnswered}
              className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Xem gợi ý môn học
            </button>
            {!allAnswered && (
              <p className="text-xs text-slate-400 mt-1">
                Vui lòng trả lời tất cả câu hỏi trước khi xem kết quả.
              </p>
            )}
          </div>
        </form>

        {result && (
          <div className="mt-6 border-t border-slate-200 pt-4">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Kết quả gợi ý
            </h2>

            {(!result.recommended || result.recommended.length === 0) && (
              <p className="text-sm text-slate-600">
                Chưa có xu hướng rõ ràng. Bạn có thể làm lại bài test hoặc trao đổi thêm với giáo viên.
              </p>
            )}

            {result.recommended && result.recommended.length > 0 && (
              <ul className="space-y-3">
                {result.recommended.map(([subjectId, score]) => {
                  const info = SUBJECTS[subjectId];
                  if (!info) return null;
                  return (
                    <li
                      key={subjectId}
                      className="border border-slate-200 rounded-lg px-3 py-2 bg-slate-50"
                    >
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-900">
                          {info.name}{" "}
                          <span className="text-[11px] text-slate-400">
                            ({subjectId})
                          </span>
                        </span>
                        <span className="text-xs text-slate-600">
                          {score} điểm
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {info.explanation}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}

            <p className="text-[11px] text-slate-400 mt-3">
              *Kết quả chỉ mang tính gợi ý dựa trên câu trả lời của bạn, không phải kết luận tuyệt đối.
              Hãy kết hợp thêm trải nghiệm thực tế và ý kiến từ giáo viên/gia đình khi chọn môn A-level.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
