CÔNG TY TNHH CITIGO 
Chi nhánh Tp.Hồ Chí Minh: 
Trụ sở Hà Nội: 
Tầng 5, Toà nhà HTP, 434 Trần Khát Chân, Hai 
Bà Trưng 
Tel: 04 628 00 488         
Email: sale@citigo.net  
Fax: 04 628 00 191 
Lầu 6 – Khu B, Tòa nhà WASECO, Số 10 Phổ Quang, 
Phường 2, Q.Tân Bình 
Tel: 04 628 00 488         
Fax: 04 628 00 191 
Email: support@kiotviet.com  
TÀI LIỆU HƯỚNG DẪN SỬ DỤNG PUBLIC API 
Phiên bản: 1.4 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  2/81 
 
Table of Contents 
1. GIỚI THIỆU .......................................................................................................... 7 
2. CHỨC NĂNG ....................................................................................................... 8 
2.1. Authenticate .................................................................................................... 8 
2.2. Lấy thông tin Access Token ........................................................................... 9 
2.3. Nhóm hàng .....................................................................................................10 
2.3.1. Lấy danh sách nhóm hàng ......................................................................10 
2.3.2. Lấy chi tiêt nhóm hàng ............................................................................12 
2.3.3. Thêm mới nhóm hàng..............................................................................13 
2.3.4. Cập nhật nhóm hàng ...............................................................................14 
2.3.5. Xóa nhóm hàng ........................................................................................15 
2.4. Hàng hóa .........................................................................................................15 
2.4.1. Lấy danh sách hàng hóa .........................................................................15 
2.4.2. Lấy chi tiết hàng hóa ...............................................................................18 
2.4.3. Thêm mới hàng hóa .................................................................................21 
2.4.4. Cập nhật hàng hóa ...................................................................................24 
2.4.5. Xóa hàng hóa ...........................................................................................26 
2.5. Đặt hàng ..........................................................................................................27 
2.5.1. Lấy danh sách đặt hàng ..........................................................................27 
2.5.2. Lấy chi tiết đặt hàng ................................................................................31 
2.5.3. Thêm mới đặt hàng ..................................................................................34 
2.5.4. Cập nhật đặt hàng ....................................................................................38 
2.5.5. Xóa đặt hàng ............................................................................................43 
2.6. Khách hàng .....................................................................................................43 
2.6.1. Lấy danh sách khách hàng .....................................................................43 
2.6.2. Lấy chi tiết khách hàng............................................................................45 
2.6.3. Thêm mới khách hàng .............................................................................46 
2.6.4. Cập nhật khách hàng ...............................................................................48 
2.6.5. Xóa khách hàng .......................................................................................50 
2.7. Lấy danh sách chi nhánh ...............................................................................50 
2.8. Lấy danh sách người dùng ...........................................................................51 
2.9. Lấy danh sách tài khoản ngân hàng .............................................................53 
2.10. Lấy danh sách thu khác .............................................................................54 
2.11. Webhook .....................................................................................................55 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  3/81 
 
2.11.1. Đăng ký Webhook ..................................................................................55 
2.11.2. Huỷ đăng ký Webhook ...........................................................................56 
2.11.3. Khách hàng ............................................................................................56 
2.11.4. Hàng hóa ................................................................................................58 
2.11.5. Tồn kho ...................................................................................................60 
2.11.6. Đặt hàng .................................................................................................61 
2.11.7. Hóa đơn ..................................................................................................62 
2.12. Hóa đơn .......................................................................................................65 
2.12.1. Lấy danh sách hóa đơn .........................................................................66 
2.12.2. Lấy chi tiết hóa đơn ...............................................................................69 
2.12.3. Thêm mới hóa đơn.................................................................................73 
2.12.4. Cập nhật hóa đơn ..................................................................................76 
2.12.5. Xóa hóa đơn ...........................................................................................80 
2.13. Nhóm khách hàng .......................................................................................80 
2.13.1. Lấy danh sách nhóm khách hàng .........................................................80 
 
 
  
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  4/81 
 
Revision History 
Ngày Version Nội dung thay đổi 
16/02/2017 1.0 Tạo phiên bản đầu tiên 
21/06/2017 1.1 
Cập nhật: - Mục 2. Chức năng, cập nhật “Authorization”: Bearer {Mã Access 
Token} trong header của các request. - Mục 2.4.3. Thêm mới hàng hóa, trong Reqest: 
 Xóa "fullName", "categoryName", "basePrice", "weight", 
"images" 
 Thêm "masterUnitId", "conversionValue"  
 Xóa  "productId",  "productCode", "productName" trong 
"inventories[]" - Mục 2.4.4. Cập nhật hàng hóa, trong Request: 
 Thêm "branchId",  
 Xóa trường "fullName", "categoryName" 
 Xóa  "productId",  "productCode", "productName" trong 
"inventories[]" - Mục 2.5.3. Thêm mới đặt hàng, trong Request: 
 Thêm "totalPayment", "accountId", "makeInvoice" 
 Thêm "locationId", partnerDeliveryId" trong "orderDelivery[]" 
 Xóa "payments[]" - Mục 2.5.4.Cập nhật đơn đặt hàng, trong Request: 
 Thêm "totalPayment", "accountId", "makeInvoice" 
 Xóa "payments[]" 
31/07/2017 1.2 
Thêm: - Thêm Mục 2.12 cung cấp các API cho hóa đơn. 
Cập nhật: - Mục 2.5.1. Lấy danh sách đặt hàng: 
 Thêm tham số “customerCode", "toDate"  
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  5/81 
 
 Thêm "customerCode”, “createdDate” trong response - Mục 2.5.2. Lấy chi tiết đặt hàng: 
 Thêm “createdDate” trong response - Mục 2.11.6. Đặt hàng và 2.11.7. Hóa đơn 
 Thêm “customerCode” 
06/04/2018 1.3 
Thêm: - Thêm Mục 2.13 cung cấp các API cho nhóm khách hàng. 
Cập nhật: - Mục 2.6.1. Lấy danh sách khách hàng: 
 Thêm tham số “includeCustomerGroup " trong request 
 Thêm tham số “groups” trong response - Mục 2.6.2. Lấy chi tiết khách hàng 
 Thêm tham số “groups” trong response - Mục 2.6.3. Thêm mới khách hàng 
 Thêm tham số “groupIds” trong request 
 Thêm tham số “customerGroupDetails” trong response - Mục 2.6.4. Cập nhật khách hàng 
 Thêm tham số “groupIds” trong request 
 Thêm tham số “groups” trong response 
 
18/04/2018 1.4 
Cập nhật: - Mục 2.4.2. Lấy chi tiết hàng hóa: 
 Thêm API lấy chi tiết theo Code 
 Thêm tham số “code” trong request - Mục 2.5.2. Lấy chi tiết đặt hàng 
 Thêm API lấy chi tiết theo Code 
 Thêm tham số “code” trong request - Mục 2.6.2. Lấy chi tiết khách hàng 
 Thêm API lấy chi tiết theo Code 
 Thêm tham số “code” trong request 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     
Phiên bản 1.4 - - 
Mục 2.12.1. Lấy danh sách hóa đơn 
 Thêm tham số “orderId” trong request 
Mục 2.12.2. Lấy chi tiết hóa đơn 
 Thêm API lấy chi tiết theo Code 
 Thêm tham số “code” trong request - 
Mục 2.11.1. Đăng ký webhook 
 Thêm lưu ý “(thêm "?noecho" sau link địa chỉ đăng ký)” trong 
“Url” 
Công ty TNHH Citigo  
6/81 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     
Phiên bản 1.4 
1. GIỚI THIỆU 
KiotViet Public API được phát triển để hỗ trợ việc tích hợp và trao đổi dữ liệu giữa KiotViet và các nền 
tảng website, thương mại điện tử, CRM… 
KiotViet Public API cung cấp cơ chế đọc và ghi các đối tượng sau: 
 Nhóm hàng: lấy danh sách nhóm hàng hóa với các thông tin về tên nhóm hàng và quan hệ giữa 
các nhóm hàng (2.3) 
 Hàng hóa: lấy thông tin sản phẩm, tạo mới, sửa, xóa sản phẩm (2.4) 
 Đặt hàng: lấy thông tin đơn hàng, tạo đơn hàng, cập nhật và hủy đơn hàng (2.5) 
 Hóa đơn: lấy thông tin hóa đơn, tạo hóa đơn, cập nhật và hủy hóa đơn (2.12) 
 Khách hàng: lấy danh sách khách hàng và thao tác trên thông tin khách hàng (2.6) 
 Các API phụ trợ - - - - - - - 
Danh sách chi nhánh (2.7) 
Danh sách người dùng (2.8) 
Danh sách tài khoản ngân hàng (2.9) 
Danh sách thu khác (2.10) 
Webhook (2.11) 
Hóa đơn (2.12) 
Nhóm khách hàng (2.13) 
Công ty TNHH Citigo  
7/81 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     
Phiên bản 1.4 
2. CHỨC NĂNG 
Mục này mô tả thông tin chi tiết của từng API. Các thông tin bao gồm: 
 Tên API 
 Mục đích sử dụng của API 
 Cấu trúc của API 
 Chi tiết tham số trong request 
 Nội dung response trả về 
Chú ý: Ngoại trừ API lấy thông tin Authentication Code và Access Token, toàn bộ các API khác đều có 
header trong request với thông tin:  
 “Retailer”: tên cửa hàng 
 “Authorization”: Bearer {Mã Access Token} 
Ví dụ:  
Retailer: taphoa 
Authorization: Bearer 
eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkExMjhDQkMtSFMyNTYiLCJraWQiOiJzQngifQ.h9rN-fArDF
aL0fkpnagyp6QD8Bt8shBdvaqciahnrVimtKnV8mSlK2LvClw5CoXbm312jCBXN8Gmn7bUxGzP78gFSOrGQF
 B5rlYvisDwpcr3R4aC6IeVsCEoEHnrGvz0_v3fv7mI7YhWCQvcea62Wn5bMtSabTKpj_J9VdKjUwe4VPp3UYp
 QoLN8HreL2gmq9BqQC2QBIO25Mk3yPeaJaXTueFXKjYR-0f0qSsnw1lEMPRp8ECfq3w0N3CYmc
lg2zvqYFLBmQqdxlnwjE__6ebRDtXp_qNKy7LmgLaR3LzKIzUHDdFN4fUQ23hZX5HmQ_9xNcEH_Otg1EBZ5
 T2Xg.vToCTB4ZmAHWUEjVRg5C0A.Z8UK_2Y
dEZeZNNO5drADRbZkrkpLG3FaLMFnPFhAc6iEKiMBorOgdm5uZI4FzMGvbfBUuVU5AlbOr0MxSickdhwIdi1
 H9pSytHzqAuC2qr_1kvlGkYmr6gz9WAsTWMnPhFQ8DMV5jhNKxYod8zzXUuILdi7eHC2mxAygN_fMa04yo
 FfEp3742of57LLgAqkKKY0ADK_LzJGmkcBbe2x4w.sEiuD4cqFqj9Wj9kOZ31gSjq6REOpMUj3hBYBojekzw 
