# JRender Plus

[![Netlify Status](https://api.netlify.com/api/v1/badges/9daad24a-1636-4148-8f4e-34c6ab2eea49/deploy-status)](https://app.netlify.com/sites/jrender-plus/deploys)

## Quick Start

## 学习交流

### question

如何实现 for 表达式语句？

机制已经在这里实现 src/components/Render/index.ts (line:52)

但不能像 vue 里那样灵活

```yaml
component: el-radio-group
formItem:
  label: radio
model: model.sel
children:
  - component: el-radio
    for: (item, index) in tabledata.data # 这里的功能
    props:
    label: $:item.name
    children:
      - component: span
        props:
        innerText: $:item.remark
```
