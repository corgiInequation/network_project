<template>
  <div id="main" style="width: 100%; display: flex; justify-content: center; align-items: center; height: 800px;"></div>
</template>

<script lang="ts" setup>
import * as echarts from 'echarts';
import { dataColorPaletteTask } from 'echarts/types/src/visual/style.js';
 // 基于准备好的dom，初始化echarts实例
import { onMounted, toRaw, watch, defineProps, ref } from 'vue';

const chartData = defineProps(['historyData', 'kind'])


var x_data = [1,2,3,4,5,6,7,8,9,10, 11,12,13,14,15,16,17,18,19,20]
var y_data:number[] = [1,2,3,4,5,6,7,8,9,10, 11,12,13,14,15,16,17,18,19,20]
var t_data:number[] = []
var has_alert = 0 // 避免反复弹出警告窗口
const test_val = ref(0)


// 设置图表的配置项和数据
var option = {
title: {
    text: '检测数据可视'
},
tooltip: {
    trigger: 'axis'
},
legend: {
    data: ["6666"]
},
xAxis: {
    type: 'category',
    boundaryGap: false,
    data:x_data,
},
yAxis: {
    type: 'value',
    min: 0,
    max: 0
},
series: [
    {
    name: "666",
    type: 'line',
    data:  y_data
    }
]
};



function changeScale(kind:string){
    if(kind == "Altitude"){
        option.yAxis.min = 78
        option.yAxis.max = 79
    }
    else if(kind == "Humidity"){
        option.yAxis.min = 0
        option.yAxis.max = 1
    }
    else if(kind == "Lux"){
        option.yAxis.min = 750
        option.yAxis.max = 753
    }
    else if(kind == "Pressure"){
        option.yAxis.min = 102250
        option.yAxis.max = 102280
    }
    else if(kind == "Raw Ethanol"){
        option.yAxis.min = 18380
        option.yAxis.max = 18420
    }
    else if(kind == "Raw H2"){
        option.yAxis.min = 13420
        option.yAxis.max = 13470
    }
    else if(kind == "Sound"){
        option.yAxis.min = 50
        option.yAxis.max = 80
    }
    else if(kind == "TVOC"){
        option.yAxis.min = 120
        option.yAxis.max = 150
    }
    else if(kind == "Temperature"){
        option.yAxis.min = 20
        option.yAxis.max = 35
    }
    else if(kind == "eCO2"){
        option.yAxis.min = 390
        option.yAxis.max = 410
    }
    else if(kind == "Sealevel Pressure"){
        option.yAxis.min = 102250
        option.yAxis.max = 102280
    }
    else{
        option.yAxis.min = 0
        option.yAxis.max = 0
    }
}

onMounted(() => {
    //这个var不能写在外面，因为main还没挂载，getElementById会出错
    var myChart = echarts.init(document.getElementById('main'));
    function updateChartData(){
        t_data = []
        //还需要考虑到仪器关闭的情况
        if(toRaw(chartData.historyData).length < 20){
            if(!has_alert){
                alert("此仪器已经停止工作")
                has_alert = 1
            }
            option.series[0].data = [0]
            myChart.setOption(option);
            return
        }
        
        has_alert = 0
        for(let i = 0; i < 20; i++){
            t_data.push(toRaw(chartData.historyData[i]).Value)
        }
        //改变显示的数据
        y_data = t_data
        y_data = y_data.map(num => parseFloat(num.toFixed(3)));
        option.series[0].data = y_data
        option.xAxis.data = x_data


        changeScale(toRaw(chartData.kind))
        let max_val = Math.max(...y_data)
        let min_val = Math.min(...y_data)
        if(max_val > option.yAxis.max){
            option.yAxis.max = max_val
        }
        if(min_val < option.yAxis.min){
            option.yAxis.min = min_val
        }
        option.legend.data = [toRaw(chartData.kind)]
        option.series[0].name = toRaw(chartData.kind)
        option.title.text = toRaw(chartData.kind)
        myChart.setOption(option);
        return
    }
    // 使用刚指定的配置项和数据显示图表
    myChart.setOption(option);
    watch(chartData, updateChartData)
});


</script>