2.1. Authenticate 
Kiotviet API xác thực dựa trên cơ chế xác thực OAuth 2.0, để kết nối được hệ thống cần có 2 thông tin: 
ClientId và Mã bảo mật. Thông tin này được truy cập vào “Thiết lập cửa hàng” bằng tài khoản admin => 
Chọn Thiết lập kết nối API 
Công ty TNHH Citigo  
8/81 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     
Phiên bản 1.4 
Trong trường hợp không thể lấy được thông tin trên vui lòng liên hệ với bộ phận CSKH để được hỗ trợ. 
Sau khi có được thông tin ClientId và Mã bảo mật (client_secret). Có thể sử dụng các thư viện theo từng 
ngôn ngữ để lấy thông tin Access Token, ví dụ: 
+ Với C#: https://www.nuget.org/packages/OAuth2Client/ 
+ Với PHP: https://github.com/thephpleague/oauth2-client 
Thông tin endpoint authenticate như sau: - - 
Authorization Endpoint: http://id.kiotviet.vn/connect/authorize 
Token Endpoint: http://id.kiotviet.vn/connect/token  
Hoặc có thể call API bên dưới (2.2) 
2.2. Lấy thông tin Access Token 
Mục đích sử dụng: API lấy thông tin Access Token để truy cập  
Phương thức và URL: POST https://id.kiotviet.vn/connect/token 
Request: 
scopes: PublicApi.Access //Phạm vi truy cập (Public API) 
grant_type: client_credentials //Thông tin truy cập dạng token 
client_id: 83a5bcbe-3c39-458c-bdd9-128112cef3f7 //Client Id 
client_secret: 3B52F3A9DDE194966DAE2CE0A478B2DEC15254D6 //Client secret 
Header 
"Content-Type":"application/x-www-form-urlencoded" 
Công ty TNHH Citigo  
9/81 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     
Phiên bản 1.4 
scope 
Body:  
scopes=PublicApi.Access&grant_type=client_credentials&client_id=e4fe37ab
5d10-4919-bf59
d9a568456d0b&client_secret=01A3703244752CFF6350A801F900742179C7CCDA  
Response: 
{ 
"access_token": "", 
"expires_in": 86400, 
"token_type": "Bearer" 
} 
2.3. Nhóm hàng 
Mô tả chi tiết cho các liên quan đến thông tin nhóm hàng hóa như sau: 
2.3.1. Lấy danh sách nhóm hàng  
Mục đích sử dụng: Trả về toàn bộ danh mục hàng hóa (nhóm hàng hóa). Danh sách này được sắp xếp 
theo thứ tự bảng chữ cái (a-z). Hệ thống chỉ cho phép nhóm hàng hóa có tối đa 3 cấp, và không cho phép 
xóa nhóm hàng cha nếu đang có chứa nhóm hàng con và không cho phép xóa nhóm hàng con nếu đang 
được sử dụng.  
Phương thức và URL: GET https://public.kiotapi.com/categories 
Request: Sử dụng hàm GET với tham số 
“lastModifiedFrom”: datetime? // thời gian cập nhật 
“pageSize”: int?, // số items trong 1 trang, mặc định 20 items, tối đa 100 items  
“currentItem”: int, // lấy dữ liệu từ bản ghi hiện tại, nếu không nhập thì mặc định là 0 
“orderBy”: string, //Sắp xếp dữ liệu theo trường orderBy (Ví dụ: orderBy=name) 
Công ty TNHH Citigo  
10/81 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  11/81 
 
“orderDirection”: string, //Sắp xếp kết quả trả về theo: Tăng dần Asc (Mặc định), giảm dần Desc 
“hierachicalData”: Boolean, // nếu HierachicalData=true thì mình sẽ lấy nhóm hang theo cấp mà 
không quan tâm lastModifiedFrom. Ngược lại, HierachicalData=false thì sẽ lấy 1 list nhóm hang 
theo lastModifiedFrom nhưng không có phân cấp 
Response: 
 Nếu hierachicalData là true 
“total”: int, 
“pageSize”: int, 
“data”:  [ 
  { 
   “categoryId”: int, // ID nhóm hàng hóa 
  "parentId”: int?, // Nếu danh mục có danh mục cha thì có id cụ thể, 
nếu không có danh mục cha, ParentId=null 
   "categoryName": string, // Tên nhóm hàng hóa 
  “retailerId”: int, // Id cửa hàng 
  “hasChild”: boolean?, // nhóm hàng có con hay không 
  “modifiedDate”: datetime? // thời gian cập nhật 
  “createdDate”: datetime 
  “children”: [] 
   }], 
  “removedIds”: int [], // danh sách ID nhóm hàng bị xóa dựa trên Modified 
Date 
  "timestamp": datetime 
} 
 Nếu hierachicalData là fasle 
“total”: int, 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  12/81 
 
“pageSize:” int, 
“data”:  [ 
  { 
   “categoryId”: int, // ID nhóm hàng hóa 
  “parentId”: int?, // Nếu danh mục có danh mục cha thì có id cụ thể, 
nếu không có danh mục cha, ParentId=null 
   "categoryName": string, // Tên nhóm hàng hóa 
  “retailerId”: int, // Id cửa hàng 
  “hasChild”: boolean?, // nhóm hàng có con hay không 
  “modifiedDate”: datetime? // thời gian cập nhật 
  “createdDate”: datetime 
   }], 
  “removedIds”: int [], // danh sách ID nhóm hàng bị xóa dựa trên Modified 
Date 
  "timestamp": datetime 
} 
2.3.2. Lấy chi tiêt nhóm hàng  
Mục đich sử dụng: Trả lại thông tin chi tiết của nhóm hàng hóa theo ID 
Phương thức và URL: GET https://public.kiotapi.com/categories/{id} 
Request: Sử dụng hàm GET với tham số: 
“id”: long // ID của nhóm hàng 
Response: 
“data”: { 
   “categoryId”: int, // ID nhóm hàng hóa 
  "parentId": int?, // Nếu danh mục có danh mục cha 
         "categoryName": string, // Tên nhóm hàng hóa 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  13/81 
 
  “retailerId”: int, // Id cửa hàng 
  “hasChild”: int?, // Id cửa hàng 
  “modifiedDate: datetime?, // Thời gian cập nhật 
  “createdDate”: datetime, 
  “children”: [] 
   } 
 
2.3.3. Thêm mới nhóm hàng  
Mục đích sử dụng: Thêm mới một nhóm hàng 
Phương thức và URL: POST https://public.kiotapi.com/categories 
Request: JSON mã hóa yêu cầu gồm 1 object nhóm hàng riêng biệt với nhưng tham số sau: 
“categoryName”: string // tên nhóm hàng hóa  
“parentId”: int // nếu nhóm hàng có nhóm hàng cha (hệ thống cho phép tối đa 3 cấp nhóm) 
Body  
{ 
 "categoryName": string 
} 
Response: 
{ 
  "message": "Cập nhật dữ liệu thành công", 
  "data": { 
    "categoryId": int, // Id nhóm hàng hóa 
    "parentId": int?, // Nếu danh mục có danh mục cha 
    “categoryName": string, // Tên nhóm hàng hóa (tối đa 125 ký tự) 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  14/81 
 
    "retailerId": int, // Id cửa hàng 
    "hasChild": boolean?, // Có danh mục con 
    "modifiedDate": datetime?, 
    "createdDate": datetime, 
    "children": [] 
  } 
} 
2.3.4. Cập nhật nhóm hàng  
Mục đích sử dụng: Cập nhật nhóm hàng hóa theo ID 
Phương thức và URL: PUT https://public.kiotapi.com/categories/id 
Request: Sử dụng hàm PUT với ID nhóm hàng qua 1 object JSON.  
“id”: long // ID nhóm hàng hóa 
Body 
  { 
  "parentId": int, // Nếu danh mục có danh mục cha 
         "categoryName": string // Tên nhóm hàng hóa (tối đa 125 ký tự) 
   } 
Response: 
{ 
  "message": "Cập nhật dữ liệu thành công", 
  "data": { 
    "categoryId": int, // Id nhóm hàng hóa 
    "parentId": int, // Nếu danh mục có danh mục cha 
    "categoryName": string, // Tên nhóm hàng hóa (tối đa 125 ký tự) 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     
Phiên bản 1.4 
"retailerId": int, // Id cửa hàng 
"hasChild": false, // Có danh mục con 
"modifiedDate": datetime, 
"createdDate": datetime, 
"children": [] 
} 
} 
2.3.5. Xóa nhóm hàng 
Mục đích sử dụng: Xóa nhóm hàng theo ID 
Phương thức và URL: DELETE https://public.kiotapi.com/categories/{id} 
Request: Request sẽ bao gồm Id của nhóm hàng trong URL: 
“id”: long // ID của nhóm hàng 
Response: Trả lại thông tin xóa thành công (Code 200) 
{ 
"message": "Xóa dữ liệu thành công" 
} 
2.4. Hàng hóa 
Mô tả chi tiết cho các liên quan đến thông tin hàng hóa như sau: 
2.4.1. Lấy danh sách hàng hóa 
Mục đích sử dụng: Trả về toàn bộ hàng hóa theo cửa hàng đã được xác nhận (authenticated retailer) 
Phương thức và URL: GET https://public.kiotapi.com/products 
Công ty TNHH Citigo  
15/81 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     
Phiên bản 1.4 
Request: Sử dụng hàm GET với tham số: 
“orderBy”: string, optional //Sắp xếp dữ liệu theo trường orderBy (ví dụ: orderBy=Name) 
“lastModifiedFrom”: datetime? // thời gian cập nhật 
“pageSize”: int, // số items trong 1 trang, mặc định 20 items, tối đa 100 items  
“currentItem”: int, // lấy dữ liệu từ bản ghi currentItem 
“includeInventory”: Boolean, // có lấy thông tin tồn kho? 
“includePricebook”: Boolean, // có lấy thông tin bảng giá?  
“masterUnitId”: long?, //Id hàng hoá đơn vị cần filter 
“categoryId”: int?, //Id nhóm hàng cần filter 
“orderDirection”: string, optional  
Nếu có "OrderDirection", chọn sắp xếp kết quả về theo:  
 ASC (Mặc định) 
 DESC 
