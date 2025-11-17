// Hàm trích xuất ID Lemyde từ mã code
function extractLemydeIdFromCode(code: string | null | undefined, prefix: string): number | null {
  if (!code || typeof code !== 'string') return null;
  
  // Loại bỏ prefix và các số 0 phía trước
  const cleanedCode = code.replace(new RegExp(`^${prefix}`), '').replace(/^0+/, '');
  
  // Nếu sau khi loại bỏ prefix và số 0 mà chuỗi rỗng, trả về 0
  if (cleanedCode === '') return 0;
  
  const id = parseInt(cleanedCode, 10);
  return isNaN(id) ? null : id;
}

// Test cases cho product codes
const productTestCases = [
  { code: 'MY009521', expected: 9521 },
  { code: 'MY001234', expected: 1234 },
  { code: 'MY000001', expected: 1 },
  { code: 'MY100000', expected: 100000 },
  { code: 'MY123', expected: 123 },
  { code: 'MY0', expected: 0 },
  { code: 'MY', expected: null },
  { code: 'INVALID', expected: null },
  { code: '', expected: null },
  { code: null, expected: null }
];

// Test cases cho customer codes
const customerTestCases = [
  { code: 'LY009521', expected: 9521 },
  { code: 'LY001234', expected: 1234 },
  { code: 'LY000001', expected: 1 },
  { code: 'LY100000', expected: 100000 },
  { code: 'LY123', expected: 123 },
  { code: 'LY0', expected: 0 },
  { code: 'LY', expected: null },
  { code: 'INVALID', expected: null },
  { code: '', expected: null },
  { code: null, expected: null }
];

console.log('🧪 Testing product code extraction:');
productTestCases.forEach((testCase, index) => {
  const result = extractLemydeIdFromCode(testCase.code, 'MY');
  const status = result === testCase.expected ? '✅' : '❌';
  console.log(`${index + 1}. ${testCase.code} -> ${result} (expected: ${testCase.expected}) ${status}`);
});

console.log('\n🧪 Testing customer code extraction:');
customerTestCases.forEach((testCase, index) => {
  const result = extractLemydeIdFromCode(testCase.code, 'LY');
  const status = result === testCase.expected ? '✅' : '❌';
  console.log(`${index + 1}. ${testCase.code} -> ${result} (expected: ${testCase.expected}) ${status}`);
});

// Test với các prefix khác
console.log('\n🧪 Testing with different prefixes:');
const customTestCases = [
  { code: 'ABC001', prefix: 'ABC', expected: 1 },
  { code: 'TEST000123', prefix: 'TEST', expected: 123 },
  { code: 'XYZ0', prefix: 'XYZ', expected: 0 }
];

customTestCases.forEach((testCase, index) => {
  const result = extractLemydeIdFromCode(testCase.code, testCase.prefix);
  const status = result === testCase.expected ? '✅' : '❌';
  console.log(`${index + 1}. ${testCase.code} (prefix: ${testCase.prefix}) -> ${result} (expected: ${testCase.expected}) ${status}`);
});