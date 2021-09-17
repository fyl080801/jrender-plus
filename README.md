# 学习交流

## question

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
      label: $:scope.item.name
      children:
        - component: span
          props:
          innerText: $:scope.item.remark
```