“includeRemoveIds”: Boolean //Có lấy thông tin dnh sách Id bị xoá dựa trên lastModifiedFrom 
Response:  
“removeId”: int [], // Danh sách Id hàng hóa bị xóa dựa trên ModifiedDate 
“total”: int, // Tổng số hàng hóa  
“pageSize”: int, 
“data”: [{ 
“id”: long, // ID hàng hóa  
“code”: string, // Code hàng hóa 
“retailerId”: int, // Id cửa hàng 
"allowsSale": Boolean, // Sản phẩm được bán trực tiếp hay không 
"name": string, // Tên sản phẩm 
"categoryId": int, // Id của nhóm hàng hóa 
Công ty TNHH Citigo  
16/81 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  17/81 
 
   "categoryName": string, // Tên của nhóm hàng hóa 
   "fullName": string, // Tên sản phẩm bao gồm unit và thuộc tính 
  “description”: string, // Mô tả sản phẩm 
  "hasVariants": Boolean?, // Sản phẩm có thuộc tính hay không 
   "attributes": [ 
  { 
   “productId”: long, // Id sản phẩm 
   “attributeName”: string, // tên thuộc tính 
   “attributeValue”: string // giá trị thuộc tính 
  }], // danh sách thuộc tính 
  “unit”: string, // đơn vị tính của 1 sản phẩm, 
 “masterUnitId”: long, // Id của hàng hóa đơn vị cơ bản (null) 
  “masterProductId”: long?, 
  “conversionValue”: int, // Đơn vị quy đổi 
  "units": [ 
  {“id”: long, // ID sản phẩm 
   “code”: string, // Mã sản phẩm  
   “name”: string, // Tên sản phẩm   
   “fullName”: string, // Tên sản phẩm    
   “unit”: string, // Đơn vị tính  
   “conversionValue”: double, // Đơn vị quy đổi 
   “basePrice”: decimal, // Giá bán của sản phẩm 
  }], // danh sách đơn vị tính 
   “images”: [{“Image”: string, // ảnh sản phẩm}],  
  // Danh sách hình ảnh của hàng hóa    
 “inventories”:  
[{ 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  18/81 
 
  "productId": long, // Id của sản phẩm 
  "productCode": string, // Mã của sản phẩm 
  "productName": string, // Tên của sản phẩm 
  "branchId": int, // Id của chi nhánh 
  "branchName": string, // Tên của chi nhánh 
   "onHand": double?, // Tồn kho theo chi nhánh 
   "cost": decimal?, // Giá sản phẩm 
  “reserved”: double, // Đặt hàng theo chi nhánh 
}], // danh sách tồn kho trên các chi nhánh 
 “priceBooks”: // bảng giá (mặc định là bảng giá chung) 
[{ 
  "priceBookId": long, // ID bảng giá 
  "priceBookName": string, // Tên bảng giá 
  “productId”: long// ID sản phẩm 
   "isActive": Boolean, // Có được sử dụng? 
   “startDate”: datetime?, // có hiệu lực từ ngày 
   “endDate”: datetime?, // có hiệu lực đến ngày 
   “price”: decimal, // Giá bán theo bảng giá 
}]// danh sách các bảng giá mà sản phẩm đang được gán 
“basePrice”: decimal?, // giá sản phẩm 
“weight”: double?, // trọng lượng sản phẩm 
      “modifiedDate”: datetime // thời gian cập nhật 
  }] 
2.4.2. Lấy chi tiết hàng hóa  
Mục đích sử dụng: Trả lại chi tiết của một sản phẩm cụ thể theo ID, theo Code 
Phương thức và URL:  
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  19/81 
 - Theo Id : GET https://public.kiotapi.com/products/{id} - Theo Code : GET https://public.kiotapi.com/products/code/{code} 
Request: Sử dụng hàm GET với tham số: 
“id”: long // ID của hàng hóa 
“code”: string // Mã của hàng hóa 
Response:  
{ 
 “id”: long, // ID hàng hóa  
  “code”: string, // Code hàng hóa 
 “retailerId”: int, // Id cửa hàng 
 "allowsSale": Boolean?, // Sản phẩm được bán trực tiếp hay không 
 "name": string, // Tên sản phẩm 
 "categoryId": int, // Id của nhóm hàng hóa 
 "categoryName": string, // Tên của nhóm hàng hóa 
 "fullName": string, // Tên sản phẩm bao gồm unit và thuộc tính? 
 “description”: string, // Mô tả sản phẩm 
 "hasVariants": Boolean?, // Sản phẩm có thuộc tính hay không 
 "attributes": [ 
   { 
    “productId”: long, // Id thuộc tính 
    “attributeName”: string, // tên thuộc tính 
    “attributeValue”: string // giá trị thuộc tính 
   }], // danh sách thuộc tính 
 “unit”: string, // đơn vị tính của 1 sản phẩm, 
 “masterProductId”: long?, 
 “masterUnitId”: long, // Id của hàng hóa đơn vị cơ bản (null) 
 “conversionValue”: int, // Đơn vị quy đổi 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  20/81 
 
 "units": [ 
   {“id”: long, // ID sản phẩm 
    “code”: string, // Mã sản phẩm , 
           “name”: string, //Tên sản phẩm  
                  “fullName”: string, //Tên sản phẩm bao gồm unit và thuộc 
tính       
           “unit”: string, // Đơn vị tính  
    “conversionValue”: double, // Đơn vị quy đổi 
    “basePrice”: decimal, // Giá bán của sản phẩm 
   }], // danh sách đơn vị tính 
 “images”: string [],// Danh sách hình ảnh của hàng hóa          
  “inventories”:  
     [{ 
   "productId": long, // Id của sản phẩm 
   "productCode": string, // Mã của sản phẩm 
   "productName": string, // Tên của sản phẩm 
   "branchId": long, // Id của chi nhánh 
   "branchName": long, // Tên của chi nhánh 
   "onHand": double?, // Tồn kho theo chi nhánh 
   "cost": decimal?, // Giá sản phẩm 
  “reserved”: double, // Đặt hàng theo chi nhánh 
     }], // danh sách tồn kho trên các chi nhánh 
  “priceBooks”: // bảng giá (mặc định là bảng giá chung) 
     [{ 
   "priceBookId": long, // ID bảng giá 
   "priceBookName": string, // Tên bảng giá 
   “productId”: long// ID sản phẩm 
     "isActive": Boolean, // Có được sử dụng? 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  21/81 
 
     “startDate”: datetime?, // có hiệu lực từ ngày 
     “endDate”: datetime?, // có hiệu lực đến ngày 
     “price”: decimal, // Giá bán theo bảng giá 
     }]// danh sách các bảng giá mà sản phẩm đang được gán 
 “basePrice”: decimal, // giá sản phẩm 
 “weight”: double, // trọng lượng sản phẩm 
  “modifiedDate”: datetime // thời gian cập nhật 
} 
2.4.3. Thêm mới hàng hóa 
Mục đích sử dụng: Tạo mới hàng hóa 
Phương thức và URL: POST https://public.kiotapi.com/products 
Request: JSON mã hóa yêu cầu gồm 1 object hàng hóa: 
{   
 “name”: string, // Tên hàng hóa  
 “code”: string, // Mã hàng hóa 
 “fullName”: string, // Tên sản phẩm bao gồm unit và thuộc tính? 
 “categoryId”: int, // Id nhóm hàng hóa 
 "allowsSale": Boolean, // Sản phẩm được bán trực tiếp hay không 
 “description”: string, // Mô tả sản phẩm, 
        “hasVariants”: boolean, // Sản phẩm có thuộc tính hay không 
 "attributes": [{ 
   “attributeName”: string, // tên thuộc tính (Nếu tên thuộc tính 
chưa tồn tại trong hệ thống thì tự động tạo mới thuộc tính) 
   “attributeValue”: string // giá trị thuộc tính 
  }], // danh sách thuộc tính 
 “unit”: string, // đơn vị tính của 1 sản phẩm 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  22/81 
 
 “masterProductId”: long?, //Id hàng hoá cùng loại 
 “masterUnitId”: long?, // Id của hàng hóa đơn vị cơ bản = NULL  
    Neu la don vi co ban 
 “conversionValue”: double?, // Đơn vị quy đổi =1 neu la  
 “inventories”:  
 [{ 
   "branchId": long, // Id của chi nhánh 
   "branchName": long, // Tên của chi nhánh 
   "onHand": double?, // Tồn kho theo chi nhánh 
   "cost": decimal?, // Giá sản phẩm 
  “reserved”: double, // Đặt hàng theo chi nhánh 
}], // danh sách tồn kho trên các chi nhánh 
“basePrice”: decimal?, // giá sản phẩm 
“weight”: double?, // trọng lượng sản phẩm, 
  “images”: string [], // Danh sách hình ảnh của hàng hóa  
     + Image: link ảnh của hàng hóa 
} 
Response: 
  { 
     “id”: int, // ID hàng hóa    
  “code”: string, // Mã hàng hóa 
  “name”: string, // Tên hàng hóa 
         “fullName”: string, // 
  “description”: string, // Tên hàng hóa 
   “images”: string [], // Danh sách hình ảnh của hàng hóa  
     + Image: link ảnh của hàng hóa 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  23/81 
 
         “categoryId”: int, 
         “categoryName”: string, 
         “unit”: string, 
         “masterProductId”: long?, 
         “masterUnitId”: long, 
         “conversionValue”: int, 
  "hasVariants": Boolean, // Sản phẩm có thuộc tính hay không 
   "attributes": [{ 
   “productId”: long, // Id thuộc tính 
   “attributeName”: string, // tên thuộc tính 
   “attributeValue”: string // giá trị thuộc tính 
  }] // danh sách thuộc tính 
 
  “basePrice”: decimal, // Giá bán 
   
  “inventories”: [ 
  { 
  "productId": long, // Id của sản phẩm 
   "productCode": string, // Mã của sản phẩm 
   "productName": string, // Tên của sản phẩm 
   "branchId": long, // Id của chi nhánh 
   "branchName": long, // Tên của chi nhánh 
   "onHand": double?, // Tồn kho theo chi nhánh 
   "cost": decimal?, // Giá sản phẩm 
         “reserved”: double, // Đặt hàng theo chi nhánh 
  }] 
 “basePrice”: decimal, // Giá bán theo bảng giá 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  24/81 
 
  “retailerId”: int, // Id cửa hàng 
  “modifiedDate”: datetime, // Thời gian cập nhật 
} 
 
2.4.4. Cập nhật hàng hóa 
Mục đích sử dụng: Cập nhật hàng hóa theo ID 
Phương thức và URL: PUT https://public.kiotapi.com /products/id 
Request: Sử dụng hàm PUT với ID hàng hóa qua 1 object JSON.  
“branchId”: int, //Id chi nhánh hiện tại 
“id”: long // ID hàng hóa 
Body 
{ 
 “name”: string, // Tên hàng hóa  
 “code”: string, // Mã hàng hóa 
 “categoryId”: int, // Id nhóm hàng hóa 
 "allowsSale": Boolean, // Sản phẩm được bán trực tiếp hay không 
 “description”: string, // Mô tả sản phẩm, 
        “hasVariants”: boolean, // Sản phẩm có thuộc tính hay không 
 "attributes": [ 
  {“attributeName”: string, // tên thuộc tính (Nếu tên thuộc tính 
chưa tồn tại trong hệ thống thì tự động tạo mới thuộc tính) 
   “attributeValue”: string // giá trị thuộc tính 
  }], // danh sách thuộc tính 
 “unit”: string, // đơn vị tính của 1 sản phẩm 
 “masterUnitId”: long, // Id của hàng hóa đơn vị cơ bản = NULL  
    Neu la don vi co ban 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  25/81 
 
 “conversionValue”: int, // Đơn vị quy đổi =1 neu la  
 “inventories”:  
 [{ 
   "branchId": long, // Id của chi nhánh 
   "branchName": long, // Tên của chi nhánh 
   "onHand": double?, // Tồn kho theo chi nhánh 
   "cost": decimal?, // Giá sản phẩm 
  “reserved”: double, // Đặt hàng theo chi nhánh 
}], // danh sách tồn kho trên các chi nhánh 
“basePrice”: decimal, // giá sản phẩm 
“weight”: double, // trọng lượng sản phẩm 
} 
Response:  
{ 
         “id”: int, // ID hàng hóa    
  “code”: string, // Mã hàng hóa 
  “name”: string, // Tên hàng hóa 
         “fullName”: string, // 
  “description”: string, // Tên hàng hóa 
   “images”: string [], // Danh sách hình ảnh của hàng hóa  
     + Image: link ảnh của hàng hóa 
         “categoryId”: int, 
         “categoryName”: string, 
         “unit”: string, 
         “masterUnitId”: long, 
         “conversionValue”: int, 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  26/81 
 
  "hasVariants": Boolean, // Sản phẩm có thuộc tính hay không 
   "attributes": [ 
  {“attributeName”: string, // tên thuộc tính 
   “attributeValue”: string // giá trị thuộc tính 
  }] // danh sách thuộc tính 
 
  “basePrice”: decimal, // Giá bán 
  “inventory”: [ 
  { 
   "productId": long, // Id của sản phẩm 
   "productCode": string, // Mã của sản phẩm 
   "productName": string, // Tên của sản phẩm 
   "branchId": long, // Id của chi nhánh 
   "branchName": long, // Tên của chi nhánh 
   "onHand": double?, // Tồn kho theo chi nhánh 
   "cost": decimal?, // Giá sản phẩm 
  “reserved”: double, // Đặt hàng theo chi nhánh 
  }] 
 “basePrice”: decimal, // Giá bán theo bảng giá 
  “retailerId”: int, // Id cửa hàng 
  “modifiedDate”: datetime, // Thời gian cập nhật 
} 
2.4.5. Xóa hàng hóa 
Mục đích sử dụng: Xóa hàng hóa theo ID 
Phương thức và URL: DELETE https://public.kiotapi.com/products/{id} 
Request: Gồm Id của hàng hóa trong URL: 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     
Phiên bản 1.4 
“id”: long // ID của hàng hóa 
Response: Trả lại thông tin xóa thành công (Code 200) 
{ 
"message": "Xóa dữ liệu thành công" 
} 
2.5. Đặt hàng  
Hiện tại KiotViet hỗ trợ các thiết lập cho tính năng đặt hàng như sau: 
  Trong trường hợp người dùng không tích chọn setting cho “Cho phép đặt hàng”, các giao dịch liên 
