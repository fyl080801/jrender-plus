import {
  defineComponent,
  computed,
  toRaw,
  markRaw,
  ref,
  watch,
  h,
  resolveComponent,
  onMounted,
  onUpdated,
  getCurrentInstance,
} from 'vue'
import { assignObject } from '../utils/helper'
import { useJRender } from '../utils/mixins'
import { pipeline } from '../utils/pipeline'
import { isOriginTag } from '../utils/domTags'
import { getProxyDefine, injectProxy } from '../utils/proxy'
import JSlot from './JSlot'

const JNode = defineComponent({
  name: 'JNode',
  props: {
    field: Object,
    scope: { type: Object, default: () => ({}) },
    context: Object,
  },
  setup(props, ctx) {
    const { proxy } = getCurrentInstance()
    const { services, slots } = useJRender()

    const sharedServices = {
      context: props.context,
      scope: props.scope,
      props: { field: toRaw(props.field) },
      services,
      injector: (target) => {
        return injector(target)
      },
      render: () => {
        render(sharedServices.props.field)
      },
    }

    const injector = injectProxy({
      context: props.context,
      scope: props.scope,
      proxy: services.proxy.map((p) => p({ functional: services.functional })),
    })

    const renderField = ref()

    const renderSlots = computed<any>(() => {
      if (!renderField.value) {
        return []
      }

      const result =
        Object.entries(
          renderField.value.children?.reduce((target, child) => {
            const slotName = child?.slot || 'default'
            target[slotName] ||= []
            target[slotName].push(child)
            return target
          }, {}) || {},
        ) || []

      return result.reduce((target, item: any) => {
        target[item[0]] = (scope) => {
          return item[1].map((field, index) => {
            return h(JNode, {
              key: field.key || index,
              scope: assignObject(props.scope, scope),
              field: getProxyDefine(field),
              context: props.context,
            })
          })
        }
        return target
      }, {})
    })

    const render = pipeline(
      ...[
        ...services.beforeBindHandlers.map((item) => item.handler),
        () => (field, next) => {
          if (field?.component !== 'slot') {
            return next(field)
          }

          next({
            component: markRaw(JSlot),
            props: {
              renderSlot: () => {
                const renderer = slots[field.name || 'default']
                return typeof renderer === 'function' && renderer(field.scope || {})
              },
            },
          })
        },
        () => (field, next) => {
          next(injector(field))
        },
        ...services.bindHandlers.map((item) => item.handler),
        () => (field, next) => {
          next(field)
          renderField.value = field
        },
      ].map((provider) => provider(sharedServices)),
    )

    watch(
      () => props.field,
      (value) => {
        if (value) {
          sharedServices.props.field = toRaw(value)
          render(sharedServices.props.field)
        }
      },
    )

    onMounted(() => {
      if (renderField.value?.ref) {
        // eslint-disable-next-line vue/no-mutating-props
        props.context.refs[renderField.value.ref] = proxy.$refs[renderField.value.ref]
      }

      render(sharedServices.props.field)

      ctx.emit('rendered')
    })

    onUpdated(() => {
      if (renderField.value?.ref) {
        // eslint-disable-next-line vue/no-mutating-props
        props.context.refs[renderField.value.ref] = proxy.$refs[renderField.value.ref]
      }
    })

    return () => {
      if (!renderField.value || !renderField.value.component) {
        return
      }
      return h(
        services.components[renderField.value.component] ||
          (typeof renderField.value.component === 'string'
            ? isOriginTag(renderField.value.component)
              ? renderField.value.component
              : resolveComponent(renderField.value.component)
            : getProxyDefine(renderField.value.component)),
        renderField.value.props,
        renderSlots.value,
      )
    }
  },
})

export default JNode
