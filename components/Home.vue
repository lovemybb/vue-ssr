<template>
  <div>
    <div class="title" @click="gotoPath('/')">首页</div>
    <div class="title" @click="gotoPath('/list')">列表</div>
    <div class="title" @click="gotoPath('/unit')">单元</div>
    <div class="title" @click="gotoPath('/video')">视频</div>
  </div>
</template>

<script>
export default {
  name: "home",
  asyncData({ store, route }) {
    //服务端执行
    return store.commit("setAsyncDataRun", { name: "home" });
  },
  mounted() {
    if (this.$store.state.asyncDataRuns.indexOf("home") == -1) {
      //如果服务器端渲染失败，降级到客户端渲染
      this.getData();
    }
  },
  methods: {
    gotoPath(path) {
      console.log(path, this.$store.state.asyncDataRuns);
      this.$router.push({
        path
      });
    },
    getData() {
      console.log("客户端获取数据渲染");
      return new Promise((resolve, reject) => {
        resolve({ name: "ddd" });
      });
    }
  }
};
</script>

<style>
.title {
  color: blue;
  cursor: pointer;
}
</style>