quan tới đặt hàng sẽ không hiển thị trên Kiotviet nữa. Vì vậy, khi gọi các API liên quan tới phần đặt 
hàng, nếu thiết lập này đang tắt thì API sẽ trả lại thông báo “Thiết lập “Cho phép đặt hàng” đang không 
được bật.”.  
 Trong trường hợp người dùng không tích chọn setting cho “Sử dụng tính năng giao hàng”, các giao 
dịch sẽ không hiển thị tính năng giao hàng nữa. Vì vậy, khi gọi các API liên quan tới phần giao hàng, 
nếu thiết lập này đang tắt thì API sẽ trả lại thông báo “Thiết lập “Sử dụng tính năng giao hàng.”  đang 
không được bật”.  
 Trong trường hợp người dùng không tích chọn setting cho “Không cho phép thay đổi thời gian bán 
hàng”, khi Post/ Put các API liên quan đến thời gian bán hàng thì API sẽ trả lại thông báo “Thiết lập 
“Không cho phép thay đổi thời gian bán hàng” đang không được bật.”. 
Mô tả chi tiết cho các API hỗ trợ Đặt hàng như sau: 
2.5.1. Lấy danh sách đặt hàng 
Mục đích sử dụng: Trả về danh sách đặt hàng theo cửa hàng đã được xác nhận 
Phương thức và URL: GET https://public.kiotapi.com/orders 
Request: Sử dụng hàm GET với tham số: 
“branchIds”: int[], optional // ID chi nhánh 
Công ty TNHH Citigo  
27/81 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  28/81 
 
     “customerIds”: long[], optional // Id khách hàng 
     “customerCode”: string //Mã khách hàng 
     “status”: int[], optional // Tình trạng đặt hàng 
     “includePayment”: Boolean, // có lấy thông tin thanh toán 
     “includeOrderDelivery”: Boolean,  
     “lastModifiedFrom”: datetime? // thời gian cập nhật 
     “pageSize”: int?, // số items trong 1 trang, mặc định 20 items, tối đa 100 items  
     “currentItem”: int, 
     “lastModifiedFrom”: datetime? // thời gian cập nhật 
     “toDate”: datetime? //Thời gian cập nhật cho đến thời điểm toDate 
     “orderBy”: string, //Sắp xếp dữ liệu theo trường orderBy (Ví dụ: orderBy=name) 
      “orderDirection”: string, //Sắp xếp kết quả trả về theo: Tăng dần Asc (Mặc định), giảm dần Desc 
Response:  
{ 
“total”: int, 
“pageSize”: int, 
“data”: [{ 
 “id”: long //Id đặt hàng 
 “code”: string //Mã đặt hàng 
 “purchaseDate”: datetime // Ngày đặt hàng 
 “branchId”: int, //Id chi nhánh 
 “branchName”: string, //Tên chi nhánh 
 “soldById”: long?, 
        “soldByName”: string 
 “customerId”: long?, // Id khách hàng 
 “customerCode”: string, //Mã khách hàng 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  29/81 
 
 “customerName”: string, // Tên khách hàng 
 “total”: decimal, // Khách cần trả 
 “totalPayment”: decimal, //Khách đã trả 
 “discountRatio”: double?, // Giảm giá trên đơn theo % 
 “discount”: decimal?, // Giảm giá trên đơn theo tiền 
 “status”: int, // trạng thái đơn đặt hàng 
 “statusValue”: string, // trạng thái đơn đặt hàng bằng chữ 
 “description”: string, // ghi chú 
        “usingCod”: boolean,  
     “payments” :[{ 
   “id”: long,  
   “code”: string, 
   “amount”: decimal, 
   “method”: string”, 
   “status”: byte?, 
                       “statusValue”: string, 
                       “transDate”: datetime, 
                       “bankAccount”: string, 
                       “accountId”: int? 
  }],  
      “orderDetails” :{ 
   “productId”: long, // Id hàng hóa 
   “productCode”: string,  
   “productName”: string, //Tên hàng hóa  
     (bao gồm thuộc tính và đơn vị tính) 
   “quantity”: double, // Số lượng hàng hóa 
   “price”: decimal, //Giá trị 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  30/81 
 
   “discountRatio”: double?, // Giảm giá trên sản phẩm 
theo % 
   “discount”: decimal?, // Giảm giá trên sản phẩm theo 
tiền 
 }, 
      “orderDelivery”:{ 
  “deliveryCode”: string, 
                “type”: byte?, 
                “price”: Decimal?, 
                “receiver”: string, 
                “contactNumber”: string, 
                “address”: string, 
                “locationId”: int?, 
                “locationName”: string, 
                “weight”: double?, 
                “length”: double?, 
                “width”: double?, 
                “height”: double?, 
                “partnerDeliveryId”: long?, 
   “partnerDelivery”:{ 
   “code”: string, 
                       “name”: string, 
                       “address”: string, 
                       “contactNumber”: string, 
                       “email”: string 
  } 
 } 
“retailerId”: int, // Id cửa hàng 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  31/81 
 
      “modifiedDate”: datetime // thời gian cập nhật 
      “createdDate”: datetime // thời gian tạo 
      }] 
} 
2.5.2. Lấy chi tiết đặt hàng 
Mục đích sử dụng: Trả về thông tin chi tiết của đơn đặt hàng theo ID, theo Code 
Phương thức và URL: - Theo Id :  GET https://public.kiotapi.com/orders/ {id} - Theo Code :  GET https://public.kiotapi.com/orders/code/ {code} 
Request: Sử dụng hàm GET với tham số: 
“id”: long // ID của đơn đặt hàng 
“code”: code // Mã của đơn đặt hàng  
Response:  
{  
 “id”: long //Id đặt hàng 
 “code”: string //Mã đặt hàng 
 “purchaseDate”: datetime // Ngày đặt hàng 
 “branchId”: int, //Id chi nhánh 
 “branchName”: string, //Tên chi nhánh 
 “soldById”: long?, 
        “soldByName”: string 
 “customerId”: long?, // Id khách hàng 
 “customerName”: string, // Tên khách hàng 
 “total”: decimal, // Khách cần trả 
 “totalPayment”: decimal, //Khách đã trả 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  32/81 
 
 “discountRatio”: double, // Giảm giá trên đơn theo % 
 “discount”: decimal?, // Giảm giá trên đơn theo tiền 
 “status”: int, // trạng thái đơn đặt hàng 
 “statusValue”: string, // trạng thái đơn đặt hàng bằng chữ 
 “description”: string, // ghi chú 
        “usingCod”: boolean,  
     “payments” :[{ 
   “id”: long,  
   “code”: string, 
   “amount”: decimal, 
   “method”: string, 
   “status”: byte?, 
                       “statusValue”: string, 
                       “transDate”: datetime, 
                       “bankAccount”: string, 
                       “accountId”: int? 
  }],  
      “orderDetails” :{ 
   “productId”: long, // Id hàng hóa 
                       “productCode”: string,  
   “productName”: string, //Tên hàng hóa  
     (bao gồm thuộc tính và đơn vị tính) 
   “quantity”: double, // Số lượng hàng hóa 
   “price”: decimal, //Giá trị 
   “discountRatio”: double?, // Giảm giá trên sản phẩm 
theo % 
   “discount”: decimal?, // Giảm giá trên sản phẩm theo 
tiền 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  33/81 
 
 }, 
      “orderDelivery”:{ 
  “deliveryCode”: string, 
                “type”: byte?, 
                “price”: Decimal?, 
                “receiver”: string, 
                “contactNumber”: string, 
                “address”: string, 
                “locationId”: int?, 
                “locationName”: string, 
                “weight”: double?, 
                “length”: double?, 
                “width”: double?, 
                “height”: double?, 
                “partnerDeliveryId”: long?, 
   “partnerDelivery”:{ 
   “code”: string, 
                       “name”: string, 
                       “address”: string, 
                       “contactNumber”: string, 
                       “email”: string 
  } 
 } 
“retailerId”: int, // Id cửa hàng 
      “modifiedDate”: datetime // thời gian cập nhật 
      “createdDate”: datetime //thời gian tạo 
} 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  34/81 
 
2.5.3. Thêm mới đặt hàng 
Mục đích sử dụng: Tạo mới đơn đặt hàng 
Phương thức và URL: POST https://public.kiotapi.com/orders 
Request: JSON mã hóa yêu cầu gồm 1 object đặt hàng: 
{ 
   “purchaseDate”: datetime, 
   “branchId”: int, 
   “soldById”: long?, 
   “cashierId”: long, Id nhân viên thu ngân, 
   “discount”: decimal, 
   “description”: string, 
   “method”: string, 
   “totalPayment”: decimal, //khách đã trả 
   “accountId”: int?, //Id account tài khoản ngân hàng nếu phương thức thanh 
toán là TRANSFER, CARD, 
    “makeInvoice”: bool, // Tạo hóa đơn từ đơn đặt hàng, tạo phiếu thu cho 
hóa đơn đó với thời điểm hiện tại  
   “orderDetails”: [{ 
       “productId”: long, 
                       “productCode”: string, 
                       “productName”: string, 
                       “quantity”: double, 
                       “price”: decimal, 
                       “discount”: decimal?, 
                       “discountRatio”: double? 
          }], 
        “orderDelivery”:{ 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  35/81 
 
  “deliveryCode”: string, 
                “type”: byte?, 
                “price”: Decimal?, 
                “receiver”: string, 
                “contactNumber”: string, 
                “address”: string, 
                “locationId”: int?, 
                “locationName”: string, 
                “weight”: double, 
                “length”: double, 
                “width”: double, 
                “height”: double, 
                “partnerDeliveryId”: long?, 
   “partnerDelivery”:{ 
   “code”: string, 
                       “name”: string, 
                       “address”: string, 
                       “contactNumber”: string, 
                       “email”: string 
  } 
 }, 
       “customer" : { 
               “id”: long, 
         "code": string,  
    "name": string,  
    "gender": boolean,  
    "birthDate": datetime,  
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  36/81 
 
     "contactNumber": string,  
      "address": string,  
     "email": string,  
    "comment": string 
      } 
} 
Response: 
{ 
 “id”: long, 
        “code”: string, 
        “purchaseDate”: datetime, 
        “branchId”: int, 
        “branchName”: string, 
        “soldById”: long?, 
        “soldByName”: string, 
        “customerId”: long?, 
        “customerName”: string, 
        “total”: decimal, // Khách cần trả 
 “totalPayment”: decimal, //Khách đã trả 
        “discountRatio”: double?, // Giảm giá trên đơn theo % 
 “discount”: decimal?, // Giảm giá trên đơn theo tiền 
 “method”: string, // Phương thức thanh toán (Cash, Card, Transfer) 
 “status”: int, // trạng thái đơn đặt hàng 
 “statusValue”: string, // trạng thái đơn đặt hàng bằng chữ 
 “description”: string, // ghi chú 
        "usingCod": boolean, 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  37/81 
 
 “orderDetails” :{ 
   “productId”: long, // Id hàng hóa 
   “productName”: string, //Tên hàng hóa  
     (bao gồm thuộc tính và đơn vị tính) 
   “quantity”: double, // Số lượng hàng hóa 
   “price”: decimal, //Giá trị 
   “discountRatio”: double?, // Giảm giá trên sản phẩm 
theo % 
   “discount”: decimal?, // Giảm giá trên sản phẩm theo 
tiền 
 }, 
      “orderDelivery”:{ 
  “deliveryCode”: string, 
                “type”: byte?, 
                “price”: Decimal?, 
                “receiver”: string, 
                “contactNumber”: string, 
                “address”: string, 
                “locationId”: int?, 
                “locationName”: string, 
                “weight”: double?, 
                “length”: double?, 
                “width”: double?, 
                “height”: double?, 
                “partnerDeliveryId”: long?, 
   “partnerDelivery”:{ 
   “code”: string, 
                       “name”: string, 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  38/81 
 
                       “address”: string, 
                       “contactNumber”: string, 
                       “email”: string 
  } 
 } 
      “payments” :[{ 
   “id”: long,  
   “code”: string, 
   “amount”: decimal, 
   “method”: string, 
   “status”: byte?, 
                       “statusValue”: string, 
                       “transDate”: datetime, 
                       “bankAccount”: string, 
                       “accountId”: int? 
  }]  
} 
2.5.4. Cập nhật đặt hàng 
Mục đích sử dụng: Cập nhật đơn đặt hàng theo ID 
Phương thức và URL: PUT https://public.kiotapi.com/orders/Id 
Request: Sử dụng hàm PUT với ID đơn đặt hàng qua 1 object JSON.  
“id”: long // ID đơn đặt hàng 
Body 
{ 
   “purchaseDate”: datetime, 
   “branchId”: int, 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  39/81 
 
   “soldById”: long?, 
   “cashierId”: long?, Id nhân viên thu ngân 
   “discount”: decimal, 
   “description”: string, 
   “method”: string, 
   “totalPayment”: decimal, //Khách đã trả, 
   “accountId”: int?, //Id account tài khoản ngân hàng nếu phương thức thanh 
toán là TRANSFER, CARD, 
   “makeInvoice”: bool, // Tạo hóa đơn từ đơn đặt hàng, tạo phiếu thu cho hóa 
đơn đó với thời điểm hiện tại  
   “orderDetails”: [{ 
       “productId”: long, 
                       “productCode”: string, 
                       “productName”: string, 
                       “quantity”: double, 
                       “price”: decimal, 
                       “discount”: decimal?, 
                       “discountRatio”: double? 
          }] 
        “orderDelivery”:{ 
  “deliveryCode”: string, 
                “type”: byte?, 
                “price”: Decimal?, 
                “receiver”: string, 
                “contactNumber”: string, 
                “address”: string, 
                “locationId”: int?, 
                “locationName”: string, 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  40/81 
 
                “weight”: double?, 
                “length”: double?, 
                “width”: double?, 
                “height”: double?, 
                “partnerDeliveryId”: long?, 
   “partnerDelivery”:{ 
   “code”: string, 
                       “name”: string, 
                       “address”: string, 
   “contactNumber”: string, 
                       “email”: string 
  } 
 }, 
 “customer" : { 
               “id”: long, 
         "code": string,  
    "name": string,  
    "gender": boolean,  
    "birthDate": datetime,  
     "contactNumber": string,  
      "address": string,  
     "email": string,  
    "comment": string 
      } 
} 
Response: 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  41/81 
 
{ 
 “id”: long, 
        “code”: string, 
        “purchaseDate”: datetime, 
        “branchId”: int, 
        “branchName”: string, 
        “soldById”: long?, 
        “soldByName”: string, 
        “customerId”: long, 
        “customerName”: string, 
        “total”: decimal, // Khách cần trả 
 “totalPayment”: decimal, //Khách đã trả 
        “discountRatio”: double?, // Giảm giá trên đơn theo % 
 “discount”: decimal?, // Giảm giá trên đơn theo tiền 
 “method”: string, // Phương thức thanh toán (Cash, Card, Transfer) 
 “status”: int, // trạng thái đơn đặt hàng 
 “statusValue”: string, // trạng thái đơn đặt hàng bằng chữ 
 “description”: string, // ghi chú 
        "usingCod": boolean, 
 “orderDetails” :{ 
   “productId”: long, // Id hàng hóa 
   “productName”: string, //Tên hàng hóa  
     (bao gồm thuộc tính và đơn vị tính) 
   “quantity”: double, // Số lượng hàng hóa 
   “price”: decimal, //Giá trị 
   “discountRatio”: double?, // Giảm giá trên sản phẩm 
theo % 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  42/81 
 
   “discount”: decimal?, // Giảm giá trên sản phẩm theo 
tiền 
 }, 
      “orderDelivery”:{ 
  “deliveryCode”: string, 
                “type”: byte?, 
                “price”: Decimal?, 
                “receiver”: string, 
                “contactNumber”: string, 
                “address”: string, 
                “locationId”: int?, 
                “locationName”: string, 
                “weight”: double?, 
                “length”: double?, 
                “width”: double?, 
                “height”: double?, 
                “partnerDeliveryId”: long?, 
   “partnerDelivery”:{ 
   “code”: string, 
                       “name”: string, 
                       “address”: string, 
   “contactNumber”: string, 
                       “email”: string 
  } 
 }, 
      “payments” :[{ 
  “id”: long,  
  “code”: string, 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  43/81 
 
  “amount”: decimal, 
  “method”: string”, 
  “status”: byte?, 
               “statusValue”: string, 
                “transDate”: datetime, 
                “bankAccount”: string, 
                “accountId”: int? 
 }]   
} 
 
2.5.5. Xóa đặt hàng 
Mục đích sử dụng: Xóa đơn đặt hàng theo ID 
Phương thức và URL: DELETE https://public.kiotapi.com/orders/{id} 
Request: Gồm Id của đơn đặt hàng trong URL: 
“id”: long // ID của đơn đặt hàng 
Response: Trả lại thông tin xóa thành công (Code 200) 
{ 
   "message": "Xóa dữ liệu thành công" 
} 
 
2.6. Khách hàng 
Mô tả chi tiết cho các liên quan đến thông tin hàng hóa như sau: 
2.6.1. Lấy danh sách khách hàng 
Mục đích sử dụng: Trả lại danh sách khách hàng theo cửa hàng đã được xác nhận 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  44/81 
 
Phương thức và URL: GET https://public.kiotapi.com/customers 
Request: Sử dụng hàm GET với tham số: 
      “code”: string, optional // nếu có mã code, cho phép tìm kiếm khách hàng theo mã KH 
“name”: string, optional // tìm kiếm theo tên khách hàng 
“contactNumber”: string, optional // tìm kiếm theo số điện thoại khách hàng 
       “lastModifiedFrom”: datetime? // thời gian cập nhật 
       “pageSize”: int?, // số items trong 1 trang, mặc định 20 items, tối đa 100 items  
       “currentItem”: int?, 
       “orderBy”: string, //Sắp xếp dữ liệu theo trường orderBy (Ví dụ: orderBy=name) 
       “orderDirection”: string, //Sắp xếp kết quả trả về theo: Tăng dần Asc (Mặc định), giảm dần Desc 
        “includeRemoveIds”: boolean, //Có lấy thông tin danh sách Id bị xoá dựa trên lastModifiedFrom 
        “includeTotal”: boolean, //Có lấy thông tin TotalInvoice, TotalPoint, TotalRevenue 
        “includeCustomerGroup”: boolean, //Có lấy thông tin nhóm khách hàng hay không 
 
“groupId”: int, //filter theo nhóm khách hàng 
Response:  
{ 
“total”: int, 
“pageSize”: int, 
“data”: [ 
  { 
   “id”: long, // ID khách hàng  
  "code": string, // Mã khách hàng 
   "name": string, // Tên khách hàng 
  “gender”: Boolean?, // Giới tính (true: nam, false: nữ) 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  45/81 
 
  "birthDate": date?, // Ngày sinh khách hàng 
   "contactNumber": string, // Số điện thoại khách hàng 
  “address”: string, // Địa chỉ khách hàng 
         “locationName”: string, // Khu vực 
  "email": string, // Email của khách hàng 
  "organization": string, // Công ty  
  "comment": string, // Ghi chú 
  "taxCode": string, // Mã số thuế 
  "debt": decimal, // Nợ hiện tại 
         "totalInvoiced": decimal?, // Tổng bán 
   "totalPoint": double?, // Tổng điểm 
   "totalRevenue": decimal?, 
   “retailerId”: int, // Id cửa hàng 
  “modifiedDate”: datetime? // thời gian cập nhật 
         “createdDate”: datetime 
  }], 
   “removeId”: int [] // danh sách Id khách hàng bị xóa dựa trên ModifiedDate 
} 
2.6.2. Lấy chi tiết khách hàng 
Mục đích sử dụng: Trả lại thông tin chi tiết của khách hàng theo ID, theo Code 
Phương thức và URL:  - Theo Id : GET https://public.kiotapi.com/customers/{id} - Theo Code : GET https://public.kiotapi.com/customers/code/{code} 
Request: Sử dụng hàm GET với tham số: 
“id”: long // ID của khách hàng 
“code”: string // Mã của khách hàng  
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  46/81 
 
Response:  
  { 
   “id”: long, // ID khách hàng  
  "code": string, // Mã khách hàng 
   "name": string, // Tên khách hàng 
  “gender”: Boolean?, // Giới tính (true: nam, false: nữ) 
  "birthDate": datetime?, // Ngày sinh khách hàng 
   "contactNumber": string, // Số điện thoại khách hàng 
  “address”: string, // Địa chỉ khách hàng 
   “locationName”: string, // Khu vực 
  "email": string, // Email của khách hàng 
  "organization": string, // Công ty  
  "comment": string, // Ghi chú 
  "taxCode": string, // Mã số thuế 
         “retailerId”: int, // Id cửa hàng 
  "debt": decimal, // Nợ hiện tại 
         "totalInvoiced": decimal?, // Tổng bán 
  "totalPoint": double?, // Tổng điểm 
  "totalRevenue": decimal?, 
  “modifiedDate”: datetime? // thời gian cập nhật 
         “createdDate”: datetime 
  “groups”: string // danh sách tên nhóm khách hàng 
} 
2.6.3. Thêm mới khách hàng 
Mục đích sử dụng: Tạo mới khách hàng 
Phương thức và URL: POST https://public.kiotapi.com/customers 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  47/81 
 
Request: JSON mã hóa yêu cầu gồm 1 object khách hàng: 
{ 
         “code”: string, // Ma khach hang 
  “name”: string, // Tên khách hàng  
  “gender”: Boolean, // Giới tính (true: nam, false: nữ) 
  "birthDate": datetime?, // Ngày sinh khách hàng 
   "contactNumber": string, // Số điện thoại khách hàng 
    "address": string, // Địa chỉ khách hàng 
   "email": string, // Email của khách hàng 
  "comment": string, // Ghi chú 
  "groupIds": int[] // Danh sách Id nhóm khách hàng 
} 
 
 
 
 
 
 
Response: 
  { 
   “id”: long, // ID khách hàng (với id=-1 là bản ghi đầu tiên chứa    
thông tin tổng quan) 
  "code": string, // Mã khách hàng 
   "name": string, // Tên khách hàng 
  “gender”: Boolean, // Giới tính (true: nam, false: nữ) 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  48/81 
 
  "birthDate": datetime?, // Ngày sinh khách hàng 
   "contactNumber": string, // Số điện thoại khách hàng 
  “address”: string, // Địa chỉ khách hàng 
   “locationName”: string, // Khu vực 
  "email": string, // Email của khách hàng 
  "organization": string, // Tên công ty của khách hàng (nếu là khách   
hàng công ty) 
  "comment": string, // Ghi chú 
  "taxCode": string, // Mã số thuế 
  “retailerId”: int, // Id cửa hàng 
  “modifiedDate”: datetime?, // Thời gian cập nhật 
   “createdDate”: datetime 
   "customerGroupDetails": [ 
            { 
                "id": long // Id Chi tiết nhóm khách hàng 
                "customerId": long // Id khách hàng 
                "groupId": int // Id nhóm khách hàng 
            }           
        ], 
   } 
