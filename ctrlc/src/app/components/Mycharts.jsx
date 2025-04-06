import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const MyChart = ({ option ,style}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);

    // ตั้งค่า option ของกราฟ
    chartInstance.current.setOption(option);

     // Delay resize after rendering
     setTimeout(() => {
        if (chartInstance.current) {
          chartInstance.current.resize();
        }
      }, 1000)
    // ฟังก์ชัน resize เมื่อขนาด div เปลี่ยน
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current.dispose(); // เคลียร์ instance เมื่อ component ถูก unmount
    };
  }, [option]);

  return <div ref={chartRef} style={{ width: '100%', ...style }} />;
};

export default MyChart;
