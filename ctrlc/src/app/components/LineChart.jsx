import React from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

const SimpleAreaChart = ({ data }) => {
  const option = {
    grid: {
      top: 0,
      bottom: 0,
      left: 10,
      right: 10,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        const point = data[params[0].dataIndex];
        return `${point.name}: ${point.value}`;
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map((point) => point.name),
      axisLabel: {
        show: false,
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        show: false,
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      }
    },
    series: [
      {
        type: 'line',
        data: data.map(point => point.value),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: 'rgb(129, 255, 192)',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgb(129, 255, 192)' },
            { offset: 1, color: 'rgba(255, 255, 255, 0)' }
          ])
        },
        emphasis: {
          itemStyle: {
            opacity: 0
          }
        }
      }
    ]
  };

  return (
    <ReactECharts 
      option={option} 
      style={{ height: '100%', width: '100%', margin: 0, padding: 0 }} 
    />
  );
};

export default SimpleAreaChart;