2.6.4. Cập nhật khách hàng 
Mục đích sử dụng: Cập nhật thông tin khách hàng theo ID 
Phương thức và URL: PUT https://public.kiotapi.com/customers/Id 
Request: Sử dụng hàm PUT với ID khách hàng qua 1 object JSON.  
“id”: long // ID khách hàng 
Body 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  49/81 
 
{ 
  “code”: string, // Mã khách hàng 
  “name”: string, // Tên khách hàng  
  “gender”: Boolean, // Giới tính (true: nam, false: nữ) 
  "birthDate": datetime?, // Ngày sinh khách hàng 
   "contactNumber": string, // Số điện thoại khách hàng 
    "address": string, // Địa chỉ khách hàng 
   "email": string, // Email của khách hàng 
  "comment": string, // Ghi chú 
  "groupIds": int[] // Danh sách Id nhóm khách hàng 
} 
Response: 
{ 
   “id”: long, // ID khách hàng (với id=-1 là bản ghi đầu tiên chứa 
thông tin tổng quan) 
  "code": string, // Mã khách hàng 
   "name": string, // Tên khách hàng 
  “gender”: Boolean, // Giới tính (true: nam, false: nữ) 
  "birthDate": datetime?, // Ngày sinh khách hàng 
   "contactNumber": string, // Số điện thoại khách hàng 
  “address”: string, // Địa chỉ khách hàng 
   “locationName”: string, // Khu vực 
  "email": string, // Email của khách hàng 
  "organization": string, // Tên công ty của khách hàng (nếu là khách   
hàng công ty) 
  "comment": string, // Ghi chú 
  "taxCode": string, // Mã số thuế 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     
Phiên bản 1.4 
“retailerId”: int, // Id cửa hàng 
“modifiedDate”: datetime?, // Thời gian cập nhật 
“createdDate”: datetime, 
“groups”: string, // danh sách tên nhóm 
} 
2.6.5. Xóa khách hàng 
Mục đích sử dụng: Xóa khách hàng theo ID 
Phương thức và URL: DELETE https://public.kiotapi.com/customers/{id} 
Request: Gồm Id của khách hàng trong URL: 
“id”: long // ID của khách hàng 
Response: Trả lại thông tin xóa thành công (Code 200) 
{ 
"message": "Xóa dữ liệu thành công" 
} 
2.7. Lấy danh sách chi nhánh  
Mục đích sử dụng: Trả lại danh sách toàn bộ chi nhánh của cửa hàng đã được xác nhận 
Phương thức và URL: GET https://public.kiotapi.com/branches 
Request: Sử dụng hàm GET với tham số: 
“lastModifiedFrom”: datetime? // thời gian cập nhật 
“pageSize”: int?, // số items trong 1 trang, mặc định 20 items, tối đa 100 items  
“currentItem”: int?, 
“orderBy”: string, //Sắp xếp dữ liệu theo trường orderBy (Ví dụ: orderBy=name) 
Công ty TNHH Citigo  
50/81 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  51/81 
 
 “orderDirection”: string, //Sắp xếp kết quả trả về theo: Tăng dần Asc (Mặc định), giảm dần Desc, 
“includeRemoveIds”: boolean,  //Có lấy thông tin danh sách Id bị xoá dựa trên lastModifiedFrom 
Response:  
{ 
  "removedIds": int [], // chi nhánh ngừng hoạt động  
  "total": int,  
  “pageSize”: int, 
  "data": [ 
    { 
      "id": int, // Id chi nhánh 
      "branchName": string, 
      “branchCode”: string, 
      "contactNumber": string, 
      "retailerId": int, // Id cửa hàng 
      "email": string, 
      “address”: string, 
      "modifiedDate": datetime? 
      “createdDate”: datetime 
    } 
  ], 
  "timestamp": datetime 
} 
2.8. Lấy danh sách người dùng 
Mục đích sử dụng: Trả lại danh sách toàn bộ người dùng của cửa hàng đã được xác nhận và không cho 
thấy thông tin Super Admin (isAdmin = true). 
Phương thức và URL: GET https://public.kiotapi.com/users 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  52/81 
 
Request: Sử dụng hàm GET với tham số: 
 “lastModifiedFrom”: datetime? // thời gian cập nhật 
“pageSize”: int?, // số items trong 1 trang, mặc định 20 items, tối đa 100 items  
“currentItem”: int?, 
“orderBy”: string, //Sắp xếp dữ liệu theo trường orderBy (Ví dụ: orderBy=name) 
“orderDirection”: string, //Sắp xếp kết quả trả về theo: Tăng dần Asc (Mặc định), giảm dần Desc, 
“includeRemoveIds”: boolean //Có lấy thông tin danh sách Id bị xoá dựa trên lastModifiedFrom 
Response:  
{ 
“total”: int, 
“pageSize”: int, 
“data”: [ 
  { 
   “id”: long, // ID người dùng 
  "userName": string, // Tên đăng nhập 
   "givenName": string, // Họ tên 
  “address”: string, // Địa chỉ 
  “mobilePhone”: string // Điện thoại 
  “email”: string, // Email 
  “description”: string, // ghi chú 
   “retailerId”: int, // Id cửa hàng 
  “birthDate”: date // Ngày sinh 
         “createdDate”: datetime 
   }], 
    “removeIds”: int [] // danh sách khách hàng bị xóa và ngừng hoạt động dựa 
trên ModifiedDate 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  53/81 
 
} 
 
2.9. Lấy danh sách tài khoản ngân hàng 
Mục đích sử dụng: Trả lại toàn bộ danh sách tài khoản ngân hàng của cửa hàng đã được xác nhận 
Phương thức và URL: GET https://public.kiotapi.com/BankAccounts 
Request: Sử dụng hàm GET với tham số 
“lastModifiedFrom”: datetime? // thời gian cập nhật 
“pageSize”: int?, // số items trong 1 trang, mặc định 20 items, tối đa 100 items  
“currentItem”: int?, 
“orderBy”: string, //Sắp xếp dữ liệu theo trường orderBy (Ví dụ: orderBy=name) 
“orderDirection”: string, //Sắp xếp kết quả trả về theo: Tăng dần Asc (Mặc định), giảm dần Desc, 
“includeRemoveIds”: boolean, //Có lấy thông tin danh sách Id bị xoá dựa trên lastModifiedFrom 
Response:  
{ 
“total”: int, 
“pageSize”: int, 
“data”: [ 
  { 
  “id”: int, // ID tài khoản ngân hàng 
 "bankName": string, // Tên tài khoản ngân hàng 
  "accountNumber": string, // Số tài khoản ngân hàng 
 “description”: string, // ghi chú 
  “retailerId”: int, // Id cửa hàng 
  “modifiedDate”: datetime? // thời gian cập nhật, 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  54/81 
 
        “createdDate”: datatime  
  }], 
     “removeIds”: int [] // danh sách khách hàng bị xóa dựa trên ModifiedDate 
} 
 
2.10. Lấy danh sách thu khác 
Mục đích sử dụng: Trả lại toàn bộ danh sách thu khác của cửa hàng đã được xác nhận 
Phương thức và URL: GET https://public.kiotapi.com/surcharges 
Request: Sử dụng hàm GET với tham số: 
“branchId”: int?, // Id chi nhánh 
“lastModifiedFrom”: datetime? // thời gian cập nhật 
“pageSize”: int?, // số items trong 1 trang, mặc định 20 items, tối đa 100 items  
“currentItem”: int?, 
“orderBy”: string, //Sắp xếp dữ liệu theo trường orderBy (Ví dụ: orderBy=name) 
“orderDirection”: string, //Sắp xếp kết quả trả về theo: Tăng dần Asc (Mặc định), giảm dần Desc, 
Response: 
{ 
“total”: int, 
“pageSize”: int, 
“data”: [ 
  { 
   “id”: long, // Id thu khác 
  "surchargeCode": string, // Mã thu khác 
   "surchargeName": string, // Tên thu khác 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  55/81 
 
  “valueRatio”: double, // Phần trăm thu khác 
   “value”: decimal? // Giá trị thu khác 
   “retailerId”: int, // Id cửa hàng 
  “modifiedDate”: datetime? // thời gian cập nhật 
         “createDate”: datetime 
   }] 
} 
Chú ý: Hiện tại KiotViet hỗ trợ các thiết lập cho tính năng thu khác như sau: 
Trong trường hợp người dùng không tích chọn setting cho “Hỗ trợ các khoản thu khác khi bán hàng”, khi 
gọi các API danh sách thu khác, API sẽ trả lại thông báo exception “Chưa bật thu khác trong thiết lập cửa 
hàng”. 
 
2.11. Webhook 
Webhook là mô hình một public API chủ động gọi vào một server của bên thứ ba khi có thay đổi xảy ra. 
Nó tương đương với mô hình data push (trái ngược với polling), trong đó server chủ động gọi cho client 
thay vì client phải thường xuyên kiểm tra server.  
API Webhook được mô tả chi tiết như bên dưới:  
2.11.1. Đăng ký Webhook 
Mục đích sử dụng: Đăng ký webhook 
Phương thức và URL: POST https://public.kiotapi.com/webhooks 
Request:  
  { 
  "Webhook": { 
          “Type”: string, // Loại webhook 
   “Url”: string, // Địa chỉ đăng ký (thêm "?noecho" sau link địa 
chỉ đăng ký)   
   “IsActive”: Boolean, // Trạng thái hoạt động 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  56/81 
 
   "Description": string // Mô tả 
 } 
} 
Response: 
  { 
         “id”: long, // webhook id 
         “type”: string, //Loại webhook 
  “url”: string, // Địa chỉ đăng ký  
  “isActive”: Boolean, // Trạng thái hoạt động 
  "description": string, // Mô tả 
   "retailerId": int, // Id cửa hàng 
} 
2.11.2. Huỷ đăng ký Webhook 
Mục đích sử dụng: Hủy đăng ký Webhook 
Phương thức và URL: DELETE https://public.kiotapi.com/webhooks/{id} 
Request: Request sẽ bao gồm Id của webhook trong URL: 
 “id”: int // ID của Webhook 
Response: Trả lại thông tin xóa thành công (Code 200) 
{ 
  "message": "Hủy đăng ký webhook thành công" 
} 
2.11.3. Khách hàng 
customer.update 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  57/81 
 
{ 
        “Id”: string, 
        “Attempt”: int, 
        “Notifications”: [{ 
                     “Action”: string, 
                     “Data”: [{ 
                                    “Id”: long, 
                                    “Code”: string, 
                                    “Name”: string, 
                                    “Gender”: bool?, 
                                    “BirthDate”: Datetime?, 
                                    “ContactNumber”: string, 
                                    “Address”: string, 
                                    “LocationName”: string, 
                                    “Email”: string, 
                                    “ModifiedDate”: DateTime, 
                                    “Type”: byte?, 
                                    “Organization”: string, 
                                    “TaxCode”: string, 
                                    “Comments”: string 
                         }] 
            }] 
} 
customer.delete 
{“RemoveId”: int []} 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  58/81 
 
