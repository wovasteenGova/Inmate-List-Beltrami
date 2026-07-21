import * as vue from 'vue';
import { defineComponent, ref, computed, watch, unref, isRef, withCtx, createVNode, toDisplayString, useSlots, mergeProps, renderSlot, openBlock, createBlock, createCommentVNode, createTextVNode, Fragment, renderList, toRefs, withKeys, nextTick, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrRenderSlot } from 'vue/server-renderer';
import { m as publicAssetsURL, M as isEqual } from '../_/nitro.mjs';
import { _ as _export_sfc, f as useComponentProps, g as useAppConfig, h as useForwardProps, t as tv, j as get, k as _sfc_main$d, c as useForwardExpose, P as Primitive, b as injectConfigProviderContext, d as createContext, e as Presence_default, i as isNullish, l as useRuntimeConfig } from './server.mjs';
import { reactivePick, useVModel, useEventListener } from '@vueuse/core';
import 'cheerio';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:fs';
import 'node:path';
import 'vue-router';
import '@iconify/vue';
import 'tailwindcss/colors';
import '@vueuse/shared';
import 'tailwind-variants';
import '@iconify/utils/lib/css/icon';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';

function isValueEqualOrExist(base, current) {
  if (isNullish(base)) return false;
  if (Array.isArray(base)) return base.some((val) => isEqual(val, current));
  else return isEqual(base, current);
}
const ignoredElement = ["INPUT", "TEXTAREA"];
function useArrowNavigation(e, currentElement, parentElement, options = {}) {
  if (!currentElement || options.enableIgnoredElement && ignoredElement.includes(currentElement.nodeName)) return null;
  const { arrowKeyOptions = "both", attributeName = "[data-reka-collection-item]", itemsArray = [], loop = true, dir = "ltr", preventScroll = true, focus = false } = options;
  const [right, left, up, down, home, end] = [
    e.key === "ArrowRight",
    e.key === "ArrowLeft",
    e.key === "ArrowUp",
    e.key === "ArrowDown",
    e.key === "Home",
    e.key === "End"
  ];
  const goingVertical = up || down;
  const goingHorizontal = right || left;
  if (!home && !end && (!goingVertical && !goingHorizontal || arrowKeyOptions === "vertical" && goingHorizontal || arrowKeyOptions === "horizontal" && goingVertical)) return null;
  const allCollectionItems = parentElement ? Array.from(parentElement.querySelectorAll(attributeName)) : itemsArray;
  if (!allCollectionItems.length) return null;
  if (preventScroll) e.preventDefault();
  let item = null;
  if (goingHorizontal || goingVertical) {
    const goForward = goingVertical ? down : dir === "ltr" ? right : left;
    item = findNextFocusableElement(allCollectionItems, currentElement, {
      goForward,
      loop
    });
  } else if (home) item = allCollectionItems.at(0) || null;
  else if (end) item = allCollectionItems.at(-1) || null;
  if (focus) item?.focus();
  return item;
}
function findNextFocusableElement(elements, currentElement, options, iterations = !elements.includes(currentElement) ? elements.length + 1 : elements.length) {
  if (--iterations === 0) return null;
  const index = elements.indexOf(currentElement);
  let newIndex;
  if (index === -1) newIndex = options.goForward ? 0 : elements.length - 1;
  else newIndex = options.goForward ? index + 1 : index - 1;
  if (!options.loop && (newIndex < 0 || newIndex >= elements.length)) return null;
  const adjustedNewIndex = (newIndex + elements.length) % elements.length;
  const candidate = elements[adjustedNewIndex];
  if (!candidate) return null;
  const isDisabled = candidate.hasAttribute("disabled") && candidate.getAttribute("disabled") !== "false";
  if (isDisabled) return findNextFocusableElement(elements, candidate, options, iterations);
  return candidate;
}
function useDirection(dir) {
  const context = injectConfigProviderContext({ dir: ref("ltr") });
  return computed(() => dir?.value || context.dir?.value || "ltr");
}
let count = 0;
function useId(deterministicId, prefix = "reka") {
  let id;
  const configProviderContext = injectConfigProviderContext({ useId: void 0 });
  if (configProviderContext.useId) id = configProviderContext.useId();
  else if ("useId" in vue) id = vue.useId?.();
  else id = `${++count}`;
  return prefix ? `${prefix}-${id}` : id;
}
const [injectCollapsibleRootContext, provideCollapsibleRootContext] = /* @__PURE__ */ createContext("CollapsibleRoot");
var CollapsibleRoot_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "CollapsibleRoot",
  props: {
    defaultOpen: {
      type: Boolean,
      required: false,
      default: false
    },
    open: {
      type: Boolean,
      required: false,
      default: void 0
    },
    disabled: {
      type: Boolean,
      required: false
    },
    unmountOnHide: {
      type: Boolean,
      required: false,
      default: true
    },
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false
    }
  },
  emits: ["update:open"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const open = useVModel(props, "open", emit, {
      defaultValue: props.defaultOpen,
      passive: props.open === void 0
    });
    const { disabled, unmountOnHide } = toRefs(props);
    provideCollapsibleRootContext({
      contentId: "",
      disabled,
      open,
      unmountOnHide,
      onOpenToggle: () => {
        if (disabled.value) return;
        open.value = !open.value;
      }
    });
    __expose({ open });
    useForwardExpose();
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(Primitive), {
        as: _ctx.as,
        "as-child": props.asChild,
        "data-state": unref(open) ? "open" : "closed",
        "data-disabled": unref(disabled) ? "" : void 0
      }, {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default", { open: unref(open) })]),
        _: 3
      }, 8, [
        "as",
        "as-child",
        "data-state",
        "data-disabled"
      ]);
    };
  }
});
var CollapsibleRoot_default = CollapsibleRoot_vue_vue_type_script_setup_true_lang_default;
var CollapsibleContent_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  inheritAttrs: false,
  __name: "CollapsibleContent",
  props: {
    forceMount: {
      type: Boolean,
      required: false
    },
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false
    }
  },
  emits: ["contentFound"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const rootContext = injectCollapsibleRootContext();
    rootContext.contentId ||= useId(void 0, "reka-collapsible-content");
    const presentRef = ref();
    const { forwardRef, currentElement } = useForwardExpose();
    const width = ref(0);
    const height = ref(0);
    const isOpen = computed(() => rootContext.open.value);
    const isMountAnimationPrevented = ref(isOpen.value);
    const currentStyle = ref();
    watch(() => [isOpen.value, presentRef.value?.present], async () => {
      await nextTick();
      const node = currentElement.value;
      if (!node) return;
      currentStyle.value = currentStyle.value || {
        transitionDuration: node.style.transitionDuration,
        animationName: node.style.animationName
      };
      node.style.transitionDuration = "0s";
      node.style.animationName = "none";
      const rect = node.getBoundingClientRect();
      height.value = rect.height;
      width.value = rect.width;
      if (!isMountAnimationPrevented.value) {
        node.style.transitionDuration = currentStyle.value.transitionDuration;
        node.style.animationName = currentStyle.value.animationName;
      }
    }, { immediate: true });
    const skipAnimation = computed(() => isMountAnimationPrevented.value && rootContext.open.value);
    useEventListener(currentElement, "beforematch", (ev) => {
      requestAnimationFrame(() => {
        rootContext.onOpenToggle();
        emits("contentFound");
      });
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(Presence_default), {
        ref_key: "presentRef",
        ref: presentRef,
        present: _ctx.forceMount || unref(rootContext).open.value,
        "force-mount": true
      }, {
        default: withCtx(({ present }) => [createVNode(unref(Primitive), mergeProps(_ctx.$attrs, {
          id: unref(rootContext).contentId,
          ref: unref(forwardRef),
          "as-child": props.asChild,
          as: _ctx.as,
          hidden: !present ? unref(rootContext).unmountOnHide.value ? "" : "until-found" : void 0,
          "data-state": skipAnimation.value ? void 0 : unref(rootContext).open.value ? "open" : "closed",
          "data-disabled": unref(rootContext).disabled?.value ? "" : void 0,
          style: {
            [`--reka-collapsible-content-height`]: `${height.value}px`,
            [`--reka-collapsible-content-width`]: `${width.value}px`
          }
        }), {
          default: withCtx(() => [(unref(rootContext).unmountOnHide.value ? present : true) ? renderSlot(_ctx.$slots, "default", { key: 0 }) : createCommentVNode("v-if", true)]),
          _: 2
        }, 1040, [
          "id",
          "as-child",
          "as",
          "hidden",
          "data-state",
          "data-disabled",
          "style"
        ])]),
        _: 3
      }, 8, ["present"]);
    };
  }
});
var CollapsibleContent_default = CollapsibleContent_vue_vue_type_script_setup_true_lang_default;
var CollapsibleTrigger_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "CollapsibleTrigger",
  props: {
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false,
      default: "button"
    }
  },
  setup(__props) {
    const props = __props;
    useForwardExpose();
    const rootContext = injectCollapsibleRootContext();
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(Primitive), {
        type: _ctx.as === "button" ? "button" : void 0,
        as: _ctx.as,
        "as-child": props.asChild,
        "aria-controls": unref(rootContext).contentId,
        "aria-expanded": unref(rootContext).open.value,
        "data-state": unref(rootContext).open.value ? "open" : "closed",
        "data-disabled": unref(rootContext).disabled?.value ? "" : void 0,
        disabled: unref(rootContext).disabled?.value,
        onClick: unref(rootContext).onOpenToggle
      }, {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 8, [
        "type",
        "as",
        "as-child",
        "aria-controls",
        "aria-expanded",
        "data-state",
        "data-disabled",
        "disabled",
        "onClick"
      ]);
    };
  }
});
var CollapsibleTrigger_default = CollapsibleTrigger_vue_vue_type_script_setup_true_lang_default;
function validateProps({ type, defaultValue, modelValue }) {
  const value = modelValue || defaultValue;
  const canTypeBeInferred = modelValue !== void 0 || defaultValue !== void 0;
  if (canTypeBeInferred) return Array.isArray(value) ? "multiple" : "single";
  else return type ?? "single";
}
function getDefaultType({ type, defaultValue, modelValue }) {
  if (type) return type;
  return validateProps({
    type,
    defaultValue,
    modelValue
  });
}
function getDefaultValue({ type, defaultValue }) {
  if (defaultValue !== void 0) return defaultValue;
  return type === "single" ? void 0 : [];
}
function useSingleOrMultipleValue(props, emits) {
  const type = computed(() => getDefaultType(props));
  const modelValue = useVModel(props, "modelValue", emits, {
    defaultValue: getDefaultValue(props),
    passive: props.modelValue === void 0,
    deep: true
  });
  function changeModelValue(value) {
    if (type.value === "single") modelValue.value = isEqual(value, modelValue.value) ? void 0 : value;
    else {
      const modelValueArray = Array.isArray(modelValue.value) ? [...modelValue.value || []] : [modelValue.value].filter(Boolean);
      if (isValueEqualOrExist(modelValueArray, value)) {
        const index = modelValueArray.findIndex((i) => isEqual(i, value));
        modelValueArray.splice(index, 1);
      } else modelValueArray.push(value);
      modelValue.value = modelValueArray;
    }
  }
  const isSingle = computed(() => type.value === "single");
  return {
    modelValue,
    changeModelValue,
    isSingle
  };
}
const [injectAccordionRootContext, provideAccordionRootContext] = /* @__PURE__ */ createContext("AccordionRoot");
var AccordionRoot_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "AccordionRoot",
  props: {
    collapsible: {
      type: Boolean,
      required: false,
      default: false
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    dir: {
      type: String,
      required: false
    },
    orientation: {
      type: String,
      required: false,
      default: "vertical"
    },
    unmountOnHide: {
      type: Boolean,
      required: false,
      default: true
    },
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false
    },
    type: {
      type: String,
      required: false
    },
    modelValue: {
      type: null,
      required: false
    },
    defaultValue: {
      type: null,
      required: false
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const { dir, disabled, unmountOnHide } = toRefs(props);
    const direction = useDirection(dir);
    const { modelValue, changeModelValue, isSingle } = useSingleOrMultipleValue(props, emits);
    const { forwardRef, currentElement: parentElement } = useForwardExpose();
    provideAccordionRootContext({
      disabled,
      direction,
      orientation: props.orientation,
      parentElement,
      isSingle,
      collapsible: props.collapsible,
      modelValue,
      changeModelValue,
      unmountOnHide
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(Primitive), {
        ref: unref(forwardRef),
        "as-child": _ctx.asChild,
        as: _ctx.as
      }, {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default", { modelValue: unref(modelValue) })]),
        _: 3
      }, 8, ["as-child", "as"]);
    };
  }
});
var AccordionRoot_default = AccordionRoot_vue_vue_type_script_setup_true_lang_default;
var AccordionItemState = /* @__PURE__ */ (function(AccordionItemState$1) {
  AccordionItemState$1["Open"] = "open";
  AccordionItemState$1["Closed"] = "closed";
  return AccordionItemState$1;
})(AccordionItemState || {});
const [injectAccordionItemContext, provideAccordionItemContext] = /* @__PURE__ */ createContext("AccordionItem");
var AccordionItem_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "AccordionItem",
  props: {
    disabled: {
      type: Boolean,
      required: false
    },
    value: {
      type: String,
      required: true
    },
    unmountOnHide: {
      type: Boolean,
      required: false,
      default: void 0
    },
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false
    }
  },
  setup(__props, { expose: __expose }) {
    const props = __props;
    const rootContext = injectAccordionRootContext();
    const open = computed(() => rootContext.isSingle.value ? props.value === rootContext.modelValue.value : Array.isArray(rootContext.modelValue.value) && rootContext.modelValue.value.includes(props.value));
    const disabled = computed(() => {
      return rootContext.disabled.value || props.disabled;
    });
    const dataDisabled = computed(() => disabled.value ? "" : void 0);
    const dataState = computed(() => open.value ? AccordionItemState.Open : AccordionItemState.Closed);
    __expose({
      open,
      dataDisabled
    });
    const { currentRef, currentElement } = useForwardExpose();
    provideAccordionItemContext({
      open,
      dataState,
      disabled,
      dataDisabled,
      triggerId: "",
      currentRef,
      currentElement,
      value: computed(() => props.value)
    });
    function handleArrowKey(e) {
      const target = e.target;
      const allCollectionItems = Array.from(rootContext.parentElement.value?.querySelectorAll("[data-reka-collection-item]") ?? []);
      const collectionItemIndex = allCollectionItems.findIndex((item) => item === target);
      if (collectionItemIndex === -1) return null;
      useArrowNavigation(e, target, rootContext.parentElement.value, {
        arrowKeyOptions: rootContext.orientation,
        dir: rootContext.direction.value,
        focus: true
      });
    }
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(CollapsibleRoot_default), {
        "data-orientation": unref(rootContext).orientation,
        "data-disabled": dataDisabled.value,
        "data-state": dataState.value,
        disabled: disabled.value,
        open: open.value,
        as: props.as,
        "as-child": props.asChild,
        "unmount-on-hide": props.unmountOnHide ?? unref(rootContext).unmountOnHide.value,
        onKeydown: withKeys(handleArrowKey, [
          "up",
          "down",
          "left",
          "right",
          "home",
          "end"
        ])
      }, {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default", { open: open.value })]),
        _: 3
      }, 8, [
        "data-orientation",
        "data-disabled",
        "data-state",
        "disabled",
        "open",
        "as",
        "as-child",
        "unmount-on-hide"
      ]);
    };
  }
});
var AccordionItem_default = AccordionItem_vue_vue_type_script_setup_true_lang_default;
var AccordionContent_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "AccordionContent",
  props: {
    forceMount: {
      type: Boolean,
      required: false
    },
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false
    }
  },
  setup(__props) {
    const props = __props;
    const rootContext = injectAccordionRootContext();
    const itemContext = injectAccordionItemContext();
    useForwardExpose();
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(CollapsibleContent_default), {
        role: "region",
        "as-child": props.asChild,
        as: _ctx.as,
        "force-mount": props.forceMount,
        "aria-labelledby": unref(itemContext).triggerId,
        "data-state": unref(itemContext).dataState.value,
        "data-disabled": unref(itemContext).dataDisabled.value,
        "data-orientation": unref(rootContext).orientation,
        style: {
          "--reka-accordion-content-width": "var(--reka-collapsible-content-width)",
          "--reka-accordion-content-height": "var(--reka-collapsible-content-height)"
        },
        onContentFound: _cache[0] || (_cache[0] = ($event) => unref(rootContext).changeModelValue(unref(itemContext).value.value))
      }, {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 8, [
        "as-child",
        "as",
        "force-mount",
        "aria-labelledby",
        "data-state",
        "data-disabled",
        "data-orientation"
      ]);
    };
  }
});
var AccordionContent_default = AccordionContent_vue_vue_type_script_setup_true_lang_default;
var AccordionHeader_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "AccordionHeader",
  props: {
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false,
      default: "h3"
    }
  },
  setup(__props) {
    const props = __props;
    const rootContext = injectAccordionRootContext();
    const itemContext = injectAccordionItemContext();
    useForwardExpose();
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(Primitive), {
        as: props.as,
        "as-child": props.asChild,
        "data-orientation": unref(rootContext).orientation,
        "data-state": unref(itemContext).dataState.value,
        "data-disabled": unref(itemContext).dataDisabled.value
      }, {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 8, [
        "as",
        "as-child",
        "data-orientation",
        "data-state",
        "data-disabled"
      ]);
    };
  }
});
var AccordionHeader_default = AccordionHeader_vue_vue_type_script_setup_true_lang_default;
var AccordionTrigger_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "AccordionTrigger",
  props: {
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false
    }
  },
  setup(__props) {
    const props = __props;
    const rootContext = injectAccordionRootContext();
    const itemContext = injectAccordionItemContext();
    itemContext.triggerId ||= useId(void 0, "reka-accordion-trigger");
    function changeItem() {
      const triggerDisabled = rootContext.isSingle.value && itemContext.open.value && !rootContext.collapsible;
      if (itemContext.disabled.value || triggerDisabled) return;
      rootContext.changeModelValue(itemContext.value.value);
    }
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(CollapsibleTrigger_default), {
        id: unref(itemContext).triggerId,
        ref: unref(itemContext).currentRef,
        "data-reka-collection-item": "",
        as: props.as,
        "as-child": props.asChild,
        "aria-disabled": unref(itemContext).disabled.value || void 0,
        "aria-expanded": unref(itemContext).open.value || false,
        "data-disabled": unref(itemContext).dataDisabled.value,
        "data-orientation": unref(rootContext).orientation,
        "data-state": unref(itemContext).dataState.value,
        disabled: unref(itemContext).disabled.value,
        onClick: changeItem
      }, {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 8, [
        "id",
        "as",
        "as-child",
        "aria-disabled",
        "aria-expanded",
        "data-disabled",
        "data-orientation",
        "data-state",
        "disabled"
      ]);
    };
  }
});
var AccordionTrigger_default = AccordionTrigger_vue_vue_type_script_setup_true_lang_default;
const _imports_0 = publicAssetsURL("/header-mark-minnesota.png");
const _sfc_main$4 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "header__mark" }, _attrs))}><img class="header__mark-img"${ssrRenderAttr("src", _imports_0)} alt="" width="48" height="48" decoding="async"></div>`);
}
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BeltramiHeaderMark.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$4, [["ssrRender", _sfc_ssrRender]]), { __name: "BeltramiHeaderMark" });
const theme = {
  "slots": {
    "root": "w-full",
    "item": "border-b border-default last:border-b-0",
    "header": "flex",
    "trigger": "group flex-1 flex items-center gap-1.5 font-medium text-sm py-3.5 outline-primary/25 focus-visible:outline-3 min-w-0 rounded-md",
    "content": "data-[state=open]:animate-[accordion-down_200ms_ease-out] data-[state=closed]:animate-[accordion-up_200ms_ease-out] data-[state=closed]:overflow-hidden focus:outline-none",
    "body": "text-sm pb-3.5",
    "leadingIcon": "shrink-0 size-5",
    "trailingIcon": "shrink-0 size-5 ms-auto group-data-[state=open]:rotate-180 transition-transform duration-200",
    "label": "text-start break-words"
  },
  "variants": {
    "disabled": {
      "true": {
        "trigger": "cursor-not-allowed opacity-75"
      }
    }
  }
};
const _sfc_main$3 = {
  __name: "UAccordion",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false },
    items: { type: Array, required: false },
    trailingIcon: { type: null, required: false },
    valueKey: { type: null, required: false, default: "value" },
    labelKey: { type: null, required: false, default: "label" },
    class: { type: null, required: false },
    ui: { type: Object, required: false },
    collapsible: { type: Boolean, required: false, default: true },
    defaultValue: { type: null, required: false },
    modelValue: { type: null, required: false },
    type: { type: String, required: false, default: "single" },
    disabled: { type: Boolean, required: false },
    unmountOnHide: { type: Boolean, required: false, default: true }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const _props = __props;
    const emits = __emit;
    const slots = useSlots();
    const props = useComponentProps("accordion", _props);
    const appConfig = useAppConfig();
    const rootProps = useForwardProps(reactivePick(props, "as", "collapsible", "defaultValue", "disabled", "modelValue", "unmountOnHide"), emits);
    const ui = computed(() => tv({ extend: theme, ...appConfig.ui?.accordion || {} })({
      disabled: props.disabled
    }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(AccordionRoot_default), mergeProps(unref(rootProps), {
        type: unref(props).type,
        "data-slot": "root",
        class: ui.value.root({ class: [unref(props).ui?.root, unref(props).class] })
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<!--[-->`);
            ssrRenderList(unref(props).items, (item, index) => {
              _push2(ssrRenderComponent(unref(AccordionItem_default), {
                key: unref(get)(item, unref(props).valueKey) ?? index,
                value: unref(get)(item, unref(props).valueKey) ?? String(index),
                disabled: item.disabled,
                "data-slot": "item",
                class: ui.value.item({ class: [unref(props).ui?.item, item.ui?.item, item.class] })
              }, {
                default: withCtx(({ open }, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(unref(AccordionHeader_default), {
                      as: "div",
                      "data-slot": "header",
                      class: ui.value.header({ class: [unref(props).ui?.header, item.ui?.header] })
                    }, {
                      default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(unref(AccordionTrigger_default), {
                            "data-slot": "trigger",
                            class: ui.value.trigger({ class: [unref(props).ui?.trigger, item.ui?.trigger], disabled: item.disabled })
                          }, {
                            default: withCtx((_3, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                ssrRenderSlot(_ctx.$slots, "leading", {
                                  item,
                                  index,
                                  open,
                                  ui: ui.value
                                }, () => {
                                  if (item.icon) {
                                    _push5(ssrRenderComponent(_sfc_main$d, {
                                      name: item.icon,
                                      "data-slot": "leadingIcon",
                                      class: ui.value.leadingIcon({ class: [unref(props).ui?.leadingIcon, item?.ui?.leadingIcon] })
                                    }, null, _parent5, _scopeId4));
                                  } else {
                                    _push5(`<!---->`);
                                  }
                                }, _push5, _parent5, _scopeId4);
                                if (unref(get)(item, unref(props).labelKey) || !!slots.default) {
                                  _push5(`<span data-slot="label" class="${ssrRenderClass(ui.value.label({ class: [unref(props).ui?.label, item.ui?.label] }))}"${_scopeId4}>`);
                                  ssrRenderSlot(_ctx.$slots, "default", {
                                    item,
                                    index,
                                    open
                                  }, () => {
                                    _push5(`${ssrInterpolate(unref(get)(item, unref(props).labelKey))}`);
                                  }, _push5, _parent5, _scopeId4);
                                  _push5(`</span>`);
                                } else {
                                  _push5(`<!---->`);
                                }
                                ssrRenderSlot(_ctx.$slots, "trailing", {
                                  item,
                                  index,
                                  open,
                                  ui: ui.value
                                }, () => {
                                  _push5(ssrRenderComponent(_sfc_main$d, {
                                    name: item.trailingIcon || unref(props).trailingIcon || unref(appConfig).ui.icons.chevronDown,
                                    "data-slot": "trailingIcon",
                                    class: ui.value.trailingIcon({ class: [unref(props).ui?.trailingIcon, item.ui?.trailingIcon] })
                                  }, null, _parent5, _scopeId4));
                                }, _push5, _parent5, _scopeId4);
                              } else {
                                return [
                                  renderSlot(_ctx.$slots, "leading", {
                                    item,
                                    index,
                                    open,
                                    ui: ui.value
                                  }, () => [
                                    item.icon ? (openBlock(), createBlock(_sfc_main$d, {
                                      key: 0,
                                      name: item.icon,
                                      "data-slot": "leadingIcon",
                                      class: ui.value.leadingIcon({ class: [unref(props).ui?.leadingIcon, item?.ui?.leadingIcon] })
                                    }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                                  ]),
                                  unref(get)(item, unref(props).labelKey) || !!slots.default ? (openBlock(), createBlock("span", {
                                    key: 0,
                                    "data-slot": "label",
                                    class: ui.value.label({ class: [unref(props).ui?.label, item.ui?.label] })
                                  }, [
                                    renderSlot(_ctx.$slots, "default", {
                                      item,
                                      index,
                                      open
                                    }, () => [
                                      createTextVNode(toDisplayString(unref(get)(item, unref(props).labelKey)), 1)
                                    ])
                                  ], 2)) : createCommentVNode("", true),
                                  renderSlot(_ctx.$slots, "trailing", {
                                    item,
                                    index,
                                    open,
                                    ui: ui.value
                                  }, () => [
                                    createVNode(_sfc_main$d, {
                                      name: item.trailingIcon || unref(props).trailingIcon || unref(appConfig).ui.icons.chevronDown,
                                      "data-slot": "trailingIcon",
                                      class: ui.value.trailingIcon({ class: [unref(props).ui?.trailingIcon, item.ui?.trailingIcon] })
                                    }, null, 8, ["name", "class"])
                                  ])
                                ];
                              }
                            }),
                            _: 2
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(unref(AccordionTrigger_default), {
                              "data-slot": "trigger",
                              class: ui.value.trigger({ class: [unref(props).ui?.trigger, item.ui?.trigger], disabled: item.disabled })
                            }, {
                              default: withCtx(() => [
                                renderSlot(_ctx.$slots, "leading", {
                                  item,
                                  index,
                                  open,
                                  ui: ui.value
                                }, () => [
                                  item.icon ? (openBlock(), createBlock(_sfc_main$d, {
                                    key: 0,
                                    name: item.icon,
                                    "data-slot": "leadingIcon",
                                    class: ui.value.leadingIcon({ class: [unref(props).ui?.leadingIcon, item?.ui?.leadingIcon] })
                                  }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                                ]),
                                unref(get)(item, unref(props).labelKey) || !!slots.default ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  "data-slot": "label",
                                  class: ui.value.label({ class: [unref(props).ui?.label, item.ui?.label] })
                                }, [
                                  renderSlot(_ctx.$slots, "default", {
                                    item,
                                    index,
                                    open
                                  }, () => [
                                    createTextVNode(toDisplayString(unref(get)(item, unref(props).labelKey)), 1)
                                  ])
                                ], 2)) : createCommentVNode("", true),
                                renderSlot(_ctx.$slots, "trailing", {
                                  item,
                                  index,
                                  open,
                                  ui: ui.value
                                }, () => [
                                  createVNode(_sfc_main$d, {
                                    name: item.trailingIcon || unref(props).trailingIcon || unref(appConfig).ui.icons.chevronDown,
                                    "data-slot": "trailingIcon",
                                    class: ui.value.trailingIcon({ class: [unref(props).ui?.trailingIcon, item.ui?.trailingIcon] })
                                  }, null, 8, ["name", "class"])
                                ])
                              ]),
                              _: 2
                            }, 1032, ["class"])
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                    if (item.content || !!slots.content || item.slot && !!slots[item.slot] || !!slots.body || item.slot && !!slots[`${item.slot}-body`]) {
                      _push3(ssrRenderComponent(unref(AccordionContent_default), {
                        "data-slot": "content",
                        class: ui.value.content({ class: [unref(props).ui?.content, item.ui?.content] })
                      }, {
                        default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            ssrRenderSlot(_ctx.$slots, item.slot || "content", {
                              item,
                              index,
                              open,
                              ui: ui.value
                            }, () => {
                              _push4(`<div data-slot="body" class="${ssrRenderClass(ui.value.body({ class: [unref(props).ui?.body, item.ui?.body] }))}"${_scopeId3}>`);
                              ssrRenderSlot(_ctx.$slots, item.slot ? `${item.slot}-body` : "body", {
                                item,
                                index,
                                open,
                                ui: ui.value
                              }, () => {
                                _push4(`${ssrInterpolate(item.content)}`);
                              }, _push4, _parent4, _scopeId3);
                              _push4(`</div>`);
                            }, _push4, _parent4, _scopeId3);
                          } else {
                            return [
                              renderSlot(_ctx.$slots, item.slot || "content", {
                                item,
                                index,
                                open,
                                ui: ui.value
                              }, () => [
                                createVNode("div", {
                                  "data-slot": "body",
                                  class: ui.value.body({ class: [unref(props).ui?.body, item.ui?.body] })
                                }, [
                                  renderSlot(_ctx.$slots, item.slot ? `${item.slot}-body` : "body", {
                                    item,
                                    index,
                                    open,
                                    ui: ui.value
                                  }, () => [
                                    createTextVNode(toDisplayString(item.content), 1)
                                  ])
                                ], 2)
                              ])
                            ];
                          }
                        }),
                        _: 2
                      }, _parent3, _scopeId2));
                    } else {
                      _push3(`<!---->`);
                    }
                  } else {
                    return [
                      createVNode(unref(AccordionHeader_default), {
                        as: "div",
                        "data-slot": "header",
                        class: ui.value.header({ class: [unref(props).ui?.header, item.ui?.header] })
                      }, {
                        default: withCtx(() => [
                          createVNode(unref(AccordionTrigger_default), {
                            "data-slot": "trigger",
                            class: ui.value.trigger({ class: [unref(props).ui?.trigger, item.ui?.trigger], disabled: item.disabled })
                          }, {
                            default: withCtx(() => [
                              renderSlot(_ctx.$slots, "leading", {
                                item,
                                index,
                                open,
                                ui: ui.value
                              }, () => [
                                item.icon ? (openBlock(), createBlock(_sfc_main$d, {
                                  key: 0,
                                  name: item.icon,
                                  "data-slot": "leadingIcon",
                                  class: ui.value.leadingIcon({ class: [unref(props).ui?.leadingIcon, item?.ui?.leadingIcon] })
                                }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                              ]),
                              unref(get)(item, unref(props).labelKey) || !!slots.default ? (openBlock(), createBlock("span", {
                                key: 0,
                                "data-slot": "label",
                                class: ui.value.label({ class: [unref(props).ui?.label, item.ui?.label] })
                              }, [
                                renderSlot(_ctx.$slots, "default", {
                                  item,
                                  index,
                                  open
                                }, () => [
                                  createTextVNode(toDisplayString(unref(get)(item, unref(props).labelKey)), 1)
                                ])
                              ], 2)) : createCommentVNode("", true),
                              renderSlot(_ctx.$slots, "trailing", {
                                item,
                                index,
                                open,
                                ui: ui.value
                              }, () => [
                                createVNode(_sfc_main$d, {
                                  name: item.trailingIcon || unref(props).trailingIcon || unref(appConfig).ui.icons.chevronDown,
                                  "data-slot": "trailingIcon",
                                  class: ui.value.trailingIcon({ class: [unref(props).ui?.trailingIcon, item.ui?.trailingIcon] })
                                }, null, 8, ["name", "class"])
                              ])
                            ]),
                            _: 2
                          }, 1032, ["class"])
                        ]),
                        _: 2
                      }, 1032, ["class"]),
                      item.content || !!slots.content || item.slot && !!slots[item.slot] || !!slots.body || item.slot && !!slots[`${item.slot}-body`] ? (openBlock(), createBlock(unref(AccordionContent_default), {
                        key: 0,
                        "data-slot": "content",
                        class: ui.value.content({ class: [unref(props).ui?.content, item.ui?.content] })
                      }, {
                        default: withCtx(() => [
                          renderSlot(_ctx.$slots, item.slot || "content", {
                            item,
                            index,
                            open,
                            ui: ui.value
                          }, () => [
                            createVNode("div", {
                              "data-slot": "body",
                              class: ui.value.body({ class: [unref(props).ui?.body, item.ui?.body] })
                            }, [
                              renderSlot(_ctx.$slots, item.slot ? `${item.slot}-body` : "body", {
                                item,
                                index,
                                open,
                                ui: ui.value
                              }, () => [
                                createTextVNode(toDisplayString(item.content), 1)
                              ])
                            ], 2)
                          ])
                        ]),
                        _: 2
                      }, 1032, ["class"])) : createCommentVNode("", true)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            });
            _push2(`<!--]-->`);
          } else {
            return [
              (openBlock(true), createBlock(Fragment, null, renderList(unref(props).items, (item, index) => {
                return openBlock(), createBlock(unref(AccordionItem_default), {
                  key: unref(get)(item, unref(props).valueKey) ?? index,
                  value: unref(get)(item, unref(props).valueKey) ?? String(index),
                  disabled: item.disabled,
                  "data-slot": "item",
                  class: ui.value.item({ class: [unref(props).ui?.item, item.ui?.item, item.class] })
                }, {
                  default: withCtx(({ open }) => [
                    createVNode(unref(AccordionHeader_default), {
                      as: "div",
                      "data-slot": "header",
                      class: ui.value.header({ class: [unref(props).ui?.header, item.ui?.header] })
                    }, {
                      default: withCtx(() => [
                        createVNode(unref(AccordionTrigger_default), {
                          "data-slot": "trigger",
                          class: ui.value.trigger({ class: [unref(props).ui?.trigger, item.ui?.trigger], disabled: item.disabled })
                        }, {
                          default: withCtx(() => [
                            renderSlot(_ctx.$slots, "leading", {
                              item,
                              index,
                              open,
                              ui: ui.value
                            }, () => [
                              item.icon ? (openBlock(), createBlock(_sfc_main$d, {
                                key: 0,
                                name: item.icon,
                                "data-slot": "leadingIcon",
                                class: ui.value.leadingIcon({ class: [unref(props).ui?.leadingIcon, item?.ui?.leadingIcon] })
                              }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                            ]),
                            unref(get)(item, unref(props).labelKey) || !!slots.default ? (openBlock(), createBlock("span", {
                              key: 0,
                              "data-slot": "label",
                              class: ui.value.label({ class: [unref(props).ui?.label, item.ui?.label] })
                            }, [
                              renderSlot(_ctx.$slots, "default", {
                                item,
                                index,
                                open
                              }, () => [
                                createTextVNode(toDisplayString(unref(get)(item, unref(props).labelKey)), 1)
                              ])
                            ], 2)) : createCommentVNode("", true),
                            renderSlot(_ctx.$slots, "trailing", {
                              item,
                              index,
                              open,
                              ui: ui.value
                            }, () => [
                              createVNode(_sfc_main$d, {
                                name: item.trailingIcon || unref(props).trailingIcon || unref(appConfig).ui.icons.chevronDown,
                                "data-slot": "trailingIcon",
                                class: ui.value.trailingIcon({ class: [unref(props).ui?.trailingIcon, item.ui?.trailingIcon] })
                              }, null, 8, ["name", "class"])
                            ])
                          ]),
                          _: 2
                        }, 1032, ["class"])
                      ]),
                      _: 2
                    }, 1032, ["class"]),
                    item.content || !!slots.content || item.slot && !!slots[item.slot] || !!slots.body || item.slot && !!slots[`${item.slot}-body`] ? (openBlock(), createBlock(unref(AccordionContent_default), {
                      key: 0,
                      "data-slot": "content",
                      class: ui.value.content({ class: [unref(props).ui?.content, item.ui?.content] })
                    }, {
                      default: withCtx(() => [
                        renderSlot(_ctx.$slots, item.slot || "content", {
                          item,
                          index,
                          open,
                          ui: ui.value
                        }, () => [
                          createVNode("div", {
                            "data-slot": "body",
                            class: ui.value.body({ class: [unref(props).ui?.body, item.ui?.body] })
                          }, [
                            renderSlot(_ctx.$slots, item.slot ? `${item.slot}-body` : "body", {
                              item,
                              index,
                              open,
                              ui: ui.value
                            }, () => [
                              createTextVNode(toDisplayString(item.content), 1)
                            ])
                          ], 2)
                        ])
                      ]),
                      _: 2
                    }, 1032, ["class"])) : createCommentVNode("", true)
                  ]),
                  _: 2
                }, 1032, ["value", "disabled", "class"]);
              }), 128))
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt/ui/dist/runtime/components/Accordion.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "InmateAvatar",
  __ssrInlineRender: true,
  props: {
    imageUrl: {},
    loading: { type: Boolean },
    alt: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["inmate-avatar", { "inmate-avatar--loading": __props.loading && !__props.imageUrl }]
      }, _attrs))}>`);
      if (__props.imageUrl) {
        _push(`<img class="inmate-avatar__photo"${ssrRenderAttr("src", __props.imageUrl)}${ssrRenderAttr("alt", __props.alt || "Booking photo")} loading="lazy" referrerpolicy="no-referrer">`);
      } else {
        _push(`<svg class="inmate-avatar__placeholder" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.5"></circle><path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>`);
      }
      if (__props.loading && !__props.imageUrl) {
        _push(`<span class="inmate-avatar__spinner" aria-hidden="true"></span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/InmateAvatar.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$2, { __name: "InmateAvatar" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "InmateChargesBlock",
  __ssrInlineRender: true,
  props: {
    charges: {},
    loading: { type: Boolean }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "charges-block" }, _attrs))}>`);
      if (__props.loading) {
        _push(`<div class="charges-block__loading">Loading charges…</div>`);
      } else if (__props.charges && __props.charges.length) {
        _push(`<div class="charges-table-wrap"><table class="charges-table"><thead><tr><th scope="col">Case #</th><th scope="col">Charge</th><th scope="col">Description</th><th scope="col">Severity</th><th scope="col">Court</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(__props.charges, (c, i) => {
          _push(`<tr><td>${ssrInterpolate(c.caseNumber)}</td><td>${ssrInterpolate(c.charge)}</td><td>${ssrInterpolate(c.description)}</td><td>${ssrInterpolate(c.severity || "—")}</td><td>${ssrInterpolate(c.courtBranch || "—")}</td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      } else {
        _push(`<p class="charges-block__empty">No charges listed for this booking.</p>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/InmateChargesBlock.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$1, { __name: "InmateChargesBlock" });
function filtersToQuery(f) {
  const q = {};
  const last = f.lastName.trim();
  const first = f.firstName.trim();
  const dob = f.dob.trim();
  if (last) q.last_name = last;
  if (first) q.first_name = first;
  if (f.gender) q.gender = f.gender;
  if (dob) q.dob = dob;
  return q;
}
function useBeltramiApi() {
  const config = useRuntimeConfig();
  const base = () => String(config.public.apiBase).replace(/\/$/, "");
  const rosterTimeoutMs = 12e4;
  const detailTimeoutMs = 9e4;
  async function fetchInmates(filters) {
    const params = new URLSearchParams({
      ...filters,
      include_images: "false"
    });
    return await $fetch(
      `${base()}/inmates?${params}`,
      { timeout: rosterTimeoutMs }
    );
  }
  async function fetchInmateDetail(bookId, rowIndex, filters, searchToken) {
    const params = new URLSearchParams({
      ...filters,
      book_id: bookId,
      row_index: String(rowIndex)
    });
    if (searchToken) params.set("search_token", searchToken);
    return await $fetch(`${base()}/inmate-detail?${params}`, {
      timeout: detailTimeoutMs
    });
  }
  async function fetchInmatePhotosBatch(items, filters, searchToken) {
    const res = await $fetch(
      `${base()}/inmate-details`,
      {
        method: "POST",
        body: {
          ...filters,
          search_token: searchToken,
          photos_only: true,
          items
        },
        timeout: detailTimeoutMs
      }
    );
    return res.results;
  }
  return { fetchInmates, fetchInmateDetail, fetchInmatePhotosBatch };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { fetchInmateDetail } = useBeltramiApi();
    const lastName = ref("");
    const firstName = ref("");
    const gender = ref("");
    const dob = ref("");
    const loading = ref(false);
    const rows = ref([]);
    const searchToken = ref(null);
    const selectedBookId = ref(void 0);
    const resultsLine = ref("");
    const message = ref(null);
    ref(null);
    const accordionItems = computed(
      () => rows.value.map((row) => ({
        ...row,
        label: row.displayName,
        value: row.bookId
      }))
    );
    function filterParams() {
      return filtersToQuery({
        lastName: lastName.value,
        firstName: firstName.value,
        gender: gender.value,
        dob: dob.value
      });
    }
    function updatePhotoProgress() {
      const total = rows.value.length;
      const done = rows.value.filter((row) => !row.photoLoading).length;
      resultsLine.value = total + " record" + (total === 1 ? "" : "s") + " · photos " + done + "/" + total;
    }
    function applyDetail(row, detail) {
      row.imageUrl = detail.imageUrl ?? row.imageUrl;
      if (detail.bookingDate) row.bookingDate = detail.bookingDate;
      row.charges = detail.charges;
      row.photoLoading = false;
      row.detailLoading = false;
    }
    async function loadRowDetail(row) {
      if (row.detailLoading || row.charges) return;
      row.detailLoading = true;
      try {
        const detail = await fetchInmateDetail(
          row.bookId,
          row.rowIndex,
          filterParams(),
          searchToken.value
        );
        applyDetail(row, detail);
      } catch {
        row.detailLoading = false;
      } finally {
        updatePhotoProgress();
      }
    }
    async function onAccordionChange(bookId) {
      if (!bookId) return;
      const row = rows.value.find((item) => item.bookId === bookId);
      if (row) await loadRowDetail(row);
    }
    function chargesSummary(row) {
      if (row.detailLoading) return "Loading…";
      if (!row.charges) return "Tap to view";
      if (!row.charges.length) return "None listed";
      const n = row.charges.length;
      return n + " charge" + (n === 1 ? "" : "s");
    }
    watch(selectedBookId, (bookId) => {
      void onAccordionChange(bookId);
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BeltramiHeaderMark = __nuxt_component_0;
      const _component_UAccordion = _sfc_main$3;
      const _component_InmateAvatar = __nuxt_component_2;
      const _component_InmateChargesBlock = __nuxt_component_3;
      _push(`<div${ssrRenderAttrs(_attrs)}><header class="header"><div class="header__inner"><div class="header__brand">`);
      _push(ssrRenderComponent(_component_BeltramiHeaderMark, null, null, _parent));
      _push(`<div><h1 class="header__title">Inmate List Beltrami</h1><p class="header__subtitle">Beltrami County, Minnesota</p></div></div><p class="header__note"> Search the current roster. Expand a row to view charges inline. </p></div></header><main class="main"><section class="panel search-panel" aria-labelledby="search-heading"><h2 id="search-heading" class="panel__title">Search</h2><form class="search-form"><div class="field-grid"><label class="field"><span class="field__label">Last name</span><input${ssrRenderAttr("value", unref(lastName))} type="text" name="last_name" autocomplete="family-name" placeholder="e.g. Smith"></label><label class="field"><span class="field__label">First name</span><input${ssrRenderAttr("value", unref(firstName))} type="text" name="first_name" autocomplete="given-name" placeholder="Optional"></label><label class="field"><span class="field__label">Gender</span><select name="gender"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(gender)) ? ssrLooseContain(unref(gender), "") : ssrLooseEqual(unref(gender), "")) ? " selected" : ""}>Match form default</option><option value="U"${ssrIncludeBooleanAttr(Array.isArray(unref(gender)) ? ssrLooseContain(unref(gender), "U") : ssrLooseEqual(unref(gender), "U")) ? " selected" : ""}>Unknown</option><option value="M"${ssrIncludeBooleanAttr(Array.isArray(unref(gender)) ? ssrLooseContain(unref(gender), "M") : ssrLooseEqual(unref(gender), "M")) ? " selected" : ""}>Male</option><option value="F"${ssrIncludeBooleanAttr(Array.isArray(unref(gender)) ? ssrLooseContain(unref(gender), "F") : ssrLooseEqual(unref(gender), "F")) ? " selected" : ""}>Female</option></select></label><label class="field"><span class="field__label">Birth year</span><input${ssrRenderAttr("value", unref(dob))} type="text" name="dob" inputmode="numeric" maxlength="4" placeholder="yyyy"></label></div><div class="search-form__actions"><button type="submit" class="btn btn--primary"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""}><span class="btn__text">Search</span>`);
      if (unref(loading)) {
        _push(`<span class="btn__spinner" aria-hidden="true"></span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</button><button type="button" class="btn btn--ghost"> Clear </button></div></form></section><section class="panel results-panel" aria-live="polite"><div class="results-head"><h2 class="panel__title">Results</h2><p class="results-count">${ssrInterpolate(unref(resultsLine))}</p></div>`);
      if (unref(message)) {
        _push(`<div class="${ssrRenderClass([
          unref(message).kind === "error" ? "results-message--error" : "results-message--info",
          "results-message"
        ])}">${ssrInterpolate(unref(message).text)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(rows).length) {
        _push(`<div class="results-accordion"><div class="inmate-row inmate-row--head" aria-hidden="true"><span class="inmate-row__photo"></span><span class="inmate-row__name">Name</span><span class="inmate-row__cell">Booking #</span><span class="inmate-row__cell">Cell</span><span class="inmate-row__cell">Booking Date</span><span class="inmate-row__cell inmate-row__cell--narrow">Age</span><span class="inmate-row__cell inmate-row__cell--narrow">Sex</span><span class="inmate-row__cell inmate-row__cell--narrow">Race</span><span class="inmate-row__cell">Charges</span><span class="inmate-row__cell">SPN</span></div>`);
        _push(ssrRenderComponent(_component_UAccordion, {
          modelValue: unref(selectedBookId),
          "onUpdate:modelValue": ($event) => isRef(selectedBookId) ? selectedBookId.value = $event : null,
          items: unref(accordionItems),
          "value-key": "bookId",
          "unmount-on-hide": false,
          ui: {
            root: "space-y-2",
            item: "border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--surface-2)] overflow-hidden data-[state=open]:ring-1 data-[state=open]:ring-[var(--accent-soft)]",
            trigger: "inmate-accordion-trigger w-full hover:bg-[rgba(45,74,62,0.04)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent)]",
            label: "inmate-accordion-label",
            content: "border-t border-[var(--border)] bg-[var(--surface)]",
            body: "p-0"
          }
        }, {
          default: withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="inmate-row inmate-row--trigger"${_scopeId}><div${ssrRenderAttr("data-book-id", item.bookId)} class="inmate-row__photo"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_InmateAvatar, {
                "image-url": item.imageUrl,
                loading: item.photoLoading,
                alt: `Booking photo for ${item.displayName}`
              }, null, _parent2, _scopeId));
              _push2(`</div><span class="inmate-row__name"${_scopeId}>${ssrInterpolate(item.displayName)}</span><span class="inmate-row__cell"${_scopeId}>${ssrInterpolate(item.bookingNumber)}</span><span class="inmate-row__cell"${_scopeId}>${ssrInterpolate(item.cellLocation)}</span><span class="inmate-row__cell"${_scopeId}>${ssrInterpolate(item.bookingDate || "—")}</span><span class="inmate-row__cell inmate-row__cell--narrow"${_scopeId}>${ssrInterpolate(item.age != null ? item.age : "—")}</span><span class="inmate-row__cell inmate-row__cell--narrow"${_scopeId}>${ssrInterpolate(item.sex)}</span><span class="inmate-row__cell inmate-row__cell--narrow"${_scopeId}>${ssrInterpolate(item.race)}</span><span class="inmate-row__cell inmate-row__cell--muted"${_scopeId}>${ssrInterpolate(chargesSummary(item))}</span><span class="inmate-row__cell"${_scopeId}>${ssrInterpolate(item.spn)}</span></div>`);
            } else {
              return [
                createVNode("div", { class: "inmate-row inmate-row--trigger" }, [
                  createVNode("div", {
                    "data-book-id": item.bookId,
                    class: "inmate-row__photo"
                  }, [
                    createVNode(_component_InmateAvatar, {
                      "image-url": item.imageUrl,
                      loading: item.photoLoading,
                      alt: `Booking photo for ${item.displayName}`
                    }, null, 8, ["image-url", "loading", "alt"])
                  ], 8, ["data-book-id"]),
                  createVNode("span", { class: "inmate-row__name" }, toDisplayString(item.displayName), 1),
                  createVNode("span", { class: "inmate-row__cell" }, toDisplayString(item.bookingNumber), 1),
                  createVNode("span", { class: "inmate-row__cell" }, toDisplayString(item.cellLocation), 1),
                  createVNode("span", { class: "inmate-row__cell" }, toDisplayString(item.bookingDate || "—"), 1),
                  createVNode("span", { class: "inmate-row__cell inmate-row__cell--narrow" }, toDisplayString(item.age != null ? item.age : "—"), 1),
                  createVNode("span", { class: "inmate-row__cell inmate-row__cell--narrow" }, toDisplayString(item.sex), 1),
                  createVNode("span", { class: "inmate-row__cell inmate-row__cell--narrow" }, toDisplayString(item.race), 1),
                  createVNode("span", { class: "inmate-row__cell inmate-row__cell--muted" }, toDisplayString(chargesSummary(item)), 1),
                  createVNode("span", { class: "inmate-row__cell" }, toDisplayString(item.spn), 1)
                ])
              ];
            }
          }),
          trailing: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) ;
            else {
              return [];
            }
          }),
          content: withCtx(({ item }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_InmateChargesBlock, {
                charges: item.charges,
                loading: item.detailLoading
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_InmateChargesBlock, {
                  charges: item.charges,
                  loading: item.detailLoading
                }, null, 8, ["charges", "loading"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section><footer class="footer"><p> This app reads the same public Beltrami County inmate locator. It is not an official government site. Information may be incomplete or out of date; confirm with the county if it matters. </p></footer></main></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CnhZDGNe.mjs.map
