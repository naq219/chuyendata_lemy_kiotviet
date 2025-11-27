sửa . thêm button "Chuyển NCC Ship" ngay cạnh button chuyển trạng thái. 
khi click thì hiển thị dialog cho upload image hoặc paste image vào  và convert thành webp. kích thước ảnh không vượt quá 2000px . 
có button upload :
upload thì call api: curl --location '' \
--header 'Content-Type: application/json' \
--data '{
  "project": "my-project",
  "filename": "screenshot3.png",
  "provider": "github",
  "image": "base64"
}'

upload thành công thì response :
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": "9qn0dzhomlr39cr",
    "project": "my-project",
    "filename": "screenshot2.png",
    "provider": "github",
    "url": "",
    "sha": "d8ad5fb017e9004268923b13fdf3252bd2af3853",
    "created": "2025-11-27 16:21:18.986Z"
  }
}
lỗi
{
  "success": false,
  "message": "Invalid base64 image data",
  "code": 400
}
upload mà thành công thì insert và lemyde :
table `ncc_ship` (
  `order_id` id đơn hàng ở table orders
  `ncc_id` : set cứng luôn là 1 
  `ncc_name` set cứng luôn là mgs
  `total_amount` INT(11) NOT NULL DEFAULT 0 COMMENT 'Tổng tiền',
  `money_received` INT(11) DEFAULT 0 COMMENT 'Tiền đã nhận',
  `free_ship` TINYINT(4) NOT NULL DEFAULT 0 COMMENT '0 = thu phí ship, 1 = miễn phí ship',
  `nccsstatus` set cứng luôn là 1 
  `note` TEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ghi chú',
  `details` là thông tin sản phẩm . ví dụ: {"products": [{"product_id": 101, "name": "Sản phẩm A", "quantity": 10, "gia_ban": 300000,"gia_nhap": 200000}, {"product_id": 102, "name": "Sản phẩm B", "quantity": 5, "gia_ban": 500000,"gia_nhap": 400000}]} 
   `ncc_bill_image` là url vừa upload 
   `ncc_orderid` có edittext để nhập vào 

call api connnect.lemyde.com để insert vào table `ncc_ship`  (xem các chức năng tương tự đã dùng )
