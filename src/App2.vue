<template>
    <v-container>
      <v-card>
        <v-card-title>
          折线图示例
        </v-card-title>
        <v-card-text>
          <div style="height: 400px;">
          <lineChart></lineChart>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
</template>
  
<script lang = "ts" setup>
import lineChart from './components/lineChart.vue';

</script>

<style scoped>
/* 您可以在此添加自定义样式 */
</style>
  