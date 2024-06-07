const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3000;

const connection = mysql.createConnection({
  host: '206.189.93.101',
  user: 'medidba',
  password: 'MeDiSeeSdba?',
  database: 'clinic_dev' 
});

connection.connect((err) => {
  if (err) {
    console.error('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + err.stack);
    return;
  }

  console.log('เชื่อมต่อกับฐานข้อมูล MySQL เรียบร้อยแล้ว');
});



app.get('/get-next-code', (req, res) => {
  const nextIdcodeSql = 'SELECT * FROM clinic_code WHERE idcode > ? AND status_get_code = 0 ORDER BY idcode ASC LIMIT 1';
  connection.query(nextIdcodeSql, [3], (error, nextIdcodeResults, fields) => {
    if (error) {
      console.error('เกิดข้อผิดพลาดในการดึง idcode ถัดไป: ' + error.stack);
      res.json({ success: false, message: 'Error fetching next code.' });
      return;
    }

    if (nextIdcodeResults.length > 0) {
      const nextIdcode = nextIdcodeResults[0].idcode;
      const row = nextIdcodeResults[0];
      console.log('code', row.code);

      const updateNextIdcodeSql = 'UPDATE clinic_code SET status_get_code = 1 WHERE idcode = ?';
      connection.query(updateNextIdcodeSql, [nextIdcode], (error, updateNextIdcodeResults, fields) => {
        if (error) {
          console.error('เกิดข้อผิดพลาดในการอัปเดต idcode ถัดไป: ' + error.stack);
          res.json({ success: false, message: 'Error updating next code.' });
          return;
        }
        console.log('อัปเดตสถานะสำเร็จสำหรับ idcode ถัดไป:', nextIdcode);
        res.json({ success: true, code: row.code });
      });
    } else {
      console.log('ไม่พบ idcode ถัดไปที่เป็นไปตามเงื่อนไข');
      res.json({ success: false, message: 'No next code found.' });
    }
  });
});

// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });