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
  methods: {
    gotoPath(path) {
      console.log(path);
      this.$router.push({
        path
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