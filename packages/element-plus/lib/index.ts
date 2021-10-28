export default ({ onBeforeRender }) => {
  // 外套表单项
  onBeforeRender(() => (field, next) => {
    if (!field?.formItem) {
      return next(field)
    }

    const formItem = field.formItem
    const condition = field.condition

    delete field.formItem
    delete field.condition

    return next({
      component: 'el-form-item',
      condition,
      props: formItem,
      children: [field],
    })
  })

  // 渲染控制
  onBeforeRender(() => (field, next) => {
    if (field?.rel !== true) {
      return next(field)
    }

    let counter = 3

    next({ component: 'span', props: { innerText: `Loading (${counter + 1})` } })

    const timer = setInterval(() => {
      if (counter > 0) {
        next({ component: 'span', props: { innerText: `Loading (${counter})` } })
        counter--
      } else {
        clearInterval(timer)
        next(field)
      }
    }, 1000)
  })
}
