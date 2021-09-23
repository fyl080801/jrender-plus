<template>
  <div class="absolute h-full w-full flex flex-col">
    <nav class="flex items-center justify-between flex-wrap bg-blue-500 p-6">
      <div class="flex items-center flex-shrink-0 text-white mr-6">
        <span class="font-semibold text-xl tracking-tight">JRender+</span>
      </div>
      <div class="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
        <div class="text-sm lg:flex-grow">
          <a
            class="
              block
              mt-4
              lg:inline-block lg:mt-0
              text-teal-200
              hover:text-white
              mr-4
              cursor-pointer
            "
          >
            Simple
          </a>
          <a
            class="
              block
              mt-4
              lg:inline-block lg:mt-0
              text-teal-200
              hover:text-white
              mr-4
              cursor-pointer
            "
          >
            Table
          </a>
          <a
            class="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white cursor-pointer"
          >
            Other
          </a>
        </div>
        <div></div>
      </div>
    </nav>
    <div class="flex-1 overflow-hidden">
      <router-view></router-view>
    </div>
  </div>
</template>

<style>
html,
body {
  padding: 0;
  margin: 0;
  font-size: 12px;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
