# ใช้ base image Python
FROM python:3.10

# กำหนด working directory
WORKDIR /app

# คัดลอกไฟล์ requirements.txt ไปยัง container
COPY requirements.txt .


# ติดตั้งไลบรารีที่ระบุใน requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# คัดลอกโค้ดทั้งหมดไปยัง container
COPY . .

# เปิด port 5555 (สำหรับ ZeroMQ)
EXPOSE 8888 9999

# กำหนดคำสั่งเริ่มต้น container
CMD ["python", "python_server.py"]