2.11.4. Hàng hóa 
product.update 
{ 
       “Id”: string, 
       “Attempt”: int, 
       “Notifications”: [{ 
                  “Action”: string, 
                  “Data”: [{ 
                                 “Id”: long, 
                                 “Code”: string, 
                                 “Name”: string, 
                                 “FullName”: string, 
                                 “CategoryId”: int, 
                                 “CategoryName”: string, 
       “masterProductId” : long?, 
                                 “AllowsSale”: bool, 
                                 “HasVariants”: bool, 
                                 “BasePrice”: Decimal, 
                                 “Weight”: double?, 
                                 “Unit”: string, 
                                 “MasterUnitId”: long?, 
                                 “ConversionValue”: double, 
                                 “ModifiedDate”: DateTime?, 
                                 “Attributes”:[{ 
                                                “ProductId”: long, 
                                                “AttributeName”: string, 
                                                “AttributeValue” : string 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  59/81 
 
                                         }], 
                                    “Units”:[{ 
                                                 “Id”: long, 
                                                 “Code”: string, 
                                                 “Name”: string, 
                                                 “FullName”: string, 
                                                 “Unit”: string, 
                                                 “ConversionValue”: double, 
                                                 “BasePrice”: Decimal 
                                         }], 
                                     “Inventories”: [{ 
                                                  “ProductId”: long, 
                                                  “ProductCode”: string, 
                                                  “ProductName”: string, 
                                                  “BranchId”: int, 
                                                  “BranchName”: string, 
                                                  “Cost”: Decimal, 
                                                  “OnHand”: double, 
                                                  “Reserved”: double 
                                             }], 
                                     “PriceBooks”:[{ 
                                                  “ProductId”: long, 
                                                  “PriceBookId”: long, 
                                                  “PriceBookName”: string, 
                                                  “Price” : Decimal, 
                                                  “IsActive”: bool, 
                                                  “StartDate”: DateTime?, 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  60/81 
 
                                                  “EndDate”: DateTime? 
                                              }], 
                                     “Images”: [{“Image”: string}] 
                   }] 
        }] 
} 
 
product.delete 
{“RemoveId”: int []} 
 
2.11.5. Tồn kho 
stock.update 
{  
         “Id”: string, 
         “Attempt”: int, 
          “Notifications”: [{ 
                      “Action”: string, 
                      “Data”: [{ 
                                     “ProductId”: long, 
                                     “ProductCode”: string, 
                                     “ProductName”: string, 
                                     “BranchId”: int, 
                                     “BranchName”: string, 
                                     “Cost”: Decimal, 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  61/81 
 
                                     “OnHand”: double, 
                                     “Reserved”: double 
                         }] 
           }] 
} 
2.11.6. Đặt hàng 
order.update 
{ 
      “Id”: string, 
      “Attempt”: int, 
      “Notifications”: [{ 
                  “Action”: string, 
                  “Data”: [{ 
                                “Id”: long, 
                                “Code”: string, 
                               “PurchaseDate”: DateTime, 
                               “BranchId”: int, 
                               “SoldById”: long?, 
                               “SoldByName”: string, 
                               “CustomerId”: long?, 
    “CustomerCode”: string, 
                               “CustomerName”: string, 
                               “Total”: Decimal, 
                               “TotalPayment”: Decimal, 
                               “Discount”: Decimal?, 
                               “DiscountRatio”: double? 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  62/81 
 
                               “Status” : int, 
                               “StatusValue”: string, 
                               “Description”: string, 
                               “UsingCod”: bool 
                               “ModifiedDate”: Datetime? 
                                “OrderDetails”:[{ 
                                            “ProductId”: long, 
                                             “ProductCode”: string, 
                                             “ProductName”: string, 
                                             “Quantity”: double, 
                                             “Price”: Decimal, 
                                             “Discount”: Decimal?, 
                                             “DiscountRatio”: double? 
                                 }] 
                             }] 
       }] 
} 
2.11.7. Hóa đơn 
invoice.update 
{ 
      “Id”: string, 
      “Attempt”: int, 
      “Notifications”:[{ 
                “Action”: string, 
                “Data”: [{ 
                                “Id”: long, 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  63/81 
 
                                “Code”: string, 
                                “PurchaseDate”: DateTime, 
                                “BranchId”: int, 
                                “BranchName”: string, 
                                 “SoldById”: long, 
                                 “SoldByName”: string, 
                                 “CustomerId”: long?, 
       “CustomerCode”: string, 
                                 “CustomerName”: string, 
                                 “Total”: Decimal, 
                                 “TotalPayment”: Decimal, 
                                 “Discount”: Decimal?, 
                                 “DiscountRatio”: double?, 
                                 “Status”: byte, 
                                 “StatusValue”: string, 
                                 “Description”: string, 
                                 “UsingCod”: bool, 
                                 “ModifiedDate”: DateTime?, 
                                 “InvoiceDelivery”: { 
                                                “DeliveryCode”: string, 
                                                “Type”: byte?, 
                                                “Price”: Decimal?, 
                                                “Receiver”: string, 
                                                “ContactNumber”: string, 
                                                “Address”: string, 
                                                “LocationId”: int?, 
                                                “LocationName”: string, 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  64/81 
 
                                                “Weight”: double?, 
                                                “Length”: double?, 
                                                “Width”: double?, 
                                                “Height”: double?, 
                                                “PartnerDeliveryId”: long?, 
                                                “PartnerDelivery”:{ 
                                                           “Code”: string, 
                                                           “Name”: string, 
                                                           “ContactNumber”: 
string, 
                                                           “Address”: string, 
                                                           “Email”: string 
                                                 } 
                                   }, 
                                 “InvoiceDetails”: [{ 
                                                “ProductId”: long, 
                                                “ProductCode”: string, 
                                                “ProductName”: string, 
                                                “Quantity”: double, 
                                                “Price”: Decimal, 
                                                “Discount”: Decimal?, 
                                                “DiscountRatio”: double? 
                                   }], 
                                 “Payments”: [{ 
                                                “Id”: long, 
                                                “Code”: string, 
                                                “Amount”: Decimal, 
                                                 “AccountId”: int?, 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     
Phiên bản 1.4 
“BankAccount”: string, 
“Description”: string, 
“Method”: string, 
“Status”: byte?, 
“StatusValue”: string, 
“TransDate”: DateTime 
}]       
}] 
}] 
} 
2.12. Hóa đơn  
Hiện tại KiotViet hỗ trợ các thiết lập cho tính năng hóa đơn như sau: 
 Trong trường hợp người dùng không tích chọn setting cho “Cho phép bán hàng khi hết tồn kho”, thì 
POST/PUT các API liên quan đến việc bán các sản phẩm đã hết tồn kho,  trả lại thông báo “Thiết lập 
“Cho phép bán hàng khi hết tồn kho” đang không được bật”  
 Trong trường hợp người dùng không tích chọn setting cho “Sử dụng tính năng giao hàng”, các giao 
dịch liên quan tới giao hàng sẽ không hiển thị trên kiotviet nữa. Vì vậy khi gọi các API liên quan tới 
phần giao hàng , cần trả lại thông báo “Thiết lập “Sử dụng tính năng giao hàng”  đang không được 
bật”.  
 Trong trường hợp người dùng tích chọn setting “Sử dụng ính năng giao hàng” nhưng không tích chọn 
setting cho “Quản lý thu hộ tiền”, các giao dịch liên quan tới thu hộ tiền sẽ không hiển thị trên kiotviet 
nữa. Vì vậy khi gọi các API liên quan tới phần thu hộ tiền , cần trả lại thông báo “Thiết lập “Quản lý thu 
hộ tiền”  đang không được bật”.  
 Trong trường hợp người dùng không tích chọn setting cho “Không cho phép thay đổi thời gian bán 
hàng”, khi Post/ Put các API liên quan thời gian bán hàng , trả lại thông báo “Thiết lập “Không cho 
phép thay đổi thời gian bán hàng” đang không được bật”. 
Mô tả chi tiết cho các API hỗ trợ Hóa đơn như sau: 
                                                 
Công ty TNHH Citigo  
65/81 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     
Phiên bản 1.4 
2.12.1. Lấy danh sách hóa đơn 
Mục đích sử dụng: Trả về danh sách hóa đơn theo cửa hàng đã được xác nhận 
Phương thức và URL: GET https://public.kiotapi.com/invoices 
Request: Sử dụng hàm GET với tham số: 
“branchIds”: int[], optional // ID chi nhánh 
“customerIds”: long[], optional // Id khách hàng 
“customerCode”: string //Mã khách hàng 
“status”: int[], optional // Tình trạng đặt hàng 
“includePayment”: Boolean, // có lấy thông tin thanh toán 
“includeOrderDelivery”: Boolean,  
“lastModifiedFrom”: datetime? // thời gian cập nhật 
“pageSize”: int?, // số items trong 1 trang, mặc định 20 items, tối đa 100 items  
“currentItem”: int, 
“lastModifiedFrom”: datetime? // thời gian cập nhật 
“toDate”: datetime? //Thời gian cập nhật cho đến thời điểm toDate 
“orderBy”: string, //Sắp xếp dữ liệu theo trường orderBy (Ví dụ: orderBy=name) 
“pageSize”: int?, // số items trong 1 trang, mặc định 20 items, tối đa 100 items  
“orderDirection”: string, //Sắp xếp kết quả trả về theo: Tăng dần Asc (Mặc định), giảm dần Desc 
“orderId”: long?, // Lọc danh sách hóa đơn theo Id của đơn đặt hàng 
Response:  
{ 
“total”: int, 
“pageSize”: int, 
“data”: [{ 
Công ty TNHH Citigo  
66/81 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  67/81 
 
 “id”: long //Id đặt hàng 
 “code”: string //Mã đặt hàng 
 “purchaseDate”: datetime // Ngày đặt hàng 
 “branchId”: int, //Id chi nhánh 
 “branchName”: string, //Tên chi nhánh 
 “soldById”: long?, 
        “soldByName”: string 
 “customerId”: long?, // Id khách hàng 
        “customerCode”: string, Mã khách hàng 
 “customerName”: string, // Tên khách hàng 
 “total”: decimal, // Khách cần trả 
 “totalPayment”: decimal, //Khách đã trả 
 “status”: int, // trạng thái hóa đơn 
 “statusValue”: string, // trạng thái đơn đặt hàng bằng chữ 
        “usingCod”: boolean,  
       “createdDate”: datetime, //Ngày tạo 
       “modifiedDate”: datetime, //Ngày cập nhật 
     “payments” :[{ 
   “id”: long,  
   “code”: string, 
   “amount”: decimal, 
   “method”: string”, 
   “status”: byte?, 
                       “statusValue”: string, 
                       “transDate”: datetime, 
                       “bankAccount”: string, 
                       “accountId”: int? 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  68/81 
 
  }],  
       "invoiceOrderSurcharges": [        {             
  "id": long,             
  "invoiceId":long?,             
  "surchargeId": long?,             
  "surchargeName": string,             
  "surValue": decimal?,             
  "price": decimal?,             
  "createdDate": DateTime         
  } 
 ],       
 “invoiceDetails” :{ 
   “productId”: long, // Id hàng hóa 
   “productCode”: string,  
   “productName”: string, //Tên hàng hóa  
     (bao gồm thuộc tính và đơn vị tính) 
   “quantity”: double, // Số lượng hàng hóa 
   “price”: decimal, //Giá trị 
   “discountRatio”: double?, // Giảm giá trên sản phẩm 
theo % 
   “discount”: decimal?, // Giảm giá trên sản phẩm theo 
tiền 
 }, 
      “invoiceDelivery”:{ 
  “deliveryCode”: string, 
                “type”: byte?, 
                “price”: Decimal?, 
                “receiver”: string, 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  69/81 
 
                “contactNumber”: string, 
                “address”: string, 
                “locationId”: int?, 
                “locationName”: string, 
   “usingPriceCod”: bool, //Thu hộ tiền 
                “priceCodPayment”: decimal, //Số tiền thu hộ 
                “weight”: double?, 
                “length”: double?, 
                “width”: double?, 
                “height”: double?, 
                “partnerDeliveryId”: long?, 
   “partnerDelivery”:{ 
   “code”: string, 
                       “name”: string, 
                       “address”: string, 
                       “contactNumber”: string, 
                       “email”: string 
  } 
 } 
   }] 
} 
2.12.2. Lấy chi tiết hóa đơn 
Mục đích sử dụng: Trả về thông tin chi tiết của hóa đơn theo ID, theo Code 
Phương thức và URL:  - Theo Id : GET https://public.kiotapi.com/invoices/ {id} - Theo Code : GET https://public.kiotapi.com/invoices/code/ {code} 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  70/81 
 
Request: Sử dụng hàm GET với tham số: 
“id”: long // ID của hóa đơn 
“code”: string // Mã của hóa đơn  
Response:  
{  
 “id”: long //Id hóa đơn 
 “code”: string //Mã hóa đơn 
 “purchaseDate”: datetime // Ngày hóa đơn 
 “branchId”: int, //Id chi nhánh 
 “branchName”: string, //Tên chi nhánh 
 “soldById”: long?, 
        “soldByName”: string 
 “customerId”: long?, // Id khách hàng 
        “customerCode”: string, //Mã khách hàng 
 “customerName”: string, // Tên khách hàng 
 “total”: decimal, // Khách cần trả 
 “totalPayment”: decimal, //Khách đã trả 
 “status”: int, // trạng thái đơn hóa đơn 
 “statusValue”: string, // trạng thái đơn hóa đơn bằng chữ 
 “description”: string, // ghi chú 
        “usingCod”: boolean,  
       “createdDate”: datetime, //Ngày tạo 
       “modifiedDate”: datetime, //Ngày cập nhật 
     “payments” :[{ 
   “id”: long,  
   “code”: string, 
   “amount”: decimal, 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  71/81 
 
   “method”: string, 
   “status”: byte?, 
                       “statusValue”: string, 
                       “transDate”: datetime, 
                       “bankAccount”: string, 
                       “accountId”: int? 
  }],  
       "invoiceOrderSurcharges": [        {             
  "id": long,             
  "invoiceId":long?,             
  "surchargeId": long?,             
  "surchargeName": string,             
  "surValue": decimal?,             
  "price": decimal?,             
  "createdDate": DateTime         
  } 
 ], 
 “invoiceDetails” :{ 
   “productId”: long, // Id hàng hóa 
                       “productCode”: string,  
   “productName”: string, //Tên hàng hóa  
     (bao gồm thuộc tính và đơn vị tính) 
   “quantity”: double, // Số lượng hàng hóa 
   “price”: decimal, //Giá trị 
   “discountRatio”: double?, // Giảm giá trên sản phẩm 
theo % 
   “discount”: decimal?, // Giảm giá trên sản phẩm theo 
tiền 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  72/81 
 
 }, 
      “invoiceDelivery”:{ 
  “deliveryCode”: string, 
                “type”: byte?, 
                “price”: Decimal?, 
                “receiver”: string, 
                “contactNumber”: string, 
                “address”: string, 
                “locationId”: int?, 
                “locationName”: string, 
   “usingPriceCod”: bool, //Thu hộ tiền 
                “priceCodPayment”: decimal, //Số tiền thu hộ 
                “weight”: double?, 
                “length”: double?, 
                “width”: double?, 
                “height”: double?, 
                “partnerDeliveryId”: long?, 
   “partnerDelivery”:{ 
   “code”: string, 
                       “name”: string, 
                       “address”: string, 
                       “contactNumber”: string, 
                       “email”: string 
  } 
 } 
} 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  73/81 
 
2.12.3. Thêm mới hóa đơn 
Mục đích sử dụng: Tạo mới hóa đơn 
Phương thức và URL: POST https://public.kiotapi.com/invoices 
Request: JSON mã hóa yêu cầu gồm 1 object hóa đơn: 
{ 
   “branchId”: int, 
        “purchaseDate”: datetime, 
        “customerId”: long?, 
        “discount”: decimal?, 
        “totalPayment”: decimal, 
        “method”: string, 
        “accountId”: int?, 
        “status”: byte, 
        “usingCod”: bool, 
        “soldById”: long, 
        “orderId”: long?, 
        “invoiceDetails”:[{ 
  “productId”: long, 
               “productCode”: string, 
               “productName”: string, 
               “quantity”: double, 
               “price”: decimal, 
               “discount”: decimal?, 
               “discountRatio”: decimal? 
 }], 
       “deliveryDetail”:{ 
          “deliveryCode”: string, 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  74/81 
 
                “type”: byte?, 
                “price”: Decimal?, 
                “receiver”: string, 
                “contactNumber”: string, 
                “address”: string, 
                “locationId”: int, 
                “locationName”: string, 
                “weight”: double, 
                “length”: double, 
                “width”: double, 
   “usingPriceCod”: bool, //Thu hộ tiền 
                “height”: double, 
                “partnerDeliveryId”: long?, 
   “partnerDelivery”:{ 
   “code”: string, 
                       “name”: string, 
                       “address”: string, 
                       “contactNumber”: string, 
                       “email”: string 
  } 
 } 
} 
Response: 
{       
   “id”: long, 
        “code”: string, 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  75/81 
 
        “purchaseDate”: datetime, 
        “branchId”: int, 
        “branchName”: string, 
        “soldById”: long?, 
        “soldByName”: string, 
        “customerId”: long?, 
        “customerName”: string, 
        “total”: decimal, // Khách cần trả 
 “totalPayment”: decimal, //Khách đã trả 
        “discountRatio”: double?, // Giảm giá trên đơn theo % 
 “discount”: decimal?, // Giảm giá trên đơn theo tiền 
 “method”: string, // Phương thức thanh toán (Cash, Card, Transfer) 
 “status”: int, // trạng thái đơn đặt hàng 
 “statusValue”: string, // trạng thái đơn đặt hàng bằng chữ 
 “description”: string, // ghi chú 
        "usingCod": boolean, 
 “invoiceDetails” :{ 
   “productId”: long, // Id hàng hóa 
   “productName”: string, //Tên hàng hóa  
     (bao gồm thuộc tính và đơn vị tính) 
   “quantity”: double, // Số lượng hàng hóa 
   “price”: decimal, //Giá trị 
   “discountRatio”: double?, // Giảm giá trên sản phẩm 
theo % 
   “discount”: decimal?, // Giảm giá trên sản phẩm theo 
tiền 
 }, 
      “deliveryDetail”:{ 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  76/81 
 
  “deliveryCode”: string, 
                “type”: byte?, 
                “price”: Decimal?, 
                “receiver”: string, 
                “contactNumber”: string, 
                “address”: string, 
                “locationId”: int?, 
                “locationName”: string, 
   “usingPriceCod”: bool, //Thu hộ tiền 
                “priceCodPayment”: decimal, //Số tiền thu hộ                
“weight”: double?, 
                “length”: double?, 
                “width”: double?, 
                “height”: double?, 
                “partnerDeliveryId”: long?, 
   “partnerDelivery”:{ 
   “code”: string, 
                       “name”: string, 
                       “address”: string, 
                       “contactNumber”: string, 
                       “email”: string 
  } 
 }  
} 
2.12.4. Cập nhật hóa đơn 
Mục đích sử dụng: Cập nhật hóa đơn theo ID 
Phương thức và URL: PUT https://public.kiotapi.com/invoices/Id 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  77/81 
 
Request: Sử dụng hàm PUT với ID hóa đơn qua 1 object JSON.  
“id”: long // ID hóa đơn 
Body 
{ 
   “purchaseDate”: datetime 
        “status”: byte, 
        “soldById”: long, 
 “codPaymentMethod”: string, //Phương thức thanh toán thu hộ (Cash, 
Tranfer), 
        “codPaymentAccount”: int?, //Id tài khoản ngân hàng nếu thanh toán 
chuyển khoản, thẻ ngân hàng 
        “deliveryDetail”:{ 
          “deliveryCode”: string, 
                “type”: byte?, 
                “price”: Decimal?, 
                “receiver”: string, 
                “contactNumber”: string, 
                “address”: string, 
                “locationId”: int, 
                “locationName”: string, 
                “weight”: double, 
                “length”: double, 
   “usingPriceCod”: bool, //Thu hộ tiền 
                “priceCodPayment”: decimal, //Số tiền thu hộ 
                “width”: double, 
                “height”: double, 
                “partnerDeliveryId”: long?, 
   “partnerDelivery”:{ 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  78/81 
 
   “code”: string, 
                       “name”: string, 
                       “address”: string, 
                       “contactNumber”: string, 
                       “email”: string 
  } 
 } 
} 
Response: 
{         
 “id”: long, 
        “code”: string, 
        “purchaseDate”: datetime, 
        “branchId”: int, 
        “branchName”: string 
        “soldById”: long?, 
        “soldByName”: string, 
        “customerId”: long?, 
        “customerName”: string, 
        “total”: decimal, // Khách cần trả 
 “totalPayment”: decimal, //Khách đã trả 
        “discountRatio”: double?, // Giảm giá trên đơn theo % 
 “discount”: decimal?, // Giảm giá trên đơn theo tiền 
 “method”: string, // Phương thức thanh toán (Cash, Card, Transfer) 
 “status”: int, // trạng thái đơn đặt hàng 
 “statusValue”: string, // trạng thái đơn đặt hàng bằng chữ 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  79/81 
 
 “description”: string, // ghi chú 
        "usingCod": boolean, 
 “invoiceDetails” :{ 
   “productId”: long, // Id hàng hóa 
   “productName”: string, //Tên hàng hóa  
     (bao gồm thuộc tính và đơn vị tính) 
   “quantity”: double, // Số lượng hàng hóa 
   “price”: decimal, //Giá trị 
   “discountRatio”: double?, // Giảm giá trên sản phẩm 
theo % 
   “discount”: decimal?, // Giảm giá trên sản phẩm theo 
tiền 
 }, 
      “deliveryDetail”:{ 
  “deliveryCode”: string, 
                “type”: byte?, 
                “price”: Decimal?, 
                “receiver”: string, 
                “contactNumber”: string, 
                “address”: string, 
                “locationId”: int?, 
                “locationName”: string, 
   “usingPriceCod”: bool, //Thu hộ tiền 
                “priceCodPayment”: decimal, //Số tiền thu hộ 
                “weight”: double?, 
                “length”: double?, 
                “width”: double?, 
                “height”: double?, 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  80/81 
 
                “partnerDeliveryId”: long?, 
   “partnerDelivery”:{ 
   “code”: string, 
                       “name”: string, 
                       “address”: string, 
                       “contactNumber”: string, 
                       “email”: string 
  } 
 }   
} 
 
2.12.5. Xóa hóa đơn 
Mục đích sử dụng: Xóa hóa đơn theo ID 
Phương thức và URL: DELETE https://public.kiotapi.com/invoices/{id} 
Request: Gồm Id của hóa đơn trong URL: 
“id”: long // ID của hóa đơn 
Response: Trả lại thông tin xóa thành công (Code 200) 
{ 
   "message": "Xóa dữ liệu thành công" 
} 
 
2.13. Nhóm khách hàng 
2.13.1. Lấy danh sách nhóm khách hàng 
Mục đích sử dụng:  lấy danh sách nhóm khách hàng 
Tài liệu hướng dẫn sử dụng Public API                                                                                                     Phiên bản 1.4 
 
Công ty TNHH Citigo  81/81 
 
Phương thức và URL: GET https://public.kiotapi.com/customers/group 
Response:  
{ 
    "total": int // Tổng danh sách nhóm     
    "data": [ 
        { 
            "id": int // Id nhóm khách hàng 
            "name": string // Tên nhóm khách hàng, 
            "description": string // Ghi chú, 
            "createdDate": DateTime // Ngày tạo, 
            "createdBy": long // Id người tạo, 
            "retailerId": int // Id chi nhánh, 
            "discount": decimal? // Giảm giá, 
        "customerGroupDetails": [ 
            { 
                "id": long // Id Chi tiết nhóm khách hàng 
                "customerId": long // Id khách hàng 
                "groupId": int // Id nhóm khách hàng 
            }           
          ]             
        }] 
} 
 
 