<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar color="primary" dark>
      <v-app-bar-nav-icon @click="toggleDrawer"></v-app-bar-nav-icon>
      <v-app-bar-title>Devices and Devices' Information</v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer app color="secondary" dark v-model="drawer">
      <v-list>
        <v-list-item v-for="(item, index) in items" :key="index" @click="changeContent(index)" class="white--text"
          @contextmenu.prevent="onRightClick(index)">
          <v-list-item-title>{{ item }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container fluid class="pa-4">
        <v-row>
          <!-- Monitoring Data Card -->
          <v-col cols="12" sm="4">
            <v-card elevation="20" >
              <v-card-title>
                <h2 class="text-center text-h5">Monitoring Data</h2>
              </v-card-title>
              <v-divider></v-divider>
              <v-list>
                <v-list-item @click="changeChartData(key)" v-for="(key, index) in nowKeys" :key="key">
                  <v-list-item-icon>
                    <v-icon color="primary">mdi-chart-box</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>
                      <strong>{{ key }}:</strong> {{ nowValues[index].Value || 'N/A' }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
          <v-col cols="12" sm="8">
            <lineChart :historyData = "Array.isArray(nowValues) && nowValues.length === 0 ? [] : nowValues[nowChartDataId]?.history" :kind = "nowKeys[nowChartDataId]"></lineChart>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Device Information Dialog -->
    <v-dialog v-model="dialogVisible" max-width="500">
      <v-card>
        <v-card-title>
          <span class="headline">Device Information</span>
        </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title><strong>ID:</strong> {{ dialogDeviceInfo.ClientID }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title><strong>ConnectionTime:</strong> {{ dialogDeviceInfo.ConnectionTime }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title><strong>IPAddress:</strong> {{ dialogDeviceInfo.IPAddress }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title><strong>SessionActive:</strong> {{ dialogDeviceInfo.SessionActive }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title><strong>Username:</strong> {{ dialogDeviceInfo.Username }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary"  @click="dialogVisible = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>


</template>



<script lang="ts">
export default {
  name: 'App',
}
</script>

<script setup lang="ts">
import { ref, onMounted, toRaw } from 'vue'
import axios, { AxiosError } from 'axios'
import { type deviceData, type deviceInfo } from '@/types'
import lineChart from './components/lineChart.vue';//注意一个问题就是，当使用语法糖的时候,import 了lineschart,其就自动帮你注册了
import type { List } from 'echarts';
import { get } from 'node_modules/axios/index.cjs';

//这两个是最开始提取的全部数据
let devices: deviceInfo[] = []
let devicesData: deviceData[] = []
//这个主要是用于存储中间值，以此避免对devicesData的清空导致出错
let tempDeviceData : deviceData[] = [] 

//nowData是包括key和value的一个对象，而nowkeys和nowValues则为键和值，deviceInfo为设备的具体信息
let nowData = ref({})
let nowKeys = ref<string[]>([])
let nowValues = ref<{ UpdateTime: string, Value: string, history:{Updatetime:string, value:number}[]}[]>([{ UpdateTime: "", Value: "" , history: []}])
let deviceInfo = ref<deviceInfo>({ ClientID: "", ConnectionTime: "", IPAddress: "", SessionActive: 0, Username: "" })

let items:string[] = []
let t_items:string[] = []

//用于控制侧边栏的显示
const drawer = ref(true);

//用于控制设备信息的显示
const dialogVisible = ref(false);
const dialogDeviceInfo = ref<deviceInfo>({ ClientID: "", ConnectionTime: "", IPAddress: "", SessionActive: 0, Username: "" })
// 用于指示当前应该向图表中传入哪一项指标的数据
const nowChartDataId = ref(0) 

//用于记录当前在哪个device
let nowId = 0


function toggleDrawer() {
  drawer.value = !drawer.value;
}

//提取数据
async function getData() {
  try {
    let data = await axios.get('/api/devices')
    devices = data.data
    //console.log(devices)
    
    //
    t_items = []
    for(let i = 0; i < devices.length; i++){
      t_items.push("device" + String(i))
    }  
    items= t_items

    tempDeviceData = []
    for (let i = 0; i < devices.length; i++) {
      let monitor_info = await axios.get('/api/sensors?ClientID=' + devices[i].ClientID)
      tempDeviceData.push(monitor_info.data)
    }
    devicesData = tempDeviceData
    //console.log(devicesData)
    //console.log(nowId)
    dataChange(nowId)

  } catch (error) {
    const err = <AxiosError>error
    console.log(err.message)
  }
}

onMounted(() => {
  getData()
  setInterval(getData, 2000)
})

//点击按钮，切换数据
function changeContent(id: number) {
  if(Object.keys(devicesData[id]).length == 0){
    nowKeys.value = []
    nowValues.value = []
    deviceInfo.value = devices[id]
    nowId = id
    return
  }
  nowData.value = devicesData[id];
  nowKeys.value = Object.keys(nowData.value)
  nowValues.value = Object.values(nowData.value)
  deviceInfo.value = devices[id]
  nowId = id
}

//这个函数是每隔一段时间，就把数据刷新一次
function dataChange(nowId:number){
  console.log(nowId)
  console.log(devicesData)
  nowData.value = devicesData[nowId];
  nowKeys.value = Object.keys(nowData.value)
  nowValues.value = Object.values(nowData.value)
}



//右键弹出设备信息
function onRightClick(index: number) {
  dialogDeviceInfo.value = devices[index];
  dialogVisible.value = true;
  console.log(dialogDeviceInfo.value)
}

//这个是用来改变图表可视化的信息的
function changeChartData(key:string){
  nowChartDataId.value = nowKeys.value.indexOf(key)
  console.log(nowChartDataId.value)
}
</script>