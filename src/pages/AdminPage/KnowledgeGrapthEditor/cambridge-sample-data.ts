// Cambridge A-Level Mathematics (9709) Sample Data
// This file contains the complete knowledge graph structure with detailed nodes

export const getCambridgeSampleData = () => {
  return {
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    description:
      'Full Cambridge A-Level Mathematics (9709) Structure for Adaptive Learning',
    nodes: [
      // ========== PURE MATH 1 (AS LEVEL) - NỀN TẢNG ==========
      // Level 0: Nodes chính (y = 50)
      {
        id: 'P1-QUAD',
        position: { x: 200, y: 50 },
        data: {
          label: 'Hàm bậc hai & Phương trình (Quadratics)',
          category: 'pure_foundation',
          description: 'Nền tảng về phương trình bậc hai, tam thức bậc hai',
          concepts: [
            'Hoàn thành bình phương',
            'Định lý Viète',
            'Bất phương trình bậc hai',
            'Dấu tam thức bậc hai'
          ],
          examples: [
            'Tìm m để phương trình có 2 nghiệm phân biệt',
            'Giải bất phương trình x² - 5x + 6 > 0'
          ],
          prerequisites: [],
          estimatedTime: '2 tuần',
          difficulty: 'Cơ bản',
          status: 'available',
          resources: []
        }
      },
      // Level 1: Nodes chi tiết của P1-QUAD (y = 200)
      {
        id: 'P1-QUAD-CONCEPT',
        position: { x: 100, y: 200 },
        data: {
          label: 'Khái niệm phương trình bậc hai',
          category: 'beginner',
          description:
            'Định nghĩa và các khái niệm cơ bản về phương trình bậc hai',
          concepts: [
            'Dạng tổng quát ax² + bx + c = 0',
            'Nghiệm của phương trình',
            'Biệt thức Δ = b² - 4ac'
          ],
          examples: [
            'Phương trình x² - 5x + 6 = 0',
            'Tìm nghiệm bằng công thức nghiệm'
          ],
          prerequisites: [],
          estimatedTime: '3 ngày',
          difficulty: 'Cơ bản',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P1-QUAD-COMPLETE',
        position: { x: 300, y: 200 },
        data: {
          label: 'Hoàn thành bình phương',
          category: 'intermediate',
          description:
            'Kỹ thuật hoàn thành bình phương để giải phương trình bậc hai',
          concepts: [
            'Biến đổi về dạng (x + p)² = q',
            'Tìm đỉnh parabol',
            'Ứng dụng trong bài toán'
          ],
          examples: [
            'x² - 6x + 5 = 0 → (x - 3)² = 4',
            'Tìm tọa độ đỉnh parabol'
          ],
          prerequisites: [],
          estimatedTime: '1 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P1-FUNC',
        position: { x: 600, y: 50 },
        data: {
          label: 'Hàm số (Functions)',
          category: 'pure_foundation',
          description: 'Khái niệm hàm số, tập xác định, hàm ngược, hàm hợp',
          concepts: [
            'Domain & Range',
            'Hàm đơn ánh/song ánh',
            'Hàm ngược (Inverse)',
            'Hàm hợp (Composite)'
          ],
          examples: [
            'Tìm tập xác định của f(x) = √(x-1)',
            'Tìm hàm ngược của y = (2x+1)/(x-3)'
          ],
          prerequisites: [],
          estimatedTime: '2-3 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      // Level 1: Nodes chi tiết của P1-FUNC (y = 200)
      {
        id: 'P1-FUNC-CONCEPT',
        position: { x: 500, y: 200 },
        data: {
          label: 'Khái niệm hàm số',
          category: 'beginner',
          description: 'Định nghĩa hàm số và các khái niệm cơ bản',
          concepts: [
            'Định nghĩa hàm số f: X → Y',
            'Tập xác định (Domain)',
            'Tập giá trị (Range)',
            'Đồ thị hàm số'
          ],
          examples: ['f(x) = x² là hàm số', 'Tìm domain của f(x) = 1/(x-2)'],
          prerequisites: [],
          estimatedTime: '1 tuần',
          difficulty: 'Cơ bản',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P1-FUNC-INVERSE',
        position: { x: 700, y: 200 },
        data: {
          label: 'Hàm ngược (Inverse Function)',
          category: 'intermediate',
          description: 'Tìm hàm ngược và điều kiện tồn tại',
          concepts: [
            'Điều kiện hàm có hàm ngược',
            'Cách tìm hàm ngược',
            'Đồ thị hàm ngược'
          ],
          examples: [
            'Tìm f⁻¹(x) của y = 2x + 3',
            'Tìm hàm ngược của y = (x+1)/(x-1)'
          ],
          prerequisites: [],
          estimatedTime: '1 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P1-COORD',
        position: { x: 1000, y: 50 },
        data: {
          label: 'Hình học tọa độ (Coordinate Geometry)',
          category: 'geometry',
          description: 'Phương trình đường thẳng và đường tròn',
          concepts: [
            'Phương trình đường thẳng y=mx+c',
            'Khoảng cách 2 điểm',
            'Phương trình đường tròn (x-a)² + (y-b)² = r²'
          ],
          examples: [
            'Viết phương trình tiếp tuyến của đường tròn',
            'Tìm giao điểm của đường thẳng và đường cong'
          ],
          prerequisites: [],
          estimatedTime: '3 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P1-TRIG',
        position: { x: 1400, y: 50 },
        data: {
          label: 'Lượng giác cơ bản (Trigonometry P1)',
          category: 'trigonometry',
          description: 'Đồ thị lượng giác và các đẳng thức cơ bản',
          concepts: [
            'Đường tròn lượng giác',
            'Đồ thị sin, cos, tan',
            'Đẳng thức sin² + cos² = 1',
            'Phương trình lượng giác cơ bản'
          ],
          examples: [
            'Giải phương trình 2cos(2x) = 1',
            'Chứng minh đẳng thức lượng giác'
          ],
          prerequisites: [],
          estimatedTime: '3-4 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P1-DIFF',
        position: { x: 1000, y: 50 },
        data: {
          label: 'Đạo hàm cơ bản (Differentiation P1)',
          category: 'calculus',
          description: 'Định nghĩa đạo hàm và quy tắc chuỗi cơ bản',
          concepts: [
            'Đạo hàm x^n',
            'Quy tắc chuỗi (Chain rule basic)',
            'Tiếp tuyến và pháp tuyến',
            'Tốc độ thay đổi (Rate of change)'
          ],
          examples: [
            'Tìm hệ số góc tiếp tuyến tại x=2',
            'Bài toán tốc độ thay đổi thể tích'
          ],
          prerequisites: [],
          estimatedTime: '4 tuần',
          difficulty: 'Nâng cao',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P1-INT',
        position: { x: 1400, y: 50 },
        data: {
          label: 'Tích phân cơ bản (Integration P1)',
          category: 'calculus',
          description: 'Nguyên hàm và tích phân xác định',
          concepts: [
            'Nguyên hàm của x^n',
            'Tích phân xác định',
            'Tính diện tích dưới đường cong',
            'Thể tích khối tròn xoay (Volume of revolution)'
          ],
          examples: [
            'Tính diện tích giới hạn bởi y=x² và y=x',
            'Tính thể tích khi quay quanh trục Ox'
          ],
          prerequisites: [],
          estimatedTime: '4 tuần',
          difficulty: 'Nâng cao',
          status: 'available',
          resources: []
        }
      },
      // ========== MECHANICS 1 (M1) ==========
      {
        id: 'M1-KIN',
        position: { x: 1000, y: 400 },
        data: {
          label: 'Động học (Kinematics)',
          category: 'mechanics',
          description: 'Chuyển động thẳng và đồ thị chuyển động',
          concepts: [
            'Phương trình Suvat (v = u + at...)',
            'Đồ thị v-t, s-t',
            'Chuyển động với gia tốc không đổi',
            'Rơi tự do'
          ],
          examples: [
            'Tính quãng đường đi được từ đồ thị v-t',
            'Bài toán xe đuổi nhau'
          ],
          prerequisites: [],
          estimatedTime: '3 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'M1-DYN',
        position: { x: 2600, y: 50 },
        data: {
          label: "Động lực học (Newton's Laws)",
          category: 'mechanics',
          description: 'Định luật Newton và phân tích lực',
          concepts: [
            'Định luật 2 Newton (F=ma)',
            'Lực ma sát',
            'Mặt phẳng nghiêng',
            'Hệ ròng rọc (Pulleys)'
          ],
          examples: [
            'Tính gia tốc vật trượt trên mặt phẳng nghiêng',
            'Tính lực căng dây'
          ],
          prerequisites: [],
          estimatedTime: '4 tuần',
          difficulty: 'Nâng cao',
          status: 'available',
          resources: []
        }
      },
      // ========== STATISTICS 1 (S1) ==========
      {
        id: 'S1-DATA',
        position: { x: 1800, y: 50 },
        data: {
          label: 'Biểu diễn dữ liệu (Data Rep)',
          category: 'statistics',
          description: 'Biểu đồ và các số đặc trưng',
          concepts: [
            'Stem-and-leaf',
            'Box-and-whisker',
            'Histogram',
            'Mean, Median, Mode, Standard Deviation'
          ],
          examples: [
            'Vẽ Histogram mật độ',
            'Tính độ lệch chuẩn từ bảng tần số'
          ],
          prerequisites: [],
          estimatedTime: '2 tuần',
          difficulty: 'Cơ bản',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'S1-PROB',
        position: { x: 1800, y: 400 },
        data: {
          label: 'Xác suất & Tổ hợp (Probability)',
          category: 'statistics',
          description: 'Hoán vị, chỉnh hợp, tổ hợp và xác suất',
          concepts: [
            'Permutations & Combinations (nCr)',
            'Xác suất độc lập',
            'Xác suất xung khắc'
          ],
          examples: ['Xếp 5 người vào bàn tròn', 'Chọn đội bóng từ 20 người'],
          prerequisites: [],
          estimatedTime: '3 tuần',
          difficulty: 'Nâng cao',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'S1-DIST',
        position: { x: 3400, y: 50 },
        data: {
          label: 'Phân phối xác suất (Distributions)',
          category: 'statistics',
          description: 'Biến ngẫu nhiên rời rạc và phân phối chuẩn',
          concepts: [
            'Phân phối nhị thức (Binomial)',
            'Phân phối hình học (Geometric)',
            'Phân phối chuẩn (Normal Distribution)',
            'Chuẩn hóa Z-score'
          ],
          examples: [
            'Tính xác suất P(X > 50) với phân phối chuẩn',
            'Bài toán bắn súng trúng mục tiêu'
          ],
          prerequisites: [],
          estimatedTime: '3-4 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      // ========== PURE MATH 3 (A2 LEVEL) ==========
      // Level 2: P3 nodes chính (y = 600)
      {
        id: 'P3-ALG',
        position: { x: 200, y: 400 },
        data: {
          label: 'Đại số nâng cao (P3 Algebra)',
          category: 'pure_advanced',
          description: 'Phân thức hữu tỉ, đa thức, Logarit',
          concepts: [
            'Phân thức đại số (Partial Fractions)',
            'Hàm mũ & Logarit (ln x, e^x)',
            'Phương trình Logarit'
          ],
          examples: [
            'Tách phân thức 1/((x-1)(x+2))',
            'Giải phương trình e^(2x) + 3e^x - 4 = 0'
          ],
          prerequisites: [],
          estimatedTime: '3 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P3-TRIG',
        position: { x: 600, y: 600 },
        data: {
          label: 'Lượng giác nâng cao (P3 Trig)',
          category: 'trigonometry',
          description: 'Các hàm sec, cosec, cot và công thức cộng',
          concepts: [
            'Sec, Cosec, Cot',
            'Công thức cộng (Compound angles)',
            'Công thức nhân đôi',
            'Dạng Rcos(x-a)'
          ],
          examples: ['Giải phương trình sec²x = 4', 'Biến đổi asinx + bcosx'],
          prerequisites: [],
          estimatedTime: '3 tuần',
          difficulty: 'Nâng cao',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P3-DIFF',
        position: { x: 1000, y: 400 },
        data: {
          label: 'Đạo hàm nâng cao (Differentiation P3)',
          category: 'calculus',
          description: 'Đạo hàm hàm hợp, tích, thương, hàm ẩn',
          concepts: [
            'Product Rule & Quotient Rule',
            'Đạo hàm hàm lượng giác/mũ/log',
            'Đạo hàm hàm ẩn (Implicit)',
            'Tham số (Parametric)'
          ],
          examples: ['Đạo hàm y = x²sin(x)', 'Tìm dy/dx của x² + y² = 4'],
          prerequisites: [],
          estimatedTime: '4-5 tuần',
          difficulty: 'Nâng cao',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P3-INT',
        position: { x: 1400, y: 600 },
        data: {
          label: 'Tích phân nâng cao (Integration P3)',
          category: 'calculus',
          description: 'Các kỹ thuật tích phân phức tạp',
          concepts: [
            'Tích phân từng phần (Integration by Parts)',
            'Đổi biến số (Substitution)',
            'Tích phân phân thức hữu tỉ'
          ],
          examples: ['Tính ∫x.e^x dx', 'Tính ∫1/(x²+1) dx'],
          prerequisites: [],
          estimatedTime: '4-5 tuần',
          difficulty: 'Nâng cao',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P3-COMPLEX',
        position: { x: 1800, y: 400 },
        data: {
          label: 'Số phức (Complex Numbers)',
          category: 'specialized',
          description: 'Số ảo i và mặt phẳng Argand',
          concepts: [
            'Cộng trừ nhân chia số phức',
            'Dạng lượng giác (Polar form)',
            'Căn bậc hai của số phức',
            'Biểu diễn hình học (Locus)'
          ],
          examples: [
            'Tìm modun và argument',
            'Tìm tập hợp điểm |z - 3| = |z + i|'
          ],
          prerequisites: [],
          estimatedTime: '3 tuần',
          difficulty: 'Nâng cao',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P3-DIFFEQ',
        position: { x: 2200, y: 400 },
        data: {
          label: 'Phương trình vi phân (Diff Equations)',
          category: 'calculus',
          description: 'Phương trình vi phân cấp 1 tách biến',
          concepts: [
            'Tách biến (Separable variables)',
            'Ứng dụng vào bài toán thực tế'
          ],
          examples: ['Giải dy/dx = y(x+1)', 'Mô hình làm nguội Newton'],
          prerequisites: [],
          estimatedTime: '2 tuần',
          difficulty: 'Nâng cao',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P3-NUM',
        position: { x: 2600, y: 400 },
        data: {
          label: 'Phương pháp số (Numerical Methods)',
          category: 'numerical',
          description: 'Tìm nghiệm gần đúng',
          concepts: ['Phép lặp (Iteration x_n+1)', 'Sự hội tụ (Convergence)'],
          examples: ['Tìm nghiệm của x = cos(x) bằng phép lặp'],
          prerequisites: [],
          estimatedTime: '1-2 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P3-VEC',
        position: { x: 3000, y: 400 },
        data: {
          label: 'Vectors nâng cao (3D Vectors)',
          category: 'geometry',
          description: 'Vector trong không gian, đường thẳng và mặt phẳng',
          concepts: [
            'Phương trình đường thẳng 3D',
            'Tích vô hướng (Scalar product)',
            'Góc giữa 2 đường thẳng',
            'Khoảng cách từ điểm đến đường thẳng'
          ],
          examples: [
            'Tìm giao điểm 2 đường thẳng chéo nhau',
            'Tính góc giữa 2 vector'
          ],
          prerequisites: [],
          estimatedTime: '3 tuần',
          difficulty: 'Nâng cao',
          status: 'available',
          resources: []
        }
      },
      // ========== CHI TIẾT CHO P1-DIFF (Đạo hàm cơ bản) ==========
      // Level 1: Nodes chi tiết của P1-DIFF (y = 200)
      {
        id: 'P1-DIFF-CONCEPT',
        position: { x: 900, y: 200 },
        data: {
          label: 'Khái niệm đạo hàm',
          category: 'beginner',
          description: 'Định nghĩa đạo hàm và ý nghĩa hình học',
          concepts: [
            'Định nghĩa đạo hàm bằng giới hạn',
            'Đạo hàm như hệ số góc tiếp tuyến',
            'Đạo hàm như tốc độ thay đổi'
          ],
          examples: ['Tính đạo hàm tại một điểm', 'Tìm hệ số góc tiếp tuyến'],
          prerequisites: [],
          estimatedTime: '1 tuần',
          difficulty: 'Cơ bản',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P1-DIFF-RULES',
        position: { x: 300, y: 500 },
        data: {
          label: 'Quy tắc tính đạo hàm cơ bản',
          category: 'intermediate',
          description: 'Các quy tắc cơ bản để tính đạo hàm',
          concepts: [
            'Đạo hàm của x^n',
            'Đạo hàm của tổng, hiệu',
            'Quy tắc chuỗi cơ bản'
          ],
          examples: ['d/dx(x³) = 3x²', 'd/dx(x² + 3x) = 2x + 3'],
          prerequisites: [],
          estimatedTime: '1-2 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P1-DIFF-APPLY',
        position: { x: 1300, y: 200 },
        data: {
          label: 'Ứng dụng đạo hàm',
          category: 'practical',
          description: 'Sử dụng đạo hàm trong bài toán thực tế',
          concepts: [
            'Tốc độ thay đổi',
            'Tìm cực trị',
            'Tiếp tuyến và pháp tuyến'
          ],
          examples: [
            'Bài toán tốc độ thay đổi thể tích',
            'Tìm giá trị lớn nhất'
          ],
          prerequisites: [],
          estimatedTime: '1 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      // ========== CHI TIẾT CHO P1-INT (Tích phân cơ bản) ==========
      // Level 1: Nodes chi tiết của P1-INT (y = 500)
      {
        id: 'P1-INT-CONCEPT',
        position: { x: 500, y: 500 },
        data: {
          label: 'Khái niệm tích phân',
          category: 'beginner',
          description: 'Định nghĩa và ý nghĩa hình học của tích phân',
          concepts: [
            'Tích phân như diện tích',
            'Nguyên hàm',
            'Định lý cơ bản của giải tích'
          ],
          examples: [
            'Tính diện tích dưới đường cong',
            'Mối liên hệ nguyên hàm và tích phân'
          ],
          prerequisites: [],
          estimatedTime: '1 tuần',
          difficulty: 'Cơ bản',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P1-INT-BASIC',
        position: { x: 1500, y: 200 },
        data: {
          label: 'Tích phân cơ bản',
          category: 'intermediate',
          description: 'Tích phân các hàm cơ bản',
          concepts: [
            'Nguyên hàm của x^n',
            'Tích phân xác định',
            'Công thức Newton-Leibniz'
          ],
          examples: ['∫x²dx = x³/3 + C', '∫₀¹ x²dx = 1/3'],
          prerequisites: [],
          estimatedTime: '1-2 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P1-INT-AREA',
        position: { x: 1700, y: 200 },
        data: {
          label: 'Ứng dụng tính diện tích',
          category: 'practical',
          description: 'Sử dụng tích phân để tính diện tích',
          concepts: [
            'Diện tích dưới đường cong',
            'Diện tích giữa hai đường cong',
            'Thể tích khối tròn xoay'
          ],
          examples: [
            'Tính diện tích giới hạn bởi y=x² và y=x',
            'Tính thể tích khi quay quanh trục Ox'
          ],
          prerequisites: [],
          estimatedTime: '1-2 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      // ========== CHI TIẾT CHO P3-DIFF (Đạo hàm nâng cao) ==========
      // Level 2: Nodes chi tiết của P3-DIFF (y = 600)
      {
        id: 'P3-DIFF-PRODUCT',
        position: { x: 900, y: 600 },
        data: {
          label: 'Quy tắc tích và thương',
          category: 'intermediate',
          description: 'Product Rule và Quotient Rule',
          concepts: [
            "Product Rule: d/dx(uv) = u'v + uv'",
            "Quotient Rule: d/dx(u/v) = (u'v - uv')/v²"
          ],
          examples: ['Đạo hàm y = x²sin(x)', 'Đạo hàm y = (x+1)/(x-1)'],
          prerequisites: [],
          estimatedTime: '1 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P3-DIFF-IMPLICIT',
        position: { x: 1100, y: 600 },
        data: {
          label: 'Đạo hàm hàm ẩn',
          category: 'advanced',
          description: 'Tìm đạo hàm của hàm ẩn',
          concepts: ['Phương trình ẩn x và y', 'Đạo hàm từng phần', 'Ứng dụng'],
          examples: ['Tìm dy/dx của x² + y² = 4', 'Tìm dy/dx của xy + y² = 1'],
          prerequisites: [],
          estimatedTime: '1 tuần',
          difficulty: 'Nâng cao',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P3-DIFF-PARAMETRIC',
        position: { x: 1300, y: 600 },
        data: {
          label: 'Đạo hàm tham số',
          category: 'advanced',
          description: 'Đạo hàm của hàm tham số',
          concepts: [
            'Hàm tham số x(t), y(t)',
            'Công thức dy/dx = (dy/dt)/(dx/dt)',
            'Ứng dụng'
          ],
          examples: ['x = t², y = t³, tìm dy/dx', 'Đường cong tham số'],
          prerequisites: [],
          estimatedTime: '1 tuần',
          difficulty: 'Nâng cao',
          status: 'available',
          resources: []
        }
      },
      // ========== CHI TIẾT CHO P3-INT (Tích phân nâng cao) ==========
      // Level 2: Nodes chi tiết của P3-INT (y = 600)
      {
        id: 'P3-INT-PARTS',
        position: { x: 1300, y: 600 },
        data: {
          label: 'Tích phân từng phần',
          category: 'advanced',
          description: 'Kỹ thuật Integration by Parts',
          concepts: ['Công thức ∫udv = uv - ∫vdu', 'Chọn u và dv', 'Ứng dụng'],
          examples: ['Tính ∫x.e^x dx', 'Tính ∫x.ln(x) dx'],
          prerequisites: [],
          estimatedTime: '1-2 tuần',
          difficulty: 'Nâng cao',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P3-INT-SUBSTITUTION',
        position: { x: 1500, y: 600 },
        data: {
          label: 'Đổi biến số',
          category: 'advanced',
          description: 'Kỹ thuật Substitution',
          concepts: [
            'Đổi biến u = g(x)',
            'Tính du/dx',
            'Thay thế vào tích phân'
          ],
          examples: ['Tính ∫2x.e^(x²) dx', 'Tính ∫sin(x)cos(x) dx'],
          prerequisites: [],
          estimatedTime: '1-2 tuần',
          difficulty: 'Nâng cao',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P3-INT-PARTIAL',
        position: { x: 1700, y: 600 },
        data: {
          label: 'Tích phân phân thức hữu tỉ',
          category: 'advanced',
          description: 'Sử dụng Partial Fractions',
          concepts: ['Tách phân thức', 'Tích phân từng phần', 'Ứng dụng'],
          examples: ['Tính ∫1/((x-1)(x+2)) dx', 'Tích phân phân thức phức tạp'],
          prerequisites: [],
          estimatedTime: '1-2 tuần',
          difficulty: 'Nâng cao',
          status: 'available',
          resources: []
        }
      },
      // ========== CHI TIẾT CHO P1-COORD (Hình học tọa độ) ==========
      // Level 1: Nodes chi tiết của P1-COORD (y = 200)
      {
        id: 'P1-COORD-LINE',
        position: { x: 900, y: 200 },
        data: {
          label: 'Phương trình đường thẳng',
          category: 'intermediate',
          description: 'Phương trình đường thẳng và các dạng',
          concepts: [
            'Dạng y = mx + c',
            'Dạng ax + by + c = 0',
            'Hệ số góc',
            'Giao điểm'
          ],
          examples: [
            'Viết phương trình đường thẳng qua 2 điểm',
            'Tìm hệ số góc'
          ],
          prerequisites: [],
          estimatedTime: '1 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P1-COORD-CIRCLE',
        position: { x: 1100, y: 200 },
        data: {
          label: 'Phương trình đường tròn',
          category: 'intermediate',
          description: 'Phương trình đường tròn và tiếp tuyến',
          concepts: [
            'Dạng (x-a)² + (y-b)² = r²',
            'Tâm và bán kính',
            'Tiếp tuyến'
          ],
          examples: [
            'Viết phương trình đường tròn',
            'Tìm tiếp tuyến tại một điểm'
          ],
          prerequisites: [],
          estimatedTime: '1-2 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      // ========== CHI TIẾT CHO P1-TRIG (Lượng giác cơ bản) ==========
      // Level 1: Nodes chi tiết của P1-TRIG (y = 200)
      {
        id: 'P1-TRIG-CIRCLE',
        position: { x: 1300, y: 200 },
        data: {
          label: 'Đường tròn lượng giác',
          category: 'beginner',
          description: 'Đường tròn đơn vị và các góc',
          concepts: ['Đường tròn đơn vị', 'Góc và radian', 'Các góc đặc biệt'],
          examples: ['Tìm sin, cos của góc 30°', 'Chuyển đổi độ sang radian'],
          prerequisites: [],
          estimatedTime: '1 tuần',
          difficulty: 'Cơ bản',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P1-TRIG-GRAPH',
        position: { x: 1500, y: 200 },
        data: {
          label: 'Đồ thị hàm lượng giác',
          category: 'intermediate',
          description: 'Vẽ và phân tích đồ thị sin, cos, tan',
          concepts: [
            'Đồ thị y = sin(x)',
            'Đồ thị y = cos(x)',
            'Chu kỳ và biên độ'
          ],
          examples: ['Vẽ đồ thị y = 2sin(x)', 'Tìm chu kỳ của hàm'],
          prerequisites: [],
          estimatedTime: '1 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P1-TRIG-EQUATION',
        position: { x: 1700, y: 200 },
        data: {
          label: 'Phương trình lượng giác cơ bản',
          category: 'intermediate',
          description: 'Giải phương trình lượng giác đơn giản',
          concepts: [
            'sin(x) = a',
            'cos(x) = a',
            'tan(x) = a',
            'Nghiệm tổng quát'
          ],
          examples: ['Giải sin(x) = 1/2', 'Giải cos(2x) = 0'],
          prerequisites: [],
          estimatedTime: '1-2 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      // ========== CHI TIẾT CHO M1-KIN (Động học) ==========
      // Level 1: Nodes chi tiết của M1-KIN (y = 200)
      {
        id: 'M1-KIN-SUVAT',
        position: { x: 2100, y: 200 },
        data: {
          label: 'Phương trình Suvat',
          category: 'intermediate',
          description: 'Các phương trình chuyển động với gia tốc không đổi',
          concepts: [
            'v = u + at',
            's = ut + ½at²',
            'v² = u² + 2as',
            's = ½(u+v)t'
          ],
          examples: ['Tính vận tốc sau 5 giây', 'Tính quãng đường đi được'],
          prerequisites: [],
          estimatedTime: '1-2 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'M1-KIN-GRAPH',
        position: { x: 2300, y: 200 },
        data: {
          label: 'Đồ thị chuyển động',
          category: 'intermediate',
          description: 'Đồ thị v-t, s-t và ứng dụng',
          concepts: [
            'Đồ thị vận tốc-thời gian',
            'Đồ thị quãng đường-thời gian',
            'Diện tích dưới đồ thị'
          ],
          examples: [
            'Tính quãng đường từ đồ thị v-t',
            'Tính gia tốc từ đồ thị'
          ],
          prerequisites: [],
          estimatedTime: '1 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      // ========== CHI TIẾT CHO M1-DYN (Động lực học) ==========
      // Level 1: Nodes chi tiết của M1-DYN (y = 200)
      {
        id: 'M1-DYN-NEWTON',
        position: { x: 2500, y: 200 },
        data: {
          label: 'Định luật Newton',
          category: 'advanced',
          description: 'Định luật 2 Newton và phân tích lực',
          concepts: ['F = ma', 'Phân tích lực', 'Hợp lực', 'Phản lực'],
          examples: [
            'Tính gia tốc từ lực',
            'Phân tích lực trên mặt phẳng nghiêng'
          ],
          prerequisites: [],
          estimatedTime: '2 tuần',
          difficulty: 'Nâng cao',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'M1-DYN-FRICTION',
        position: { x: 2700, y: 200 },
        data: {
          label: 'Lực ma sát',
          category: 'advanced',
          description: 'Lực ma sát và ứng dụng',
          concepts: ['Lực ma sát tĩnh', 'Lực ma sát động', 'Hệ số ma sát'],
          examples: ['Tính lực ma sát', 'Bài toán vật trượt'],
          prerequisites: [],
          estimatedTime: '1 tuần',
          difficulty: 'Nâng cao',
          status: 'available',
          resources: []
        }
      },
      // ========== CHI TIẾT CHO S1-DATA (Biểu diễn dữ liệu) ==========
      // Level 1: Nodes chi tiết của S1-DATA (y = 200)
      {
        id: 'S1-DATA-GRAPH',
        position: { x: 1700, y: 200 },
        data: {
          label: 'Biểu đồ thống kê',
          category: 'beginner',
          description: 'Các loại biểu đồ và cách vẽ',
          concepts: [
            'Stem-and-leaf plot',
            'Box-and-whisker',
            'Histogram',
            'Frequency polygon'
          ],
          examples: ['Vẽ Histogram từ dữ liệu', 'Vẽ Box plot'],
          prerequisites: [],
          estimatedTime: '1 tuần',
          difficulty: 'Cơ bản',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'S1-DATA-STATS',
        position: { x: 1900, y: 200 },
        data: {
          label: 'Các số đặc trưng',
          category: 'beginner',
          description: 'Mean, Median, Mode, Standard Deviation',
          concepts: [
            'Trung bình (Mean)',
            'Trung vị (Median)',
            'Mode',
            'Độ lệch chuẩn'
          ],
          examples: ['Tính mean từ bảng tần số', 'Tính standard deviation'],
          prerequisites: [],
          estimatedTime: '1 tuần',
          difficulty: 'Cơ bản',
          status: 'available',
          resources: []
        }
      },
      // ========== CHI TIẾT CHO S1-PROB (Xác suất) ==========
      // Level 1: Nodes chi tiết của S1-PROB (y = 200)
      {
        id: 'S1-PROB-PERM',
        position: { x: 2900, y: 200 },
        data: {
          label: 'Hoán vị và Chỉnh hợp',
          category: 'intermediate',
          description: 'Permutations và Arrangements',
          concepts: ['nPr = n!/(n-r)!', 'Hoán vị', 'Chỉnh hợp', 'Ứng dụng'],
          examples: ['Xếp 5 người vào 3 ghế', 'Số cách chọn đội bóng'],
          prerequisites: [],
          estimatedTime: '1 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'S1-PROB-COMB',
        position: { x: 3100, y: 200 },
        data: {
          label: 'Tổ hợp',
          category: 'intermediate',
          description: 'Combinations nCr',
          concepts: ['nCr = n!/(r!(n-r)!)', 'Tổ hợp', 'Ứng dụng'],
          examples: ['Chọn 3 người từ 10 người', 'Bài toán xác suất'],
          prerequisites: [],
          estimatedTime: '1 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'S1-PROB-BASIC',
        position: { x: 3300, y: 200 },
        data: {
          label: 'Xác suất cơ bản',
          category: 'beginner',
          description: 'Xác suất đơn giản và xác suất có điều kiện',
          concepts: [
            'P(A) = n(A)/n(S)',
            'Xác suất có điều kiện',
            'Xác suất độc lập'
          ],
          examples: ['Xác suất tung đồng xu', 'Xác suất rút thẻ bài'],
          prerequisites: [],
          estimatedTime: '1 tuần',
          difficulty: 'Cơ bản',
          status: 'available',
          resources: []
        }
      },
      // ========== CHI TIẾT CHO S1-DIST (Phân phối) ==========
      // Level 1: Nodes chi tiết của S1-DIST (y = 200)
      {
        id: 'S1-DIST-BINOMIAL',
        position: { x: 3300, y: 200 },
        data: {
          label: 'Phân phối nhị thức',
          category: 'intermediate',
          description: 'Binomial Distribution',
          concepts: [
            'X ~ B(n, p)',
            'P(X = r) = nCr * p^r * (1-p)^(n-r)',
            'Kỳ vọng và phương sai'
          ],
          examples: [
            'Tính xác suất n lần tung đồng xu',
            'Bài toán kiểm tra chất lượng'
          ],
          prerequisites: [],
          estimatedTime: '1-2 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'S1-DIST-NORMAL',
        position: { x: 3500, y: 200 },
        data: {
          label: 'Phân phối chuẩn',
          category: 'intermediate',
          description: 'Normal Distribution và Z-score',
          concepts: [
            'X ~ N(μ, σ²)',
            'Chuẩn hóa Z = (X-μ)/σ',
            'Bảng phân phối chuẩn'
          ],
          examples: ['Tính P(X > 50)', 'Tìm giá trị từ xác suất'],
          prerequisites: [],
          estimatedTime: '1-2 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      // ========== CHI TIẾT CHO P3-ALG (Đại số nâng cao) ==========
      // Level 2: Nodes chi tiết của P3-ALG (y = 600)
      {
        id: 'P3-ALG-PARTIAL',
        position: { x: 100, y: 600 },
        data: {
          label: 'Phân thức đại số',
          category: 'intermediate',
          description: 'Partial Fractions',
          concepts: [
            'Tách phân thức',
            'Dạng A/(x-a) + B/(x-b)',
            'Dạng với bậc cao hơn'
          ],
          examples: ['Tách 1/((x-1)(x+2))', 'Tách phân thức phức tạp'],
          prerequisites: [],
          estimatedTime: '1-2 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P3-ALG-LOG',
        position: { x: 300, y: 600 },
        data: {
          label: 'Hàm mũ và Logarit',
          category: 'intermediate',
          description: 'ln x, e^x và các tính chất',
          concepts: [
            'Định nghĩa ln x',
            'Tính chất logarit',
            'Phương trình logarit'
          ],
          examples: ['Giải ln(x) = 2', 'Giải e^(2x) + 3e^x - 4 = 0'],
          prerequisites: [],
          estimatedTime: '1-2 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      // ========== CHI TIẾT CHO P3-TRIG (Lượng giác nâng cao) ==========
      // Level 2: Nodes chi tiết của P3-TRIG (y = 600)
      {
        id: 'P3-TRIG-SEC',
        position: { x: 500, y: 600 },
        data: {
          label: 'Hàm sec, cosec, cot',
          category: 'advanced',
          description: 'Các hàm lượng giác nghịch đảo',
          concepts: [
            'sec x = 1/cos x',
            'cosec x = 1/sin x',
            'cot x = 1/tan x',
            'Đồ thị'
          ],
          examples: ['Vẽ đồ thị y = sec(x)', 'Giải phương trình sec²x = 4'],
          prerequisites: [],
          estimatedTime: '1 tuần',
          difficulty: 'Nâng cao',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P3-TRIG-COMPOUND',
        position: { x: 700, y: 600 },
        data: {
          label: 'Công thức cộng',
          category: 'advanced',
          description: 'Compound angle formulas',
          concepts: ['sin(a±b)', 'cos(a±b)', 'tan(a±b)', 'Ứng dụng'],
          examples: ['Tính sin(75°)', 'Chứng minh công thức'],
          prerequisites: [],
          estimatedTime: '1-2 tuần',
          difficulty: 'Nâng cao',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P3-TRIG-RFORM',
        position: { x: 900, y: 600 },
        data: {
          label: 'Dạng Rcos(x-a)',
          category: 'advanced',
          description: 'Biến đổi asinx + bcosx',
          concepts: ['R = √(a² + b²)', 'tan α = b/a', 'Ứng dụng'],
          examples: ['Biến đổi 3sin(x) + 4cos(x)', 'Tìm giá trị lớn nhất'],
          prerequisites: [],
          estimatedTime: '1 tuần',
          difficulty: 'Nâng cao',
          status: 'available',
          resources: []
        }
      },
      // ========== CHI TIẾT CHO P3-COMPLEX (Số phức) ==========
      // Level 2: Nodes chi tiết của P3-COMPLEX (y = 600)
      {
        id: 'P3-COMPLEX-BASIC',
        position: { x: 1700, y: 600 },
        data: {
          label: 'Số phức cơ bản',
          category: 'intermediate',
          description: 'Định nghĩa và các phép toán',
          concepts: ['Định nghĩa i² = -1', 'Dạng a + bi', 'Cộng trừ nhân chia'],
          examples: ['Tính (3 + 4i) + (2 - i)', 'Tính (3 + 4i)(2 - i)'],
          prerequisites: [],
          estimatedTime: '1 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P3-COMPLEX-POLAR',
        position: { x: 1900, y: 600 },
        data: {
          label: 'Dạng lượng giác số phức',
          category: 'advanced',
          description: 'Polar form và De Moivre',
          concepts: [
            'r(cos θ + i sin θ)',
            'Modun và argument',
            'Công thức De Moivre'
          ],
          examples: ['Tìm modun và argument', 'Tính (1+i)^10'],
          prerequisites: [],
          estimatedTime: '1-2 tuần',
          difficulty: 'Nâng cao',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P3-COMPLEX-LOCUS',
        position: { x: 2100, y: 600 },
        data: {
          label: 'Biểu diễn hình học',
          category: 'advanced',
          description: 'Locus và tập hợp điểm',
          concepts: ['|z - a| = r', 'arg(z - a) = θ', 'Tập hợp điểm'],
          examples: [
            'Tìm tập hợp |z - 3| = |z + i|',
            'Vẽ locus trên mặt phẳng Argand'
          ],
          prerequisites: [],
          estimatedTime: '1 tuần',
          difficulty: 'Nâng cao',
          status: 'available',
          resources: []
        }
      },
      // ========== CHI TIẾT CHO P3-DIFFEQ (Phương trình vi phân) ==========
      // Level 2: Nodes chi tiết của P3-DIFFEQ (y = 600)
      {
        id: 'P3-DIFFEQ-SEPARABLE',
        position: { x: 2100, y: 600 },
        data: {
          label: 'Tách biến',
          category: 'advanced',
          description: 'Separable variables method',
          concepts: ['dy/dx = f(x)g(y)', 'Tách biến và tích phân', 'Ứng dụng'],
          examples: ['Giải dy/dx = y(x+1)', 'Giải dy/dx = xy'],
          prerequisites: [],
          estimatedTime: '1 tuần',
          difficulty: 'Nâng cao',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P3-DIFFEQ-APPLY',
        position: { x: 2300, y: 600 },
        data: {
          label: 'Ứng dụng phương trình vi phân',
          category: 'practical',
          description: 'Mô hình thực tế',
          concepts: [
            'Mô hình tăng trưởng',
            'Mô hình làm nguội',
            'Mô hình dân số'
          ],
          examples: ['Mô hình làm nguội Newton', 'Mô hình tăng trưởng dân số'],
          prerequisites: [],
          estimatedTime: '1 tuần',
          difficulty: 'Nâng cao',
          status: 'available',
          resources: []
        }
      },
      // ========== CHI TIẾT CHO P3-NUM (Phương pháp số) ==========
      // Level 2: Nodes chi tiết của P3-NUM (y = 600)
      {
        id: 'P3-NUM-ITERATION',
        position: { x: 2500, y: 600 },
        data: {
          label: 'Phép lặp',
          category: 'intermediate',
          description: 'Iteration method',
          concepts: ['x_n+1 = f(x_n)', 'Sự hội tụ', 'Điều kiện hội tụ'],
          examples: ['Tìm nghiệm của x = cos(x)', 'Kiểm tra sự hội tụ'],
          prerequisites: [],
          estimatedTime: '1 tuần',
          difficulty: 'Trung bình',
          status: 'available',
          resources: []
        }
      },
      // ========== CHI TIẾT CHO P3-VEC (Vectors 3D) ==========
      // Level 2: Nodes chi tiết của P3-VEC (y = 600)
      {
        id: 'P3-VEC-LINE',
        position: { x: 2900, y: 600 },
        data: {
          label: 'Phương trình đường thẳng 3D',
          category: 'advanced',
          description: 'Vector form và parametric form',
          concepts: ['r = a + λb', 'Parametric equations', 'Giao điểm'],
          examples: [
            'Viết phương trình đường thẳng',
            'Tìm giao điểm 2 đường thẳng'
          ],
          prerequisites: [],
          estimatedTime: '1-2 tuần',
          difficulty: 'Nâng cao',
          status: 'available',
          resources: []
        }
      },
      {
        id: 'P3-VEC-PLANE',
        position: { x: 3100, y: 600 },
        data: {
          label: 'Phương trình mặt phẳng',
          category: 'advanced',
          description: 'Plane equations và vector normal',
          concepts: ['r.n = d', 'Phương trình tổng quát', 'Khoảng cách'],
          examples: [
            'Viết phương trình mặt phẳng',
            'Tìm khoảng cách từ điểm đến mặt phẳng'
          ],
          prerequisites: [],
          estimatedTime: '1-2 tuần',
          difficulty: 'Nâng cao',
          status: 'available',
          resources: []
        }
      }
    ],
    edges: [
      // Ràng buộc cơ bản P1
      {
        id: 'e1',
        source: 'P1-QUAD',
        target: 'P1-FUNC',
        type: 'prerequisite_for'
      },
      {
        id: 'e2',
        source: 'P1-FUNC',
        target: 'P1-DIFF',
        type: 'prerequisite_for'
      },
      { id: 'e3', source: 'P1-COORD', target: 'P1-DIFF', type: 'related_to' },
      {
        id: 'e4',
        source: 'P1-DIFF',
        target: 'P1-INT',
        type: 'prerequisite_for'
      },
      // Nodes chi tiết cho P1-QUAD
      {
        id: 'e-quad-concept',
        source: 'P1-QUAD-CONCEPT',
        target: 'P1-QUAD',
        type: 'concept_of'
      },
      {
        id: 'e-quad-complete',
        source: 'P1-QUAD-COMPLETE',
        target: 'P1-QUAD',
        type: 'part_of'
      },
      {
        id: 'e-quad-concept-complete',
        source: 'P1-QUAD-CONCEPT',
        target: 'P1-QUAD-COMPLETE',
        type: 'prerequisite_for'
      },
      // Nodes chi tiết cho P1-FUNC
      {
        id: 'e-func-concept',
        source: 'P1-FUNC-CONCEPT',
        target: 'P1-FUNC',
        type: 'concept_of'
      },
      {
        id: 'e-func-inverse',
        source: 'P1-FUNC-INVERSE',
        target: 'P1-FUNC',
        type: 'part_of'
      },
      {
        id: 'e-func-concept-inverse',
        source: 'P1-FUNC-CONCEPT',
        target: 'P1-FUNC-INVERSE',
        type: 'prerequisite_for'
      },
      // Ràng buộc liên môn
      { id: 'e5', source: 'P1-DIFF', target: 'M1-KIN', type: 'related_to' },
      { id: 'e6', source: 'P1-INT', target: 'M1-KIN', type: 'related_to' },
      { id: 'e7', source: 'P1-TRIG', target: 'M1-DYN', type: 'related_to' },
      {
        id: 'e8',
        source: 'S1-PROB',
        target: 'S1-DIST',
        type: 'prerequisite_for'
      },
      // Ràng buộc nâng cao P1 lên P3
      {
        id: 'e9',
        source: 'P1-TRIG',
        target: 'P3-TRIG',
        type: 'prerequisite_for'
      },
      { id: 'e10', source: 'P1-FUNC', target: 'P3-ALG', type: 'foundation_of' },
      {
        id: 'e11',
        source: 'P1-DIFF',
        target: 'P3-DIFF',
        type: 'prerequisite_for'
      },
      {
        id: 'e12',
        source: 'P1-INT',
        target: 'P3-INT',
        type: 'prerequisite_for'
      },
      // Ràng buộc nội bộ P3
      { id: 'e13', source: 'P3-ALG', target: 'P3-INT', type: 'required' },
      { id: 'e14', source: 'P3-ALG', target: 'P3-DIFF', type: 'required' },
      { id: 'e15', source: 'P3-TRIG', target: 'P3-DIFF', type: 'related_to' },
      { id: 'e16', source: 'P3-DIFF', target: 'P3-NUM', type: 'related_to' },
      {
        id: 'e17',
        source: 'P3-INT',
        target: 'P3-DIFFEQ',
        type: 'prerequisite_for'
      },
      {
        id: 'e18',
        source: 'P3-TRIG',
        target: 'P3-COMPLEX',
        type: 'related_to'
      },
      // Edges cho nodes chi tiết P1-DIFF
      {
        id: 'e-diff-concept',
        source: 'P1-DIFF-CONCEPT',
        target: 'P1-DIFF',
        type: 'concept_of'
      },
      {
        id: 'e-diff-rules',
        source: 'P1-DIFF-RULES',
        target: 'P1-DIFF',
        type: 'part_of'
      },
      {
        id: 'e-diff-apply',
        source: 'P1-DIFF-APPLY',
        target: 'P1-DIFF',
        type: 'application_of'
      },
      {
        id: 'e-diff-concept-rules',
        source: 'P1-DIFF-CONCEPT',
        target: 'P1-DIFF-RULES',
        type: 'prerequisite_for'
      },
      {
        id: 'e-diff-rules-apply',
        source: 'P1-DIFF-RULES',
        target: 'P1-DIFF-APPLY',
        type: 'required'
      },
      // Edges cho nodes chi tiết P1-INT
      {
        id: 'e-int-concept',
        source: 'P1-INT-CONCEPT',
        target: 'P1-INT',
        type: 'concept_of'
      },
      {
        id: 'e-int-basic',
        source: 'P1-INT-BASIC',
        target: 'P1-INT',
        type: 'part_of'
      },
      {
        id: 'e-int-area',
        source: 'P1-INT-AREA',
        target: 'P1-INT',
        type: 'application_of'
      },
      {
        id: 'e-int-concept-basic',
        source: 'P1-INT-CONCEPT',
        target: 'P1-INT-BASIC',
        type: 'prerequisite_for'
      },
      {
        id: 'e-int-basic-area',
        source: 'P1-INT-BASIC',
        target: 'P1-INT-AREA',
        type: 'required'
      },
      // Edges cho nodes chi tiết P3-DIFF
      {
        id: 'e-p3-diff-product',
        source: 'P3-DIFF-PRODUCT',
        target: 'P3-DIFF',
        type: 'part_of'
      },
      {
        id: 'e-p3-diff-implicit',
        source: 'P3-DIFF-IMPLICIT',
        target: 'P3-DIFF',
        type: 'part_of'
      },
      {
        id: 'e-p3-diff-parametric',
        source: 'P3-DIFF-PARAMETRIC',
        target: 'P3-DIFF',
        type: 'part_of'
      },
      {
        id: 'e-p3-diff-product-implicit',
        source: 'P3-DIFF-PRODUCT',
        target: 'P3-DIFF-IMPLICIT',
        type: 'related_to'
      },
      // Edges cho nodes chi tiết P3-INT
      {
        id: 'e-p3-int-parts',
        source: 'P3-INT-PARTS',
        target: 'P3-INT',
        type: 'part_of'
      },
      {
        id: 'e-p3-int-substitution',
        source: 'P3-INT-SUBSTITUTION',
        target: 'P3-INT',
        type: 'part_of'
      },
      {
        id: 'e-p3-int-partial',
        source: 'P3-INT-PARTIAL',
        target: 'P3-INT',
        type: 'part_of'
      },
      {
        id: 'e-p3-int-parts-sub',
        source: 'P3-INT-PARTS',
        target: 'P3-INT-SUBSTITUTION',
        type: 'related_to'
      },
      {
        id: 'e-p3-int-sub-partial',
        source: 'P3-INT-SUBSTITUTION',
        target: 'P3-INT-PARTIAL',
        type: 'required'
      },
      // Liên kết giữa P1 và P3
      {
        id: 'e-p1-diff-p3-diff',
        source: 'P1-DIFF',
        target: 'P3-DIFF',
        type: 'foundation_of'
      },
      {
        id: 'e-p1-int-p3-int',
        source: 'P1-INT',
        target: 'P3-INT',
        type: 'foundation_of'
      },
      {
        id: 'e-p1-diff-rules-p3-product',
        source: 'P1-DIFF-RULES',
        target: 'P3-DIFF-PRODUCT',
        type: 'prerequisite_for'
      },
      {
        id: 'e-p1-int-basic-p3-parts',
        source: 'P1-INT-BASIC',
        target: 'P3-INT-PARTS',
        type: 'prerequisite_for'
      },
      // Edges cho nodes chi tiết P1-COORD
      {
        id: 'e-coord-line',
        source: 'P1-COORD-LINE',
        target: 'P1-COORD',
        type: 'part_of'
      },
      {
        id: 'e-coord-circle',
        source: 'P1-COORD-CIRCLE',
        target: 'P1-COORD',
        type: 'part_of'
      },
      {
        id: 'e-coord-line-circle',
        source: 'P1-COORD-LINE',
        target: 'P1-COORD-CIRCLE',
        type: 'related_to'
      },
      // Edges cho nodes chi tiết P1-TRIG
      {
        id: 'e-trig-circle',
        source: 'P1-TRIG-CIRCLE',
        target: 'P1-TRIG',
        type: 'concept_of'
      },
      {
        id: 'e-trig-graph',
        source: 'P1-TRIG-GRAPH',
        target: 'P1-TRIG',
        type: 'part_of'
      },
      {
        id: 'e-trig-equation',
        source: 'P1-TRIG-EQUATION',
        target: 'P1-TRIG',
        type: 'application_of'
      },
      {
        id: 'e-trig-circle-graph',
        source: 'P1-TRIG-CIRCLE',
        target: 'P1-TRIG-GRAPH',
        type: 'prerequisite_for'
      },
      {
        id: 'e-trig-graph-equation',
        source: 'P1-TRIG-GRAPH',
        target: 'P1-TRIG-EQUATION',
        type: 'required'
      },
      // Edges cho nodes chi tiết M1-KIN
      {
        id: 'e-kin-suvat',
        source: 'M1-KIN-SUVAT',
        target: 'M1-KIN',
        type: 'part_of'
      },
      {
        id: 'e-kin-graph',
        source: 'M1-KIN-GRAPH',
        target: 'M1-KIN',
        type: 'part_of'
      },
      {
        id: 'e-kin-suvat-graph',
        source: 'M1-KIN-SUVAT',
        target: 'M1-KIN-GRAPH',
        type: 'related_to'
      },
      // Edges cho nodes chi tiết M1-DYN
      {
        id: 'e-dyn-newton',
        source: 'M1-DYN-NEWTON',
        target: 'M1-DYN',
        type: 'concept_of'
      },
      {
        id: 'e-dyn-friction',
        source: 'M1-DYN-FRICTION',
        target: 'M1-DYN',
        type: 'part_of'
      },
      {
        id: 'e-dyn-newton-friction',
        source: 'M1-DYN-NEWTON',
        target: 'M1-DYN-FRICTION',
        type: 'required'
      },
      // Edges cho nodes chi tiết S1-DATA
      {
        id: 'e-data-graph',
        source: 'S1-DATA-GRAPH',
        target: 'S1-DATA',
        type: 'part_of'
      },
      {
        id: 'e-data-stats',
        source: 'S1-DATA-STATS',
        target: 'S1-DATA',
        type: 'part_of'
      },
      {
        id: 'e-data-graph-stats',
        source: 'S1-DATA-GRAPH',
        target: 'S1-DATA-STATS',
        type: 'related_to'
      },
      // Edges cho nodes chi tiết S1-PROB
      {
        id: 'e-prob-perm',
        source: 'S1-PROB-PERM',
        target: 'S1-PROB',
        type: 'part_of'
      },
      {
        id: 'e-prob-comb',
        source: 'S1-PROB-COMB',
        target: 'S1-PROB',
        type: 'part_of'
      },
      {
        id: 'e-prob-basic',
        source: 'S1-PROB-BASIC',
        target: 'S1-PROB',
        type: 'concept_of'
      },
      {
        id: 'e-prob-basic-perm',
        source: 'S1-PROB-BASIC',
        target: 'S1-PROB-PERM',
        type: 'prerequisite_for'
      },
      {
        id: 'e-prob-perm-comb',
        source: 'S1-PROB-PERM',
        target: 'S1-PROB-COMB',
        type: 'related_to'
      },
      // Edges cho nodes chi tiết S1-DIST
      {
        id: 'e-dist-binomial',
        source: 'S1-DIST-BINOMIAL',
        target: 'S1-DIST',
        type: 'part_of'
      },
      {
        id: 'e-dist-normal',
        source: 'S1-DIST-NORMAL',
        target: 'S1-DIST',
        type: 'part_of'
      },
      {
        id: 'e-dist-binomial-normal',
        source: 'S1-DIST-BINOMIAL',
        target: 'S1-DIST-NORMAL',
        type: 'related_to'
      },
      // Edges cho nodes chi tiết P3-ALG
      {
        id: 'e-p3-alg-partial',
        source: 'P3-ALG-PARTIAL',
        target: 'P3-ALG',
        type: 'part_of'
      },
      {
        id: 'e-p3-alg-log',
        source: 'P3-ALG-LOG',
        target: 'P3-ALG',
        type: 'part_of'
      },
      {
        id: 'e-p3-alg-partial-log',
        source: 'P3-ALG-PARTIAL',
        target: 'P3-ALG-LOG',
        type: 'related_to'
      },
      // Edges cho nodes chi tiết P3-TRIG
      {
        id: 'e-p3-trig-sec',
        source: 'P3-TRIG-SEC',
        target: 'P3-TRIG',
        type: 'part_of'
      },
      {
        id: 'e-p3-trig-compound',
        source: 'P3-TRIG-COMPOUND',
        target: 'P3-TRIG',
        type: 'part_of'
      },
      {
        id: 'e-p3-trig-rform',
        source: 'P3-TRIG-RFORM',
        target: 'P3-TRIG',
        type: 'part_of'
      },
      {
        id: 'e-p3-trig-sec-compound',
        source: 'P3-TRIG-SEC',
        target: 'P3-TRIG-COMPOUND',
        type: 'prerequisite_for'
      },
      {
        id: 'e-p3-trig-compound-rform',
        source: 'P3-TRIG-COMPOUND',
        target: 'P3-TRIG-RFORM',
        type: 'required'
      },
      // Edges cho nodes chi tiết P3-COMPLEX
      {
        id: 'e-complex-basic',
        source: 'P3-COMPLEX-BASIC',
        target: 'P3-COMPLEX',
        type: 'concept_of'
      },
      {
        id: 'e-complex-polar',
        source: 'P3-COMPLEX-POLAR',
        target: 'P3-COMPLEX',
        type: 'part_of'
      },
      {
        id: 'e-complex-locus',
        source: 'P3-COMPLEX-LOCUS',
        target: 'P3-COMPLEX',
        type: 'application_of'
      },
      {
        id: 'e-complex-basic-polar',
        source: 'P3-COMPLEX-BASIC',
        target: 'P3-COMPLEX-POLAR',
        type: 'prerequisite_for'
      },
      {
        id: 'e-complex-polar-locus',
        source: 'P3-COMPLEX-POLAR',
        target: 'P3-COMPLEX-LOCUS',
        type: 'required'
      },
      // Edges cho nodes chi tiết P3-DIFFEQ
      {
        id: 'e-diffeq-separable',
        source: 'P3-DIFFEQ-SEPARABLE',
        target: 'P3-DIFFEQ',
        type: 'part_of'
      },
      {
        id: 'e-diffeq-apply',
        source: 'P3-DIFFEQ-APPLY',
        target: 'P3-DIFFEQ',
        type: 'application_of'
      },
      {
        id: 'e-diffeq-separable-apply',
        source: 'P3-DIFFEQ-SEPARABLE',
        target: 'P3-DIFFEQ-APPLY',
        type: 'required'
      },
      // Edges cho nodes chi tiết P3-NUM
      {
        id: 'e-num-iteration',
        source: 'P3-NUM-ITERATION',
        target: 'P3-NUM',
        type: 'part_of'
      },
      // Edges cho nodes chi tiết P3-VEC
      {
        id: 'e-vec-line',
        source: 'P3-VEC-LINE',
        target: 'P3-VEC',
        type: 'part_of'
      },
      {
        id: 'e-vec-plane',
        source: 'P3-VEC-PLANE',
        target: 'P3-VEC',
        type: 'part_of'
      },
      {
        id: 'e-vec-line-plane',
        source: 'P3-VEC-LINE',
        target: 'P3-VEC-PLANE',
        type: 'prerequisite_for'
      },
      // Liên kết giữa các nodes chi tiết
      {
        id: 'e-p1-trig-circle-p3-trig-sec',
        source: 'P1-TRIG-CIRCLE',
        target: 'P3-TRIG-SEC',
        type: 'foundation_of'
      },
      {
        id: 'e-p1-trig-equation-p3-trig-compound',
        source: 'P1-TRIG-EQUATION',
        target: 'P3-TRIG-COMPOUND',
        type: 'prerequisite_for'
      },
      {
        id: 'e-p1-diff-concept-p3-diff-product',
        source: 'P1-DIFF-CONCEPT',
        target: 'P3-DIFF-PRODUCT',
        type: 'foundation_of'
      },
      {
        id: 'e-p1-int-concept-p3-int-parts',
        source: 'P1-INT-CONCEPT',
        target: 'P3-INT-PARTS',
        type: 'foundation_of'
      },
      {
        id: 'e-s1-prob-basic-s1-dist-binomial',
        source: 'S1-PROB-BASIC',
        target: 'S1-DIST-BINOMIAL',
        type: 'prerequisite_for'
      }
    ]
  };
};
